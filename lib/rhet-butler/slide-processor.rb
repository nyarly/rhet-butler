require 'rhet-butler/slide-rendering'
require 'rhet-butler/arrangement-finder'
require 'rhet-butler/slide-arranger'

module RhetButler
  class SlideProcessor
    attr_accessor :root_group, :blueprint, :default_content_filters, :default_note_filters
    attr_reader :slides

    def process
      rendering = SlideRendering.new
      rendering.root_group = @root_group
      rendering.default_content_filters = @default_content_filters
      rendering.default_note_filters = @default_note_filters
      rendering.traverse

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
end
