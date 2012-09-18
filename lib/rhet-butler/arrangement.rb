module RhetButler
  class Arrangement
    include Enumerable

    def initialize(slides)
      @slides = slides
      @slide_width = 1000
      @slide_height = 1000
    end

    attr_accessor :slide_width, :slide_height

    def each
      @slides.each_with_index do |slide, index|
        yield(arrange(slide.dup, index))
      end
    end

    class << self
      def register(name)
        Arrangement.registry[name] = self
      end

      def registry
        @registry ||= {}
      end

      def [](name)
        @registry[name]
      end
    end
  end

  class Horizontal < Arrangement
    register "horizontal"

    def arrange(slide, index)
      slide.position.x = index * slide_width
      slide.position.y = 0
      return slide
    end
  end
end
