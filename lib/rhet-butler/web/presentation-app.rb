require 'rhet-butler/html-generator'
require 'rhet-butler/slide-loader'
require 'rhet-butler/template-handler'

module RhetButler
  module Web
    class PresentationApp
      def initialize(valise, configuration)
        @valise = valise
        @configuration = configuration
      end

      attr_reader :configuration

      def template_handler
        @template_handler ||= TemplateHandler.new(@configuration.files, "templates")
      end

      def slides
        @slides ||=
          begin
            slide_loader = SlideLoader.new(@valise, @configuration)
            slide_loader.load_slides
          end
      end

      def html_generator
        @html_generator ||=
          begin
            generator = HTMLGenerator.new(@configuration, template_handler)
            generator.slides = slides
            generator
          end
      end

      def call(env)
        body = html_generator.html
        [200, {'Content-Type' => "text/html"}, [body]]
      end
    end
  end
end
