module RhetButler
  class Includer
    include Enumerable

    def initialize
      @slides = []
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
