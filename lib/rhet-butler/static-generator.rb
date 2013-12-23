require 'rhet-butler/web/main-app'
require 'rhet-butler/stasis'

module RhetButler
  class StaticGenerator
    def initialize(file_manager)
      @file_manager = file_manager
      @target_valise = file_manager.target_valise
    end

    attr_reader :target_valise
    attr_accessor :store_log

    def app
      web_app = Web::MainApp.new(@file_manager)
      web_app.presentation_app_class = Web::MemoizedPresentationApp
      web_app.assets_app_class = Web::MemoizedAssetsApp
      web_app.capture_exceptions = false
      web_app.check
      web_app.builder.to_app
    end

    def go!
      app_url = "http://example.com/"
      transform_queue = Stasis::TransformQueue.new
      transform_queue.loader = Stasis::RackLoader.new(app_url, app)
      transform_queue.mapping = Stasis::ResourceMapping.new
      transform_queue.mapping.default_uri = app_url
      transform_queue.writer = Stasis::ValiseWriter.new(@target_valise)
      transform_queue.writer.store_log = store_log

      transform_queue.add("/")
      transform_queue.go
    end
  end
end
