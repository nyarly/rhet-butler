require 'nokogiri'

module RhetButler
  module SlideRenderers
    class Cues < SlideRenderer
      register "cues"

      class XPathExtensions
        def self.regex(node_set, pattern)
          re = Regexp.new(pattern)
          node_set.find_all do |node|
            node.value =~ re
          end
        end
      end

      def process(string)
        doc = Nokogiri::HTML::DocumentFragment.parse(string) #may need DocumentFragment::parse
        doc.xpath('.//*/@class[regex(.,"\b\d+\b")]', XPathExtensions).each do |attr|
          attr.value = "rhet-butler item " + attr.value
          attr.value = attr.value.gsub(/\b\d+\b/){|m| "cue-#{m[0]}"}
        end
        doc.to_s
      end
    end
  end
end
