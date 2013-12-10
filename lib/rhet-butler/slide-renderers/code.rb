module RhetButler
  module SlideRenderers
    class Code < SlideRenderer
      register :code

      def process(string)
        "<pre><code#{@options ? " class='#{@options}'" : ""}>#{string}</code></pre>"
      end
    end
  end
end
