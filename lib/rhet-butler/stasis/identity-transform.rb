require 'rhet-butler/stasis/document-transform'
module RhetButler
  module Stasis
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
  end
end
