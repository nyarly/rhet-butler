require 'rhet-butler/yaml-schema'

module RhetButler
  class FileLoading
    def initialize(file_set)
      @file_set = file_set
      @loaded_paths = {}
    end
    attr_reader :loaded_paths, :file_set

    def initialize_copy(other)
      @file_set = other.file_set
      @loaded_paths = other.loaded_paths.dup
    end

    def load_file(rel_path)
      file = @file_set.find(rel_path)

      if @loaded_paths.has_key?(file.full_path)
        raise "Circular inclusion of slides: >> #{file.full_path} << #{@loaded_paths.keys.inspect}"
      else
        @loaded_paths[file.full_path] = true
      end

      return YAML.load_stream(file.contents).flatten
    end
  end
end
