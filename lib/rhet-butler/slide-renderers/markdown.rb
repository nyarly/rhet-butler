require 'kramdown'

module RhetButler
  module SlideRenderers
    class Markdown < SlideRenderer
      register "markdown"
      register "kramdown"
      register "gfm"

      def process(string)
        Kramdown::Document.new(string).to_html
      end
    end
  end
end
