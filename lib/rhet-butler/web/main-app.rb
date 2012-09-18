require 'rack/builder'
require 'rack/handler'
require 'thin'
require 'rhet-butler/web/presentation-app'
require 'rhet-butler/web/assets-app'

module RhetButler
  module Web
    class MainApp

      def initialize(valise, configuration)
        @valise = valise
        @configuration = configuration
      end
      attr_reader :valise, :configuration

      def app
        valise = self.valise
        configuration = self.configuration

        Rack::Builder.new do
          use Rack::Lint
          use Rack::ShowExceptions

          map "/assets" do
            run AssetsApp.new(valise)
          end

          run PresentationApp.new(valise, configuration)
        end
      end

      def start
        puts "Starting server on http://127.0.0.1:#{configuration.serve_port}/"
        EM.run do
          thin = Rack::Handler.get("thin")
          thin.run(app.to_app, :Port => configuration.serve_port)
        end
      end
    end
  end
end
