require 'rhet-butler/stasis'
module RhetButler
  module Stasis
    class HTTPLoader
      def initialize
        require 'net/http'
      end

      def load(source_uri)
        response = Net::HTTP.get_response(URI(source_uri.to_s))
        Document.new.tap do |doc|
          doc.body = response.body
          doc.source_uri = source_uri
          doc.type = response["Content-Type"]
        end
      end
    end
  end
end
