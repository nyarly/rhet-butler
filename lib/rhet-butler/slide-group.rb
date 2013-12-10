require 'rhet-butler/yaml-type'

module RhetButler
  class SlideGroup < YamlType
    include Enumerable

    register "group"

    class <<self
      def optional_config
        %w[type slide_type]
      end

      def required_config
        %w[slides]
      end
    end

    def setup_defaults
      @html_id = nil
      @classes = ["group"]
      @slides = []
      @metadata = {}
    end

    def normalize_config(coder)
      case coder.type
      when :map
        coder.map
      when :scalar
        raise "A slide group needs to at least be a list of slides"
      when :seq
        { 'slides' => coder.seq}
      end
    end

    def configure
      value_from_config("html_id") do |value|
        @html_id = value
      end

      value_from_config("html_classes") do |value|
        @html_classes += [*value]
      end

      value_from_config("html_class") do |value|
        @html_classes << value
      end

      @slides = @config_hash.delete('slides')
      @metadata = @config_hash
    end

    attr_accessor :slides
    attr_reader :metadata, :classes

    def each
      if block_given?
        @slides.each{|slide| yield(slide)}
      else
        @slides.each
      end
    end

    def each_slide
      if block_given?
        @slides.each do |slide|
          if slide.is_a? SlideGroup
            slide.each_slide{|sl| yield sl}
          else
            yield slide
          end
        end
      else
        enum_for :each_slide
      end
    end

    def template_name
      "group.html"
    end

    def id_attr
      if @html_id.nil?
        return ""
      else
        "id='#@html_id'"
      end
    end
  end
end
