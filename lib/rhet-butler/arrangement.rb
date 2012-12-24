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

  class Linear < Arrangement
    register "linear"

    def initialize(plus_x, plus_y)
      super
      @plus_x = plus_x
      @plus_y = plus_y
    end

    def arrange(slideset)
      slide = slideset.current_slide
      slide.position.x = slideset.previous_slide.position.x + @plus_x
      slide.position.y = slideset.previous_slide.position.y + @plus_y
      return slide
    end
  end

  class LinearDigression < Linear
    register "digress-linear"
    register "linear-digress"

    def previous_slide
      @preceeding
    end

    def arrange(slideset)
      @preceeding ||= slideset.previous_slide
      super
    end
  end

  class Horizontal < Linear
    register "horizontal"

    def initialize
      super(1000, 0)
    end
  end
end
