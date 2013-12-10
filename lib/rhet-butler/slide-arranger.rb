require 'rhet-butler/slide-traverser'
module RhetButler
  class SlideArranger < SlideTraverser
    attr_reader :slides, :current_slide
    attr_accessor :root_arrangement

    def setup
      @slides = []
      on_group(@root_arrangement)
    end

    def null_slide
      @null_slide ||= Slide.new
    end

    def previous_slide
      case @previous_slide
      when Slide
        @previous_slide
      when nil
        null_slide
      else
        @previous_slide.previous_slide
      end
    end

    def on_slide(slide)
      @current_slide = slide.dup
      target_stack.last.arrange(self)
      @slides.push @current_slide
      @previous_slide = @current_slide
    end

    def ascend
      @previous_slide = target_stack.last
      super
    end
  end
end
