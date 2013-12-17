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

    class RenderFacade
      def initialize(templates, item)
        @templates = templates
        @item = item
      end

      def method_missing(name, *args, &block)
        @item.__send__(name, *args, &block)
      end

      def render(path, item=nil, locals=nil)
        scope = if(item.nil?)
          self
        else
          self.class.new(@templates, item)
        end
        @templates.find(path).contents.render(scope || self, locals || {})
      end
    end

    def initialize(configuration, templates)
      @impress_config = configuration.impress_config
      @templates = templates
      @root_step
      @presentation = Presentation.new(configuration)
    end

    attr_accessor :root_step, :presentation, :impress_config

    def render(template, item=nil)
      RenderFacade.new(@templates, item || self).render(template)
    end
  end
end
