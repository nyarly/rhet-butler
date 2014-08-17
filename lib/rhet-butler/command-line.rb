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

    #:nocov:
    desc "init", "Create example skeleton files to get started with"
    def init
      require 'fileutils'

      file_manager = FileManager.new(options)

      FileUtils.mkdir_p "assets"
      FileUtils.mkdir_p "presenter/assets"
      FileUtils.mkdir_p "viewer/assets"

      skels = file_manager.all_files.sub_set("skels")

      %w{slides.yaml}.each do |path|
        unless Dir.glob(path).empty?
          puts "Refusing to clobber existing: #{path}"
          next
        end

        File::open(path, "w") do |file|
          file.write skels.contents(path)
        end
      end
    end

    desc "static", "Builds a static version of the presentation"
    method_option :target, :type => :string
    method_option :quiet, :type => :boolean, :aliases => "-q", :desc => "Suppress listing of files as their written"
    shared_options
    def static
      require 'rhet-butler/static-generator'

      file_manager = FileManager.new(options)
      generator = StaticGenerator.new(file_manager)
      generator.store_log = $stderr unless options[:quiet]

      generator.go!
    end

    desc "import URL TARGET", "Pulls presentation assets from the web and removes remote dependencies"
    method_option :role, :type => :string, :desc => "The presentation role for to localize to", :enum => %w{presenter viewer common}
    method_option :quiet, :type => :boolean, :aliases => "-q", :desc => "Suppress listing of files as their written"
    def import(url, target)
      require 'rhet-butler/resource-localizer'
      file_manager = FileManager.new(options)
      localizer = ResourceLocalizer.new

      case options[:role]
      when "presenter", "viewer"
        localizer.files = file_manager.aspect_search_path(options[:role])
      else
        localizer.files = file_manager.all_files
      end
      localizer.source_uri = url
      localizer.target_path = target
      localizer.store_log = $stderr unless options[:quiet]

      localizer.go!
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
    #:nocov:
  end
end
