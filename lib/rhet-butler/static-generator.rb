require 'valise'
require 'rhet-butler/template-handler'
require 'rhet-butler/html-generator'
require 'rhet-butler/arrangement'

module RhetButler
  class StaticGenerator
    def initialize(valise, configuration)
      @base_valise = valise
      @configuration = configuration
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
      html_generator = HTMLGenerator.new(template_handler)

      html_generator.slides = Arrangement["horizontal"].new(@base_valise.load_slides(@configuration.root_slide))

      return html_generator.html
    end

    def populate_assets
      @base_valise.sub_set("templates").glob("assets/**").map do |stack|
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
