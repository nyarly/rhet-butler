require 'tilt'
require 'valise'
require 'rhet-butler/template-handler'

module RhetButler
  class HTMLGenerator
    class Presentation
      def initialize
        @author_name = "Judson Lester"
        @title = "A Presentation"
        @description = "A nifty presentation made with Rhet Butler"
      end

      attr_accessor :author_name, :title, :description
    end

    def initialize(configuration, template_handler)
      @impress_config = configuration.impress_config
      @template_handler = template_handler
      @slides = []
      @presentation = Presentation.new
    end

    attr_accessor :slides, :presentation, :impress_config

    def render(path)
      @template_handler.render(path, self)
    end

    def html
      render("presentation.html")
    end
  end
end
