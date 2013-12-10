require 'rhet-butler/yaml-type'

module RhetButler
  class LayoutRule < YamlType
    register "layout-rule"

    def initialize
      @match = {}
      @layout_args = nil
    end
    attr_accessor :match, :layout_type, :layout_args

    def self.optional_config
      %w[match]
    end

    def self.required_config
      %w[layout]
    end

    def setup_defaults

    end

    def normalize_config(coder)
      case coder.type
      when :seq
        { 'match' => coder.seq[0], 'layout' => coder.seq[1] }
      when :map
        coder.map
      else
        raise "Tried to configure a layout rule with non-sequence: #{coder.inspect}"
      end
    end

    def configure
      value_from_config("match") do |value|
        if value == 'default'
          @match = {}
        else
          @match = value
        end
      end

      @layout_type, @layout_args = *@config_hash['layout']
    end

    def layout
      Arrangement[@layout_type].new(*(@layout_args||[]))
    end

    def match?(group)
      @match.all? do |key, value|
        target = group.metadata.fetch(key)
        value === target
      end
    rescue KeyError
      false
    end
  end
end
