require 'thor'
require 'rhet-butler/file-manager'
require 'rhet-butler/configuration'

module RhetButler
  class CommandLine < ::Thor

    def self.shared_options
      method_option :sources, :type => :array
      method_option :root_slide, :type => :string
    end

    desc "static", "Builds a static version of the presentation"
    method_option :target, :type => :string
    shared_options
    def static
      require 'rhet-butler/static-generator'

      slides = options[:sources]
      files = FileManager.current_directory + FileManager.default

      unless options[:sources].nil?
        files = FileManager.role_search("slides", options[:sources]) + files
      end

      configuration = Configuration.load_from(files)
      configuration.root_slide = options[:root_slide] if options.has_key? :root_slide

      generator = StaticGenerator.new(files, configuration)
      generator.target_directory = options[:target] if options.has_key? :target

      generator.go!
    end

    desc "serve", "Run the presentation server"
    shared_options
    def serve
      require 'rhet-butler/web/main-app'

      slides = options[:sources]
      files = FileManager.current_directory + FileManager.default

      unless options[:sources].nil?
        files = FileManager.role_search("slides", options[:sources]) + files
      end

      configuration = Configuration.load_from(files)
      configuration.root_slide = options[:root_slide] if options.has_key? :root_slide

      app = Web::MainApp.new(files, configuration)
      app.start
    end
  end
end
