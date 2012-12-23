require 'rack/builder'
require 'rack/handler'
require 'thin'
require 'rack/sockjs'
require 'rhet-butler/web/presentation-app'
require 'rhet-butler/web/assets-app'
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
          @queue.enqueue(message)
        end
      end

      class SlideMessageQueue
        def initialize
          @listeners = {}
        end

        def inspect
          "<<#{self.class.name} Listeners: #{@listeners.keys.length}>>"
        end

        def subscribe(session)
          @listeners[session] = true
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

      def app
        sockjs_options = {
          :sockjs_url => "/assets/javascript/sockjs-0.2.1.js",
          :queue => SlideMessageQueue.new
        }

        slides = slide_files(@slide_sources)

        viewer_app = presentation_app(slides, viewer_config)
        presenter_app = presentation_app(slides, presenter_config)

        Rack::Builder.new do
          SockJS.debug!

          map "/live/follower" do
            run Rack::SockJS.new(FollowerSession, sockjs_options)
          end

          map "/live/leader" do
            use Rack::Auth::Basic, "Rhet Butler Presenter" do |user, pass|
              "secret" == pass
            end
            run Rack::SockJS.new(LeaderSession, sockjs_options)
          end

          use Rack::ShowExceptions

          map "/assets" do
            run AssetsApp.new(slides)
          end

          map "/presenter" do
            use Rack::Auth::Basic, "Rhet Butler Presenter" do |user, pass|
              "secret" == pass
            end
            run presenter_app
          end

          run viewer_app
        end
      end

      def start
        configuration = load_config(current_directory + base_config_set.sub_set("common"))

        puts "Starting server on http://127.0.0.1:#{configuration.serve_port}/"
        EM.run do
          thin = Rack::Handler.get("thin")
          thin.run(app.to_app, :Port => configuration.serve_port) do |server|
            server.threaded = true
          end
        end
      end
    end
  end
end
