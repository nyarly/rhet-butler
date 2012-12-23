require 'valise'
require 'rhet-butler/slide'

module RhetButler
  module FileManager
    def config_files(role)
      sub_path = [*role].compact
      Valise::Set.define do
        rw [".rhet"] + sub_path
        rw ["~", ".rhet"] + sub_path
        rw ["", "usr", "share", "rhet-butler"] + sub_path
        rw ["", "etc", "rhet-butler"] + sub_path
        ro from_here(["..", "..", "default-configuration"] + sub_path)

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
      end + config_files([])
    end

    def presenter_config
      config_files("presenter") +
        config_files("common")
    end

    def viewer_config
      Valise::Set.define do
        rw "."
        handle "config.yaml", :yaml, :hash_merge
      end +
        config_files("viewer") +
        config_files("common")
    end
  end
end
