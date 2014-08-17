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

      def template_cache
        ::Tilt::Cache.new
      end

      def template_handler
        @file_manager.aspect_templates(@aspect, template_cache)
      end

      def slides_valise
        @file_manager.slide_files
      end

      def assets_valise
        @file_manager.base_assets(configuration.template_cache)
      end

      def root_step
        slide_loader = SlideLoader.new(slides_valise, assets_valise, configuration)
        slide_loader.load_slides
      end

      def html_generator
        generator = HTMLGenerator.new(configuration, template_handler)
        generator.root_step = root_step
        generator
      end

      def body
        html_generator.render(configuration.root_slide_template)
      end

      def call(env)
        [200, {'Content-Type' => "text/html"}, [body]]
      end
    end

    class MemoizedPresentationApp < PresentationApp
      def configuration
        @configuration ||= super
      end

      def body
        @body ||= super
      end
    end
  end
end
