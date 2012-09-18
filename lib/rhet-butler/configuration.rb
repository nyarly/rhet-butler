module RhetButler
  class Configuration
    def initialize(hash)
      @base_hash = hash
    end

    def arrangement
      @base_hash["arrangement"] || "horizontal"
    end

    def serve_port
      @base_hash["serve_port"] || 8081
    end

    def root_slide
      @base_hash["root_slide"] || "slides.yaml"
    end

    def self.load_from(files)
      self.new(files.find("config.yaml").contents)
    end
  end
end
