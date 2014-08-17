require 'rhet-butler/slide-renderer'
require 'rhet-butler/slide-traverser'
require 'pp'

module RhetButler
  class FilterResolver < SlideTraverser
    attr_accessor :root_group, :named_filter_lists, :default_content_filters, :default_note_filters

    def setup
      named_filter_lists.each_key do |name|
        named_filter_lists[name] = get_filters(named_filter_lists[name])
      end
      self.default_content_filters = get_filters(default_content_filters)
      self.default_note_filters = get_filters(default_note_filters)
      descend(@root_group, @root_group)
    end

    def get_filters(filter, used_names=nil)
      case filter
      when String
        if !used_names.nil? and used_names.include?(filter)
          raise "Recursive filter list definitions: #{filter} already referenced in #{used_names}"
        end
        get_filters(named_filter_lists.fetch(filter), (used_names||[])+[filter]) do
          raise "No filter named #{filter}"
        end
      when Array
        filter.map{|item| get_filters(item)}.flatten
      else
        filter
      end
    end

    def on_slide(slide)
      slide.content_filters = get_filters(slide.content_filters || default_content_filters)
      slide.html_classes += slide.content_filters.map do |filter|
        filter.html_class
      end

      slide.note_filters    = get_filters(slide.note_filters || default_note_filters)
      slide.html_classes += slide.content_filters.map do |filter|
        "note-" + filter.html_class unless filter.html_class.nil?
      end

      [ *slide.raw_content ].each do |content| #XXX This is how all content filtering should work
        case content
        when SlideContents
          content.filters = get_filters(content.filters || default_content_filters)
        end
      end

    rescue
      puts "While processing #{slide}:"
      raise
    end
  end
end
