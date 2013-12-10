require 'rhet-butler/yaml-type'

module RhetButler
  class Includer < YamlType
    register 'include'

    include Enumerable

    def initialize
      @slides = []
    end

    def init_with(coder)
      unless coder.type == :scalar
        raise "!include with non-scalar - use a path string"
      end
      @path = coder.scalar
    end

    attr_accessor :path
    attr_reader :slides

    def each
      if block_given?
        @slides.each{|slide| yield slide}
      else
        @slides.each
      end
    end

    def load(loader)
      loader = loader.dup
      @slides = loader.load_file(path)
      loader
    end
  end
end
