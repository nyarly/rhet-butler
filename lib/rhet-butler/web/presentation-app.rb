require 'rhet-butler/html-generator'
require 'rhet-butler/slide-loader'

module RhetButler
  module Web
    class PresentationApp
      def initialize(aspect, file_manager)
        @file_manager = file_manager
        @aspect = aspect
      end

      def configuration
        @file_manager.aspect_config(@aspect)
      end

      def template_handler
        @file_manager.aspect_templates(@aspect)
      end

      def slides_valise
        @file_manager.slide_files
      end

      def root_step
        @root_step ||=
          begin
            slide_loader = SlideLoader.new(slides_valise, configuration)
            slide_loader.load_slides
          end
      end

      def html_generator
        @html_generator ||=
          begin
            generator = HTMLGenerator.new(configuration, template_handler)
            generator.root_step = root_step
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
