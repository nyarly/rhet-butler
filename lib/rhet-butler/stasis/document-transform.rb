require 'rhet-butler/stasis'
module RhetButler
  module Stasis
    class DocumentTransform
      def self.register(type)
        TransformQueue.register(type, self)
      end

      attr_accessor :document, :queue, :target_path

      def document_source
        @document.source_uri
      end

      def save_document
        @queue.write_document(target_path, render_document)
      end

      def process
        parse_document

        translate_links

        save_document
      end

      def get_link_translation(link)
        queue.target_for(document, document_source).route_to(queue.target_for(document, link))
      end
    end
  end
end
