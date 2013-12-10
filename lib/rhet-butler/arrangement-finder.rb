require 'rhet-butler/arrangement'
require 'rhet-butler/slide-traverser'
module RhetButler
  class ArrangementFinder < SlideTraverser
    attr_accessor :root_arrangement, :root_group, :blueprint

    def initialize
      super
    end

    def setup
      if @blueprint.empty?
        raise "Empty blueprint - can't layout slides"
      end

      @blueprint.combination(2) do |first, second|
        if first.match == second.match
          if first.match == {}
            raise "Two default rules (default or match: {}) - please fix"
          end
          warn "Blueprint rules with duplicate rules: will ignore the later one:"
          warn second.inspect
        end
      end

      unless @blueprint.last.match == {}
        warn "Last blueprint rule not a default - fixing..."
        defaults, rules = @blueprint.partition{|rule| rule.match == {}}
        raise "Multiple default blueprint rules" unless defaults.length < 2
        raise "No default blueprint rule" unless defaults.length > 0
        @blueprint = rules + defaults
      end

      default_rule = @blueprint.last
      @active_match = default_rule
      @root_arrangement = default_rule.layout
      descend(@root_group, @root_arrangement)
    end

    def on_slide(slide)
      target_stack.last.slides << slide
    end

    def on_group(group)
      arrangement = find_arrangement(group)
      if arrangement != target_stack.last
        target_stack.last.slides << arrangement
      end
      descend(group, arrangement)
    end

    def match?(filter, value)
      return filter === value
    end

    def find_arrangement(group)
      match = {}
      template = nil
      match = blueprint.find do |rule|
        rule.match?(group)
      end

      if !match.nil? and match != @active_match
        @active_match = match
        return match.layout
      else
        return target_stack.last
      end
    end
  end
end
