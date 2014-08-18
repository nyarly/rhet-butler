require 'rhet-butler/slide-renderer'
require 'rhet-butler/slide-traverser'
module RhetButler
  class SlideRendering < SlideTraverser
    attr_accessor :root_group, :file_set

    def setup
      descend(@root_group, @root_group)
    end

    def on_slide(slide)
      slide.content = filter_text(slide.raw_content, slide.content_filters)
      slide.notes = filter_text(slide.raw_notes, slide.note_filters)
      raise "Slide content needs to be a string, was: #{slide.content.inspect}" unless String === slide.content
      raise "Slide notes needs to be a string, was: #{slide.notes.inspect}" unless String === slide.notes
    rescue
      puts "While processing #{slide}:"
      raise
    end

    def filter_text(content, filters)
      case content
      when String
        filters.inject(content) do |text, filter|
          filter.process(text)
        end
      when Array
        content.map{|item| filter_text(item, filters)}.join("")
      when SlideContents
        filter_text(content.content(file_set), content.filters)
      else
        raise "Don't know how to filter slide content like #{content.inspect}"
      end
    end
  end
end
