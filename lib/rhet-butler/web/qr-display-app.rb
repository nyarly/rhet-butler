require 'rqrcode'

module RhetButler
  module Web
    class QrDisplayApp
      def initialize(files, path)
        @config = files.aspect_config(:presenter)
        @templates = files.aspect_templates(:presenter)
        @path = path
      end

      attr_reader :template_handler

      def call(env)
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
        generator = HTMLGenerator.new(@config, @templates)
        [200, {'Content-Type' => mime_type}, [
          generator.render("presenter-qr.html", qr, :view_url => view_url, :presenter_url => url)
        ]]
      end
    end
  end
end
