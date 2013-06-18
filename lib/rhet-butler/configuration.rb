module RhetButler
  class Configuration
    attr_reader :files
    def initialize(files, overrides=nil)
      @files = files
      @base_hash = files.find("config.yaml").contents
      @base_hash.merge!(overrides) unless overrides.nil?
    end

    def username
      @base_hash['username'] || 'judson'
    end

    def password
      @base_hash['password'] || 'judsonr00tzme'
    end

    def impress_config
      @base_hash['impress-config'] || {}
    end

    def root_arrangement
      @base_hash["arrangement"] || "horizontal"
    end

    def arrangement_blueprint
      @base_hash["blueprint"] || {}
    end

    def serve_port
      @base_hash["serve_port"] || 8081
    end

    def root_slide
      @base_hash["root_slide"] || "slides.yaml"
    end

    def default_slide_type
      @base_hash["default_slide_type"] || "textile"
    end
  end
end
