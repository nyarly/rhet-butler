require 'rhet-butler/template-handler'
require 'rqrcode'

module RhetButler
  module Web
    class QrDisplayApp
      def initialize(valise, path)
        @valise = valise
        @path = path
      end

      def template_handler
        @template_handler ||= TemplateHandler.new(@valise, "templates")
      end

      def call(env)
        require 'pp'
        pp env
        url = [env["rack.url_scheme"], "://"]
        if env["HTTP_HOST"].nil? or env["HTTP_HOST"].empty?
          url << env["SERVER_NAME"]
          url << ":"
          url << env["SERVER_PORT"]
        else
          url << env["HTTP_HOST"]
        end
        view_url = url.join("") + "/"

        url << @path
        url = url.join("")
        qr = RQRCode::QRCode.new(url, :size => 5)

        mime_type = "text/html"
        [200, {'Content-Type' => mime_type}, [template_handler.render("presenter-qr.html", qr){|vars|
          vars[:view_url] = view_url
          vars[:presenter_url] = url
        }]]
      end
    end
  end
end
