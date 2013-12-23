require 'rhet-butler/web/main-app'
require 'rhet-butler/stasis'

module RhetButler
  class ResourceLocalizer
    attr_accessor :files, :source_uri, :target_path, :store_log

    def go!
      app_url = "http://example.com/"
      transform_queue = Stasis::TransformQueue.new
      transform_queue.loader = Stasis::HTTPLoader.new
      transform_queue.mapping = Stasis::ResourceMapping.new
      transform_queue.mapping.default_uri = app_url
      transform_queue.writer = Stasis::ValiseWriter.new(@files)
      transform_queue.writer.store_log = store_log

      target_uri = transform_queue.mapping.target_link_for(source_uri)
      transform_queue.add_mapping(source_uri, target_uri, target_path)
      transform_queue.go
    end
  end
end
