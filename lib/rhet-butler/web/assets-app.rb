require 'rhet-butler/template-handler'

module RhetButler
  module Web
    class AssetsApp
      def initialize(valise)
        @valise = valise
      end

      def template_handler
        @template_handler ||= TemplateHandler.new(@valise, "assets")
      end

      def call(env)
        asset_path = env["PATH_INFO"]
        asset_path.sub!(/^\//,"")
        extension = asset_path.sub(/.*[.]/, ".")

        mime_type = Rack::Mime.mime_type(extension, "text/plain")
        [200, {'Content-Type' => mime_type}, [template_handler.render(asset_path, nil)]]
      end
    end
  end
end
