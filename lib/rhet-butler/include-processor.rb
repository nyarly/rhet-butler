require 'rhet-butler/slide-traverser'
module RhetButler
  class IncludeProcessor < SlideTraverser
    Collector = Struct.new(:group, :slides, :loader)
    attr_accessor :root_group

    def initialize(loader)
      @loader = loader
      super()
    end

    def current_loader
      if target_stack.empty?
        return @loader
      else
        return target_stack.last.loader
      end
    end

    def setup
      descend(@root_group, @root_group)
    end

    def descend(source, dest)
      unless Collector === dest
        dest = Collector.new(dest, [], current_loader)
      end
      super(source, dest)
    end

    def ascend
      target = target_stack.pop
      unless target == target_stack.last
        target.group.slides = target.slides
      end
      iter_stack.pop
    end

    def on_include(includer)
      loader = includer.load(current_loader)
      collector = target_stack.last.dup
      collector.loader = loader
      descend(includer, collector)
    end

    def on_slide(slide)
      target_stack.last.slides << slide
    end

    def on_group(group)
      target_stack.last.slides << group
      super
    end
  end
end
