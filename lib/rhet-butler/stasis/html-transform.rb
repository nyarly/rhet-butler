require 'rhet-butler/stasis/document-transform'
module RhetButler
  module Stasis
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
  end
end
