require 'nokogiri'

module RhetButler
  module SlideContents
    class Embed < SlideContents
      register "cues"

      def required_config
        %w{source}
      end

      def positional_config
        %w{source}
      end

      attr_reader :source

      def configure
        value_from_config("source") do |source|
          @source = source
        end
      end

      def content(file_set)
        "\n" + file_set.contents(source) + "\n"
      end
    end
  end
end
