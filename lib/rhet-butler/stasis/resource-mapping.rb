require 'rhet-butler/stasis'
module RhetButler
  module Stasis
    class ResourceMapping
      def initalize(queue)
        @queue = queue
      end

      attr_writer :default_uri

      def default_uri
        Addressable::URI.parse(@default_uri)
      end

      def absolute_uri(uri)
        uri = default_uri.join(uri)
        if uri == default_uri
          uri = uri.join("index.html")
        end
        return uri
      end

      def relative_uri(uri)
        default_uri.route_to(absolute_uri(uri))
      end

      def localized(uri)
        return "/index.html" if uri == "/"

        uri = relative_uri(uri)

        if uri.relative?
          return uri.to_s
        end

        query_values = uri.query_values(Array)
        [
          [uri.host, uri.port, uri.user, uri.scheme == 'http' ? nil : uri.scheme].compact.join("-"),
          uri.path,
          (query_values ? query_values.map{|pair| pair.join("=")}.join(",") : nil)
        ].compact.map do |part|
          part.sub(%r{\A/},'').sub(%r{/\Z},'')
        end.join("/")
      end

      def storage_for(uri)
        localized(uri).sub(%r{^/},'')
      end

      def target_link_for(uri)
        default_uri.join(storage_for(uri))
      end
    end
  end
end
