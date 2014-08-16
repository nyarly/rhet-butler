require 'rhet-butler/yaml-type'

module RhetButler
  class SlideContents < YamlType
    def self.required_config
      []
    end

    def self.optional_config
      []
    end

    def setup_defaults
    end

    def positional_options
      []
    end

    def normalize_config(coder)
      case coder.type
      when :seq
        Hash[positional_options.zip(coder.seq)]
      when :map
        coder.map
      else
        Hash[positional_options.zip([coder.scalar])]
      end
    end

    def configure
    end

    def html_class
      nil
    end
  end
end

require 'rhet-butler/slide-contents/embed'
