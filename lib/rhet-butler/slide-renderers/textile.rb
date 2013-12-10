require 'redcloth'

module RhetButler
  module SlideRenderers
    class Textile < SlideRenderer
      register "textile"
      register "texttile"

      def process(string)
        RedCloth.new(string).to_html
      end
    end
  end
end
