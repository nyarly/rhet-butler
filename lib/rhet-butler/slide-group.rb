require 'rhet-butler/yaml-type'

module RhetButler
  class SlideGroup
    include YamlType
    include Enumerable

    class <<self
      def optional_config
        []
      end

      def required_config
        %w[slides]
      end
    end


    def setup_defaults
    end

    def initialize
      @slides = []
      @metadata = {}
    end
    attr_accessor :slides
    attr_reader :metadata

    def each
      if block_given?
        @slides.each{|slide| yield(slide)}
      else
        @slides.each
      end
    end

    def init_with(coder)
      setup_defaults

      @config_hash =
        case coder.type
        when :map
          coder.map
        when :scalar
          raise "A slide group needs to at least be a list of slides"
        when :seq
          { 'slides' => coder.seq}
        end

      check_config_hash(@config_hash)

      @slides = @config_hash.delete('slides')
      @metadata = @config_hash
    end
  end
end
