require 'valise'
require 'rhet-butler/slide'

module RhetButler
  class FileManager < Valise::Set
    def self.default
      self.new.define do
        rw ".rhet"
        rw "~/.rhet"
        rw "/usr/share/rhet-butler"
        rw "/etc/rhet-butler"
        ro from_here("../../default-configuration")

        handle "config.yaml", :yaml, :hash_merge
      end
    end

    def self.current_directory
      self.new.define do
        stemmed "slides" do
          rw "."
        end
        rw "."
      end
    end

    def self.role_search(role, search)
      self.new.define do
        stemmed role do
          search.each do |path|
            rw path
          end
        end
      end
    end

    def load_slides(*paths)
      require 'rhet-butler/yaml-schema'
      paths.inject([]) do |array, path|
        array + YAML.load_stream(sub_set("slides").find(path).contents).flatten
      end
    end
  end
end
