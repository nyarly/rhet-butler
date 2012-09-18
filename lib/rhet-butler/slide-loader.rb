require 'rhet-butler/slide'
require 'rhet-butler/extendable-valise'
require 'rhet-butler/yaml-schema'
require 'valise'

module RhetButler
  class SlideLoader
    include ExtendableValise

    def initialize(valise)
      @base_valise = valise
      reset_overlay
      extend_search("slides") do
        rw "."
      end
    end

    attr_reader :slides

    def load(*paths)
      paths.inject([]) do |array, path|
        array + YAML.load_stream(valise("slides").find(path).contents).flatten
      end
    end
  end
end
