require 'rhet-butler/yaml-type'

module RhetButler
  class Slide < YamlType
    register "slide"

    class << self
      def optional_config
        %w[
          title html_id html_classes html_class
          notes filters note_filters
        ]
      end

      def required_config
        %w[content]
      end
    end

    def setup_defaults
      @template_name = "slide.html"
      @html_classes = ["slide"]
      @html_id = nil
      @raw_notes = ""
      @type = nil
    end

    def initialize_copy(source)
      super
      @config_hash = source.config_hash.dup unless source.config_hash.nil?
      @content = source.content.dup unless source.content.nil?
      @notes = source.notes.dup unless source.notes.nil?
      @html_id = source.html_id.dup unless source.html_id.nil?
      @html_classes = source.html_classes.dup unless source.html_classes.nil?
    end


    def normalize_config(coder)
      case coder.type
      when :map
        coder.map
      when :scalar
        { 'content' => coder.scalar.to_s }
      when :seq
        { 'content' => coder.seq.to_a }
      end
    end

    def configure
      value_from_config("title") do |title|
        @html_id = title.downcase.split(/\s/).join("-")
      end

      value_from_config("content") do |content|
        @raw_content = content
      end

      value_from_config("notes") do |notes|
        @raw_notes = notes
      end

      value_from_config("html_id") do |value|
        @html_id = value
      end

      value_from_config("html_classes") do |value|
        @html_classes += [*value]
      end

      value_from_config("html_class") do |value|
        @html_classes << value
      end

      value_from_config("filters") do |value|
        @content_filters = value
        @html_classes += [*value].map do |filter|
          filter.html_class
        end.compact
      end

      value_from_config("note-filters") do |value|
        @note_filters = value
        @html_classes += value.map do |filter|
          "notes-" + filter.html_class unless filter.html_class.nil?
        end
      end
    end

    attr_reader :config_hash
    attr_accessor :raw_content, :raw_notes
    attr_accessor :content, :notes
    attr_accessor :html_classes, :html_id
    attr_accessor :content_filters, :note_filters
    attr_reader :template_name

    def to_s
      "Slide: #{content.nil? ? "R:#{raw_content[0..20]}" : content[0..20]}"
    end

    def id_attr
      if @html_id.nil?
        return ""
      else
        "id='#@html_id'"
      end
    end

    def classes
      @html_classes.join(" ")
    end
  end
end
