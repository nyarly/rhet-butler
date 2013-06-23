require 'tilt'
require 'valise'

module RhetButler
  class HTMLGenerator
    class Presentation
      def initialize(configuration)
        @author_name = configuration.author
        @title = configuration.title
        @description = configuration.description
      end

      attr_accessor :author_name, :title, :description
    end

    def initialize(configuration, templates)
      @impress_config = configuration.impress_config
      @templates = templates
      @slides = []
      @presentation = Presentation.new(configuration)
    end

    attr_accessor :slides, :presentation, :impress_config

    def render(path, scope=nil, locals=nil)
      @templates.find(path).contents.render(scope || self, locals || {})
    end
  end
end
