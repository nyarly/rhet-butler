require 'valise'
require 'rhet-butler/slide'

module RhetButler
  module FileManager
    def current_directory
      Valise::Set.define do
        rw "."
        handle "config.yaml", :yaml, :hash_merge
      end
    end

    def configured_search_path(config)
      Valise::Set.define do
        config.search_paths.each do |path|
          rw path
        end
      end
    end

    def base_config_set
      @base_config_set ||=
        Valise::Set.define do
          rw [".rhet"]
          rw ["~", ".rhet"]
          rw ["", "usr", "share", "rhet-butler"]
          rw ["", "etc", "rhet-butler"]
          ro from_here(["..", "..", "..", "default-configuration"])

          handle "config.yaml", :yaml, :hash_merge
        end
    end

    def all_files(config)
      current_directory + configured_search_path(config) + base_config_set
    end

    def slide_files(config)
      return all_files(config).sub_set("slides") + all_files(config)
    end

    def presenter_config
      current_directory.sub_set("presenter") +
        base_config_set.sub_set("presenter") +
        base_config_set.sub_set("common")
    end

    def viewer_config
      current_directory.sub_set("viewer") +
      current_directory +
      base_config_set.sub_set("viewer") +
      base_config_set.sub_set("common")
    end

    def presenter_templates(subset = nil)
      (all_files.subset("presenter") +
        all_files.subset("common") +
        all_files).templates(subset)
    end

    def viewer_templates(subset = nil)
      (all_files.subset("viewer") +
        all_files.subset("common") +
        all_files).templates(subset)
    end
  end
end
