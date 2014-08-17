require 'rhet-butler/yaml-schema'
require 'rhet-butler/file-loading'
require 'rhet-butler/include-processor'
require 'rhet-butler/slide-rendering'
require 'rhet-butler/filter-resolver'

module RhetButler
  class SlideLoader
    def initialize(slide_files, asset_files, configuration)
      @file_set = slide_files
      @asset_set = asset_files
      @named_filter_lists = configuration.named_filter_lists
      @default_content_filters = configuration.default_content_filters
      @default_note_filters = configuration.default_note_filters
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

      filter_resolver = FilterResolver.new
      filter_resolver.root_group = root_group
      filter_resolver.named_filter_lists = @named_filter_lists
      filter_resolver.default_content_filters = @default_content_filters
      filter_resolver.default_note_filters = @default_note_filters
      filter_resolver.traverse

      renderer = SlideRendering.new
      renderer.root_group = root_group
      renderer.file_set = @asset_set
      renderer.traverse

      return root_group
    end
  end
end
