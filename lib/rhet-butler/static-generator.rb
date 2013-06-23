require 'valise'
require 'rhet-butler/html-generator'
require 'rhet-butler/arrangement'
require 'rhet-butler/file-manager'
require 'rhet-butler/slide-loader'

module RhetButler
  class StaticGenerator
    include FileManager

    def initialize(configuration)
      @configuration = configuration
      @base_valise = slide_files(configuration)
      @target_directory = configuration.static_target
      @root_slide = configuration.root_slide
      @root_slide_template = configuration.root_slide_template
    end

    attr_accessor :target_directory, :root_slides
    attr_reader :configuration

    def template_handler
      @template_handler ||=
        viewer_config.templates("templates")
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
      html_generator = HTMLGenerator.new(configuration, template_handler)
      html_generator.slides = SlideLoader.new(@base_valise, configuration).load_slides

      return html_generator.render(@root_slide_template)
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
