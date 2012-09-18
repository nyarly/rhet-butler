require 'rhet-butler/html-generator'
require 'rhet-butler/arrangement'
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
        @template_handler ||= TemplateHandler.new(@valise, "templates")
      end

      def slides
        @slides ||= Arrangement[@configuration.arrangement].new(@valise.load_slides(@configuration.root_slide))
      end

      def html_generator
        @html_generator ||=
          begin
            generator = HTMLGenerator.new(template_handler)
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
