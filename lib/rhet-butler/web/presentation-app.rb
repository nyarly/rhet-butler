require 'rhet-butler/html-generator'
require 'rhet-butler/slide-loader'

module RhetButler
  module Web
    class PresentationApp
      def initialize(valise, templates, configuration)
        @valise = valise
        @template_handler = templates
        @configuration = configuration
      end

      attr_reader :configuration, :template_handler

      def slides
        @slides ||=
          begin
            slide_loader = SlideLoader.new(@valise, configuration)
            slide_loader.load_slides
          end
      end

      def html_generator
        @html_generator ||=
          begin
            generator = HTMLGenerator.new(configuration, template_handler)
            generator.slides = slides
            generator
          end
      end

      def body
        @body ||= html_generator.render(configuration.root_slide_template)
      end

      def call(env)
        [200, {'Content-Type' => "text/html"}, [body]]
      end
    end
  end
end
