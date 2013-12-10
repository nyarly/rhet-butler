require 'valise'
require 'rhet-butler/html-generator'
require 'rhet-butler/arrangement'
require 'rhet-butler/file-manager'
require 'rhet-butler/slide-loader'

module RhetButler
  class StaticGenerator
    def initialize(file_manager)
      @configuration = file_manager.base_config
      @base_valise = file_manager.slide_files
      @target_valise = file_manager.target_valise
      @root_slide = configuration.root_slide
      @root_slide_template = configuration.root_slide_template
      @template_handler = file_manager.aspect_templates(:viewer)
    end

    attr_accessor :target_directory, :root_slides
    attr_reader :configuration, :template_handler, :target_valise

    def html_document
      html_generator = HTMLGenerator.new(configuration, template_handler)
      html_generator.root_step = SlideLoader.new(@base_valise, configuration).load_slides

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
