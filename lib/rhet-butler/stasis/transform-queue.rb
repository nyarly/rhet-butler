require 'rhet-butler/stasis'
module RhetButler
  module Stasis
    class TranformationOrder
      attr_accessor :source_link, :target_link, :storage_target

      def initialize(document, source_link, target_link, storage_target)
        @document, @source_link, @target_link, @storage_target =
          document, source_link, target_link, storage_target
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

      def add(document, source)
        store_to = mapping.storage_for(source)
        link_target = mapping.target_link_for(source)
        add_mapping(document, source, link_target, store_to)
        return link_target
      end

      def add_mapping(document, source_uri, target_uri, target_path)
        @hash[source_uri] = target_uri
        @list << TranformationOrder.new(document, source_uri, target_uri, target_path)
      end

      def transform_class(type)
        self.class.lookup(type)
      end

      def target_for(document, link)
        link = Addressable::URI.parse(link)
        case link.scheme
        when 'data'
          link
        else
          link = canonicalize_uri(mapping.absolute_uri(document.source_uri).join(link))
          @hash.fetch(link) do
            add(document, link)
          end
        end
      end

      def canonicalize_uri(string)
        uri = Addressable::URI.parse(string).normalize
        uri.fragment = nil
        uri
      end

      def load_document(order)
        loader.load(canonicalize_uri(order.source_link))
      rescue LoadFailed
        require 'pp'
        puts "Problem loading #{order.pretty_inspect}"
        raise
      end

      def write_document(target_path, document_body)
        writer.write(target_path, document_body)
      end

      def go
        until @list.empty?
          order = @list.pop

          doc = load_document(order)
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
