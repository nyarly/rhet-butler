require 'rhet-butler/stasis'
module RhetButler
  module Stasis
    class TranformationOrder
      attr_accessor :source_link, :target_link, :storage_target

      def initialize(source_link, target_link, storage_target)
        @source_link, @target_link, @storage_target =
          source_link, target_link, storage_target
      end
    end

    class TransformQueue
      class << self
        def transformers
          @transformers ||= {}
        end

        def register(type, klass)
          transformers[type] = klass
        end

        def lookup(type)
          transformers.fetch(type) do
            transformers.fetch(nil)
          end
        end
      end

      def initialize
        @list = []
        @hash = {}
      end
      attr_accessor :loader, :writer, :mapping

      def add(source)
        store_to = mapping.storage_for(source)
        link_target = mapping.target_link_for(source)
        add_mapping(source, link_target, store_to)
        return link_target
      end

      def add_mapping(source_uri, target_uri, target_path)
        @hash[source_uri] = target_uri
        @list << TranformationOrder.new(source_uri, target_uri, target_path)
      end

      def transform_class(type)
        self.class.lookup(type)
      end

      def target_for(document, link)
        link = canonicalize_uri(mapping.absolute_uri(document.source_uri).join(link))
        @hash.fetch(link) do
          add(link)
        end
      end

      def canonicalize_uri(string)
        uri = Addressable::URI.parse(string).normalize
        uri.fragment = nil
        uri
      end

      def load_document(source_path)
        loader.load(canonicalize_uri(source_path))
      end

      def write_document(target_path, document_body)
        writer.write(target_path, document_body)
      end

      def go
        until @list.empty?
          order = @list.pop

          doc = load_document(order.source_link)
          transformer = transform_class(doc.type).new
          transformer.queue = self
          transformer.document = doc
          transformer.target_path = order.storage_target
          transformer.process
        end
      end
    end
  end
end
