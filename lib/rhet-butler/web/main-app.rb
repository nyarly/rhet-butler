require 'rack/builder'
require 'rack/handler'
require 'thin'
require 'rhet-butler/web/presentation-app'
require 'rhet-butler/web/assets-app'
require 'rack/sockjs'

module RhetButler
  module Web
    class MainApp

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

      def presentation_app(role)
        files = FileManager.build([role, "common"], @slide_sources)
        configuration = load_config(files)

        PresentationApp.new(files, configuration)
      end

      def app
        sockjs_options = {
          :sockjs_url => "/assets/javascript/sockjs-0.2.1.js",
          :queue => SlideMessageQueue.new
        }

        viewer_app = presentation_app("viewer")
        presenter_app = presentation_app("presenter")
        valise = FileManager.build(["viewer", "common"], @slide_sources)

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
            run AssetsApp.new(valise)
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
        base_files = FileManager.build(["common"], @slide_sources)
        configuration = load_config(base_files)

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
