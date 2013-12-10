require 'rhet-butler/slide-renderer'
require 'rhet-butler/slide-traverser'
module RhetButler
  class SlideRendering < SlideTraverser
    attr_accessor :root_group, :default_content_filters, :default_note_filters

    def setup
      descend(@root_group, @root_group)
    end

    def on_slide(slide)
      slide.content = filter_text(slide.content, slide.content_filters || default_content_filters)
      slide.notes = filter_text(slide.notes, slide.note_filters || default_note_filters)
    end

    def filter_text(text, filters)
      filters.inject(text) do |text, filter|
        filter.process(text)
      end
    end
  end
end
