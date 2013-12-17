module RhetButler
  module SlideRenderers
    class Code < SlideRenderer
      register :code

      def self.optional_config
        %w{class}
      end

      def positional_options
        %w{class}
      end

      def process(string)
        "<pre><code#{@config_hash ? " class='#{@config_hash['class']}'" : ""}>#{string}</code></pre>"
      end
    end
  end
end
