require 'rhet-butler/stasis/document-transform'
module RhetButler
  module Stasis
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
