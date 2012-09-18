require 'valise'
require 'rhet-butler/extendable-valise'
require 'rhet-butler/template-handler'
require 'rhet-butler/html-generator'
require 'rhet-butler/slide-loader'
require 'rhet-butler/arrangement'

module RhetButler
  class StaticGenerator
    def initialize(valise)
      @base_valise = valise
      @root_slides = "slides.yaml"
      @target_directory = "static"
    end

    attr_accessor :target_directory, :root_slides

    def template_handler
      @template_handler ||= TemplateHandler.new(@base_valise, "templates")
    end

    def target_valise
      @target_valise ||=
        begin
          target_directory = @target_directory
          Valise::define do
            rw target_directory
          end
        end
    end

    def html_document
      slide_loader = SlideLoader.new(@base_valise)

      html_generator = HTMLGenerator.new(template_handler)

      html_generator.slides = Arrangement["horizontal"].new(slide_loader.load(root_slides))


      return html_generator.html
    end

    def populate_assets
      @base_valise.sub_set("templates").glob("assets/**").map do |stack|
        p stack.segments
        stack.segments[1..-2] +
          [stack.segments.last.sub(/(.*(?:\..*)?).*/){|| $1}]
      end.uniq.each do |target_file|
        target_valise.get(target_file).writable.first.contents =
          template_handler.render(target_file, nil)
      end
    end

    def go!
      target_valise.get("presentation.html").writable.first.contents = html_document

      populate_assets
    end
  end
end
