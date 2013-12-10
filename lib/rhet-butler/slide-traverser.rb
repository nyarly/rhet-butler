require 'rhet-butler/yaml-schema'

module RhetButler
  class SlideTraverser
    def initialize
      @iter_stack = []
      @target_stack = []
    end

    attr_reader :iter_stack, :target_stack

    def on_group(group)
      descend(group, group)
    end

    def ascend
      target_stack.pop
      iter_stack.pop
    end

    def descend(source, dest)
      iter_stack.push source.each
      target_stack.push dest
    end

    def traverse
      setup
      until iter_stack.empty?
        begin
          item = iter_stack.last.next
          case item
          when Slide
            on_slide(item)
          when Includer
            on_include(item)
          else
            on_group(item)
          end
        rescue StopIteration
          ascend
        end
      end
    end
  end
end
