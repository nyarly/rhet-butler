module RhetButler
  class Includer
    include Enumerable


    def initialize
      @slides = []
    end

    def init_with(coder)
      p coder
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
      @slides = loader.load_file(path)
    end
  end
end
