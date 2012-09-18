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

    def initialize(template_handler)
      @template_handler = template_handler
      @slides = []
      @presentation = Presentation.new
    end

    attr_accessor :slides, :presentation

    def html
      @template_handler.render("presentation.html", self)
    end
  end
end
