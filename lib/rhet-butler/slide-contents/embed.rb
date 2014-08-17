require 'nokogiri'

module RhetButler
  class SlideContents
    class Embed < SlideContents
      register "embed"
      register "embedded"

      def self.required_config
        %w{source}
      end

      def positional_options
        %w{source}
      end

      attr_reader :source
      attr_accessor :filters

      def configure
        value_from_config("source") do |source|
          @source = source
        end

        value_from_config("filters") do |value|
          @filters = value
        end
      end

      def content(file_set)
        "\n" + file_set.contents(source) + "\n"
      end
    end
  end
end
