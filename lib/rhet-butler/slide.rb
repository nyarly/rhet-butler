require 'rhet-butler/yaml-type'

module RhetButler
  class Slide
    include YamlType
    class << self
      def optional_config
        %w[
          title html_id html_classes html_class
          pos_x pos_y pos_z rot_x rot_y rot_z scale
        ]
      end

      def required_config
        %w[content]
      end
    end

    class Position
      def initialize
        @x = 0
        @y = 0
        @z = 0
      end

      attr_accessor :x, :y, :z

      def to_attrs
        "data-x='#@x' data-y='#@y' data-z='#@z'"
      end
    end

    class Rotation
      def initialize
        @x = 0
        @y = 0
        @z = 0
      end

      attr_accessor :x, :y, :z

      def to_attrs
        "data-rotate-x='#@x' data-rotate-y='#@y' data-rotate-z='#@z'"
      end
    end

    def setup_defaults
      @html_classes = ["step"]
      @html_id = nil
      @position = Position.new
      @rotation = Rotation.new
      @scale = 1.0
    end

    def initialize
      setup_defaults
    end

    def initialize_copy(source)
      super
      @config_hash = source.config_hash.dup unless source.config_hash.nil?
      @content = source.content.dup unless source.content.nil?
      @html_id = source.html_id.dup unless source.html_id.nil?
      @position = source.position.dup unless source.position.nil?
      @rotation = source.rotation.dup unless source.rotation.nil?
      @html_classes = source.html_classes.dup unless source.html_classes.nil?
    end

    def init_with(coder)
      setup_defaults

      @config_hash =
        case coder.type
        when :map
          coder.map
        when :scalar
          { 'content' => coder.scalar.to_s }
        when :seq
          warn "Got a sequence for a slide - not sure how to parse that.  Skipping"
        end

      check_config_hash(@config_hash)

      @content = @config_hash["content"]

      value_from_config("title") do |title|
        @html_id = title.downcase.split(/\s/).join("-")
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

      value_from_config("pos_x") do |value|
        @position.x = value
      end
      value_from_config("pos_y") do |value|
        @position.y = value
      end
      value_from_config("pos_z") do |value|
        @position.z = value
      end

      value_from_config("rot_x") do |value|
        @rotation.x = value
      end
      value_from_config("rot_y") do |value|
        @rotation.y = value
      end
      value_from_config("rot_z") do |value|
        @rotation.z = value
      end

      value_from_config("scale") do |value|
        @scale = value
      end
    end

    attr_reader :config_hash
    attr_accessor :content, :html_classes, :html_id
    attr_reader :position, :rotation
    attr_accessor :scale

    def impress_attrs
      attrs = []
      unless @html_id.nil?
        attrs << "id='#@html_id'"
      end

      attrs << "class='#{@html_classes.join(" ")}'"
      attrs << @position.to_attrs
      attrs << @rotation.to_attrs
      attrs << "data-scale='#{"%0.2f" % scale}'"

      attrs.join(" ")
    end
  end
end
