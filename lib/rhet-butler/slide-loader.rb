require 'rhet-butler/slide-group'
require 'rhet-butler/slide'
require 'rhet-butler/slide-includer'
require 'rhet-butler/arrangement'

module RhetButler
  class SlideLoader
    def initialize(slide_files, configuration)
      @file_set = slide_files
      @root_slide = configuration.root_slide
      @root_group = SlideGroup.new
      @blueprint = configuration.arrangement_blueprint
    end

    def load_slides
      root_group = SlideGroup.new
      includer = Includer.new
      includer.path = @root_slide
      root_group.slides = [includer]

      loading = FileLoading.new(@file_set)
      including = IncludeProcessor.new(loading)
      including.root_group = root_group
      including.traverse

      processor = SlideProcessor.new
      processor.root_group = root_group
      processor.blueprint = @blueprint
      processor.process
      return processor.slides
    end
  end

  require 'rhet-butler/yaml-schema'
  class FileLoading
    def initialize(file_set)
      @file_set = file_set
      @loaded_paths = {}
    end
    attr_reader :loaded_paths, :file_set

    def initialize_copy(other)
      @file_set = other.file_set
      @loaded_paths = other.loaded_paths.dup
    end

    def load_file(rel_path)
      file = @file_set.find(rel_path)

      if @loaded_paths.has_key?(file.full_path)
        raise "Circular inclusion of slides: >> #{file.full_path} << #{@loaded_paths.keys.inspect}"
      else
        @loaded_paths[file.full_path] = true
      end

      return YAML.load_stream(file.contents).flatten
    end
  end

  class SlideProcessor
    attr_accessor :root_group, :blueprint
    attr_reader :slides

    def process
      require 'pp'

      finder = ArrangementFinder.new
      finder.root_group = @root_group
      finder.blueprint = @blueprint
      finder.traverse

      arranger = SlideArranger.new
      arranger.root_arrangement = finder.root_arrangement
      arranger.traverse

      @slides = arranger.slides
    end
  end

  class SlideTraverser
    def initialize
      @iter_stack = []
      @target_stack = []
    end

    attr_reader :iter_stack, :target_stack

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
      descend(group, group)
    end
  end

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
          warn "Blueprint rules with duplicate rules: will ignore the later one:"
          warn second.inspect
        end
      end
      #XXX Not where this belongs
      first_rule = @blueprint.first
      unless first_rule.match == {}
        raise "First rule of layout blueprint should be 'default', not: #{first_rule.inspect}"
      end

      @active_match = first_rule
      @root_arrangement = first_rule.layout
      descend(@root_group, @root_arrangement)
    end

    def on_slide(slide)
      target_stack.last.slides << slide
    end

    def on_group(group)
      descend(group, find_arrangement(group))
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

    def on_group(arranger)
      descend(arranger, arranger)
    end
  end
end
