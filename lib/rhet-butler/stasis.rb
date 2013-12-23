require 'addressable/uri'
module RhetButler
  module Stasis
    class Document
      attr_accessor :type, :body, :source_uri
    end

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

    class Writer
      def initialize(root)
        @root = root
      end

      def write(path, content)
        File::open(File::join(@root, path), "w") do |file|
          file.write(content)
        end
      end
    end

    class ValiseWriter < Writer
      def initialize(valise)
        @target_valise = valise
      end

      attr_reader :target_valise

      def write(path, content)
        target = target_valise.get(path).writable.first
        puts "\n#{__FILE__}:#{__LINE__} => #{target.full_path.inspect}"
        target.contents = content
      end
    end

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

    class IdentityTransform < DocumentTransform
      register nil

      def parse_document
      end

      def translate_links
      end

      def render_document
        document.body
      end
    end

    require 'nokogiri'
    class HTMLTransform < DocumentTransform
      register "text/html"

      NAV_AND_EMBED = %w[
        //a/@href
        //applet/@codebase
        //area/@href
        //base/@href
        //body/@background
        //frame/@longdesc
        //frame/@src
        //iframe/@longdesc
        //iframe/@src
        //img/@longdesc
        //img/@src
        //input/@src
        //link/@href
        //object/@codebase
        //object/@data
        //script/@src
        //audio/@src
        //command/@icon
        //embed/@src
        //html/@manifest
        //source/@src
        //video/@poster
        //video/@src
      ]

      def parse_document
        @parsed = Nokogiri::HTML(document.body)
      end

      def translate_links
        NAV_AND_EMBED.each do |xpath|
          @parsed.xpath(xpath).each do |attr|
            attr.value = get_link_translation(attr.value)
          end
        end
      end

      def render_document
        @parsed.to_html
      end
    end

    require 'crass'
    class CSSTransform < DocumentTransform
      register "text/css"

      def parse_document
        @parsed = Crass::parse(document.body)
      end

      def url_nodes(node_list)
        return [] if node_list.nil?

        list = []

        node_list.each do |node|
          case node[:node]
          when :url
            list << node
          when :at_rule
            if node[:name] == "import"
              list += node[:prelude].find_all do |node|
                node[:node] == :url or node[:node] == :string
              end
            else
              children = node
              [:block, :value].each do |key|
                children = children[key]
                break if children.nil?
              end
              list += url_nodes(children)
            end
          else
            list += url_nodes(node[:children])
          end
        end
        return list
      end

      def translate_links
        url_nodes(@parsed).uniq.each do |node|
          node[:value] = get_link_translation(node[:value]).to_s
          if node[:node] == :url
            node[:raw] = "url(#{node[:value]})"
          end
        end
      end

      def render_document
        Crass::Parser.stringify(@parsed)
      end
    end
  end
end
