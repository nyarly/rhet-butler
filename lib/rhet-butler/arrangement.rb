module RhetButler
  class Arrangement
    include Enumerable

    def initialize(*args)
      @slides = []
      @slide_width = 1000
      @slide_height = 1000
    end

    attr_accessor :slides, :slide_width, :slide_height

    def previous_slide
      @slides.last
    end

    def each
      if block_given?
        @slides.each{|slide| yield slide}
      else
        @slides.each
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

    def arrange(slideset)
      slide = slideset.current_slide
      slide.position.x = slideset.previous_slide.position.x + slide_width
      slide.position.y = 0
      return slide
    end
  end
end
