require 'rhet-butler/slide-group'
require 'rhet-butler/slide'
require 'rhet-butler/slide-includer'
require 'rhet-butler/arrangement'

module RhetButler
  class SlideLoader
    def initialize(configuration)
      p configuration
      @file_set = configuration.files
      @root_slide = configuration.root_slide
      @root_group = SlideGroup.new
      @root_arrangement = Arrangement[configuration.root_arrangement].new
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
      processor.root_arrangement = @root_arrangement
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

    def load_file(rel_path)
      file = @file_set.sub_set("slides").find(rel_path)

      if @loaded_paths.has_key?(file.full_path)
        raise "Circular inclusion of slides: #{@loaded_paths.inspect}"
      else
        @loaded_paths[file.full_path] = true
      end

      return YAML.load_stream(file.contents).flatten
    end
  end

  class SlideProcessor
    attr_accessor :root_group, :root_arrangement, :blueprint
    attr_reader :slides

    def process
      finder = ArrangementFinder.new
      finder.root_group = @root_group
      finder.root_arrangement = @root_arrangement
      finder.blueprint = @blueprint
      finder.traverse

      arranger = SlideArranger.new
      arranger.root_arrangement = @root_arrangement
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
    Collector = Struct.new(:group, :slides)
    attr_accessor :root_group

    def initialize(loader)
      @loader = loader
      super()
    end

    def setup
      descend(@root_group, @root_group)
    end

    def descend(source, dest)
      unless Collector === dest
        dest = Collector.new(dest, [])
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
      includer.load(@loader)
      descend(includer, target_stack.last)
    end

    def on_slide(slide)
      target_stack.last.slides << slide
    end

    def on_group(group)
      descend(group, group)
    end
  end

  class ArrangementFinder < SlideTraverser
    attr_accessor :root_arrangement, :root_group, :blueprint

    def initialize
      super
      @active_match = {}
    end

    def setup
      descend(@root_group, @root_arrangement)
    end

    def on_slide(slide)
      target_stack.last.slides << slide
    end

    def on_group(group)
      descend(group, find_arrangement(group))
    end

    def match(filter, value)
      return filter === value
    end

    def find_arrangement(group)
      match = {}
      template = nil
      blueprint.each_pair do |criteria, possible_template|
        possible = {}
        criteria.each_pair do |key, filter|
          begin
            value = group.fetch(key)
            if match?(filter, value)
              possible[key] = value
            end
          rescue KeyError
          end
        end
        if possible.keys.length > match.keys
          match = possible
          template = possible_template
        end
      end
      if match != @active_match
        type = template.shift
        arrangement = Arrangement[type].new(*template)
      else
        arrangement = target_stack.last
      end
      return arrangement
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
