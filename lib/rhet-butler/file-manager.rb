require 'valise'
require 'rhet-butler/slide'

module RhetButler
  module FileManager
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

    def slide_files(sources)
      Valise::Set.define do
        rw "."
        stemmed "slides" do
          rw "."
          (sources||[]).each do |path|
            rw path
          end
        end
      end + base_config_set.sub_set("slides") + base_config_set
    end

    def current_directory
      Valise::Set.define do
        rw "."
        handle "config.yaml", :yaml, :hash_merge
      end
    end

    def presenter_config
      base_config_set.sub_set("presenter") + base_config_set.sub_set("common")
    end

    def viewer_config
      current_directory + base_config_set.sub_set("viewer") + base_config_set.sub_set("common")
    end
  end
end
