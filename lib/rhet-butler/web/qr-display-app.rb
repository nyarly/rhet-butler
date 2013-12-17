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

      QRItem = Struct.new(:qr, :view_url, :presenter_url)

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
        qr_item = QRItem.new(qr, view_url, url)
        generator = HTMLGenerator.new(@config, @templates)
        [200, {'Content-Type' => mime_type}, [
          generator.render("presenter-qr.html", qr_item)
        ]]
      end
    end
  end
end
