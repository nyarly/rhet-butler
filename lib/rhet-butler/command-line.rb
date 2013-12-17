require 'thor'
require 'valise'
require 'rhet-butler/configuration'
require 'rhet-butler/file-manager'

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

      file_manager = FileManager.new(options)
      generator = StaticGenerator.new(file_manager)

      generator.go!
    end

    desc "check", "Load slide set to check syntax"
    shared_options
    def check
      require 'rhet-butler/web/main-app'

      file_manager = FileManager.new(options)
      app = Web::MainApp.new(file_manager)
      app.presentation_app_class = Web::MemoizedPresentationApp
      app.assets_app_class = Web::MemoizedAssetsApp
      app.check

      slide_count = app.viewer_app.root_step.each_slide.inject(0) do |count, slide|
        count + 1
      end
      say "Slides loaded and parsed"
      say "  #{slide_count} slides loaded"
      say "  Serving slides and assets found in: #{app.slides}"
    end

    desc "author", "Run the presentation in authoring mode"
    shared_options
    def author
      require 'rhet-butler/web/main-app'

      file_manager = FileManager.new(options)
      app = Web::MainApp.new(file_manager)
      app.presentation_app_class = Web::PresentationApp
      app.assets_app_class = Web::AssetsApp
      app.check
      app.start
    end

    desc "serve", "Run the presentation server"
    shared_options
    def serve
      require 'rhet-butler/web/main-app'

      file_manager = FileManager.new(options)
      app = Web::MainApp.new(file_manager)
      app.presentation_app_class = Web::MemoizedPresentationApp
      app.assets_app_class = Web::MemoizedAssetsApp
      app.check
      app.start
    end
  end
end
