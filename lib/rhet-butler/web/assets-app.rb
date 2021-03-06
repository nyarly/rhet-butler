module RhetButler
  module Web
    class AssetsApp
      def initialize(file_manager)
        @file_manager = file_manager
      end

      attr_reader :file_manager

      class AssetsContext
        def initialize(template_handler)
          @template_handler = template_handler
        end

        def render(path, locals = nil)
          template = @template_handler.find(path).contents
          if template.respond_to? :render
            template.render(self, locals)
          else
            template
          end
        end
      end

      def template_handler
        file_manager.base_assets(::Tilt::Cache.new)
      end

      def assets_context
        AssetsContext.new(template_handler)
      end

      def call(env)
        asset_path = env["PATH_INFO"]
        asset_path.sub!(/^\//,"")
        extension = asset_path.sub(/.*[.]/, ".")

        mime_type = Rack::Mime.mime_type(extension, "text/plain")
        [200, {'Content-Type' => mime_type}, [assets_context.render(asset_path)]]
      rescue Object => ex
        puts ex
        raise
      end
    end

    class MemoizedAssetsApp < AssetsApp
      def template_handler
        @template_handler ||= super
      end

      def assets_context
        @assets_contenxt ||= super
      end
    end
  end
end
