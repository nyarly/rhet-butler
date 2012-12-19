require 'valise'
require 'rhet-butler/slide'

module RhetButler
  class FileManager < Valise::Set

    def self.build(roles, sources)
      files = FileManager.current_directory

      roles.each do |role|
        files += FileManager.defaults(role)
      end

      unless sources.nil? or sources.empty?
        files = FileManager.role_search("slides", sources) + files
      end
      return files
    end

    def self.defaults(role)
      self.new.define do
        rw [".rhet", role]
        rw ["~", ".rhet", role]
        rw ["", "usr", "share", "rhet-butler", role]
        rw ["", "etc", "rhet-butler", role]
        ro from_here(["..", "..", "default-configuration", role])

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
  end
end
