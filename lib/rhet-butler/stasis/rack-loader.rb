require 'rhet-butler/stasis'
module RhetButler
  module Stasis
    class RackLoader
      def initialize(url, app)
        require 'stringio'
        @url = url
        @app = app
      end

      def root_uri
        @root_uri ||= Addressable::URI.parse(@url).tap do |root_url|
          root_url.path = ""
        end
      end

      def server_name
        root_uri.host
      end

      def load(source_uri)
        doc = Document.new
        doc.source_uri = source_uri

        source_uri = root_uri.join(source_uri).route_from(root_uri).to_s
        source_uri = "/" if source_uri == "#"

        env = {
          "REQUEST_METHOD" => "GET",
          "SCRIPT_NAME" => "",
          "PATH_INFO" => source_uri,
          "QUERY_STRING" => "",
          "SERVER_NAME" => server_name,
          "rack.errors" => StringIO.new,
          "rack.input" => StringIO.new,
          "rack.url_scheme" => "http",
          "rack.version" => Rack::VERSION,
          "rack.multithread" => false,
          "rack.multiprocess" => false,
          "rack.runonce" => false,
          "rack.hijack?" => false,
        }

        response = @app.call(env)

        code, headers, body = *response

        unless code == 200
          raise "Bad response from local server: #{response[0..1].inspect} body: #{response[2].to_a.join.length}"
        end
        doc.type = headers["Content-Type"]
        doc.body = body.to_a.join("")
        return doc
      end
    end
  end
end
