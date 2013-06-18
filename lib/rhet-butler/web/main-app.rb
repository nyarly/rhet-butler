require 'rack/builder'
require 'rack/handler'
require 'thin'
require 'rack/sockjs'
require 'rhet-butler/web/presentation-app'
require 'rhet-butler/web/assets-app'
require 'rhet-butler/web/qr-display-app'
require 'rhet-butler/file-manager'

module RhetButler
  module Web
    class MainApp
      include RhetButler::FileManager

      def initialize(slide_sources, root_slide)
        @slide_sources = slide_sources
        @root_slide = root_slide
      end

      class FollowerSession < SockJS::Session
        def initialize(connection)
          super
          @queue = connection.options[:queue]
        end

        def opened
          @queue.subscribe(self)
        end

        def close(*args)
          @queue.unsubscribe(self)
          super
        end
      end

      class LeaderSession < SockJS::Session
        def initialize(connection)
          super
          @queue = connection.options[:queue]
        end

        def process_message(message)
          @queue.current_slide = message
          @queue.enqueue(message)
        end
      end

      class SlideMessageQueue
        attr_accessor :current_slide
        def initialize
          @listeners = {}
        end

        def inspect
          "<<#{self.class.name} Listeners: #{@listeners.keys.length}>>"
        end

        def subscribe(session)
          @listeners[session] = true
          session.send(current_slide) unless current_slide.nil?
        end

        def unsubscribe(session)
          @listeners.delete_key(session)
        end

        def enqueue(message)
          @listeners.keys.each do |session|
            session.send(message)
          end
        end
      end

      def load_config(files)
        configuration = Configuration.new(files)
        configuration.root_slide = @root_slide unless @root_slide.nil?
        return configuration
      end

      # Notes re filesets config and slides:
      # All PresentationApps need the same slides but different configs
      # (including templates, etc.)
      #
      # So: there need to be TWO valises:
      #
      # 1) The slides valise - including slidesets that might get included -
      # this one is common between all Apps
      #
      # 2) The config valise - there should be a "common" base to this, and a
      # role specific variation.  Built special, because the /viewer app should
      # allow for config in the root of the project etc, while the /presenter
      # version should require special config (since I'm assuming a boring
      # presentation view)
      #
      def presentation_app(slides, config_files)
        configuration = load_config(config_files)

        PresentationApp.new(slides, configuration)
      end

      def slides
        slide_files(@slide_sources)
      end

      def viewer_app
        @viewer_app ||= presentation_app(slides, viewer_config)
      end

      def presenter_app
        @presenter_app ||= presentation_app(slides, presenter_config)
      end

      def check
        viewer_app.html_generator.html
        presenter_app.html_generator.html
      end

      class SelectiveAuth < Rack::Auth::Basic
        def call(env)
          #XXX This is to work around a Chrome bug:
          #https://code.google.com/p/chromium/issues/detail?id=123862
          #When fixed upstream, this'll come out and we'll stop supporting old
          #versions of Chrome.
          #As is, under SSL this is kinda secure (i.e. not at all) because the
          #WS details are secret
          if /^http/ =~ env["rack.url_scheme"] and env["HTTP_UPGRADE"] != "websocket"
            super
          else
            @app.call(env)
          end
        end
      end

      def build_authentication_block(presenter_config)
        creds_config = load_config(presenter_config)
        return (proc do |user, pass|
          creds_config.username == user &&
            creds_config.password == pass
        end)
      end

      def app
        sockjs_options = {
          :sockjs_url => "/assets/javascript/sockjs-0.2.1.js",
          :queue => SlideMessageQueue.new
        }

        viewer_app = self.viewer_app
        presenter_app = self.presenter_app
        slides = self.slides
        presenter_config = self.presenter_config
        auth_validation = build_authentication_block(presenter_config)

        Rack::Builder.new do
          #SockJS.debug!

          map "/live/follower" do
            run Rack::SockJS.new(FollowerSession, sockjs_options)
          end

          map "/live/leader" do
            use SelectiveAuth, "Rhet Butler Presenter", &auth_validation
            run Rack::SockJS.new(LeaderSession, sockjs_options)
          end

          use Rack::ShowExceptions

          map "/assets" do
            run AssetsApp.new(slides)
          end

          map "/qr" do
            run QrDisplayApp.new(presenter_config, "/presenter")
          end

          map "/presenter" do
            use SelectiveAuth, "Rhet Butler Presenter", &auth_validation
            run presenter_app
          end

          run viewer_app
        end
      end

      def start
        configuration = load_config(current_directory + base_config_set.sub_set("common"))

        puts "Starting server. Try one of these:"
        require 'system/getifaddrs'
        System.get_all_ifaddrs.each do |interface|
          puts "  http://#{interface[:inet_addr].to_s}:#{configuration.serve_port}/"
          puts "  http://#{interface[:inet_addr].to_s}:#{configuration.serve_port}/qr"
        end
        EM.run do
          thin = Rack::Handler.get("thin")
          thin.run(app.to_app, :Host => "0.0.0.0", :Port => configuration.serve_port) do |server|
            server.threaded = true
          end
        end
      end
    end
  end
end
