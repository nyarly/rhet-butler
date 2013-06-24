module RhetButler
  module Web
    class AssetsApp
      def initialize(file_manager)
        @template_handler = file_manager.base_assets
      end

      attr_reader :template_handler

      class AssetsContext
        def render(path, locals = nil)
          template = @template_handler.find(path).contents
          if template.respond_to? :render
            template.render(self, locals)
          else
            template
          end
        end
      end

      def assets_context
        @context ||=
          begin
            context = AssetsContext.new
            context.instance_variable_set("@template_handler", template_handler)
            context
          end
      end

      def call(env)
        asset_path = env["PATH_INFO"]
        asset_path.sub!(/^\//,"")
        extension = asset_path.sub(/.*[.]/, ".")

        mime_type = Rack::Mime.mime_type(extension, "text/plain")
        [200, {'Content-Type' => mime_type}, [assets_context.render(asset_path)]]
      end
    end
  end
end
