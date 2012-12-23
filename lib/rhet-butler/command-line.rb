require 'thor'
require 'valise'
require 'rhet-butler/configuration'

module RhetButler
  class CommandLine < ::Thor
    #XXX Should go into StaticGenerator
    include FileManager

    def self.shared_options
      method_option :sources, :type => :array
      method_option :root_slide, :type => :string
    end

    desc "static", "Builds a static version of the presentation"
    method_option :target, :type => :string
    shared_options
    def static
      require 'rhet-butler/static-generator'

      slide_files = slide_files(options[:sources])
      configuration = Configuration.load_from(viewer_config)
      configuration.root_slide = options[:root_slide] if options.has_key? :root_slide

      generator = StaticGenerator.new(slide_files, configuration)
      generator.target_directory = options[:target] if options.has_key? :target

      generator.go!
    end

    desc "serve", "Run the presentation server"
    shared_options
    def serve
      require 'rhet-butler/web/main-app'

      app = Web::MainApp.new(options[:sources], options[:root_slide])
      app.start
    end
  end
end
