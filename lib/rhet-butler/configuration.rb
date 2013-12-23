require 'rhet-butler/yaml-schema'

module RhetButler
  #This class is used to manage application config throughout. Basically it
  #wraps a hash loaded from the base fileset. Since the file search path can be
  #configured from there, it would be overly complex to allow config.yaml files
  #in a configured source path.
  #
  #Also, n.b. all access to configuration is through methods on this class, so
  #it's easy to see what values are allowed
  class Configuration
    def initialize(files, overrides=nil)
      @base_hash =
        begin
          files.find("config.yaml").contents
        rescue Valise::Errors::NotFound
          warn "No config.yaml found in #{files.inspect} - using defaults"
          {}
        end
      @base_hash.merge!(overrides) unless overrides.nil?
    end

    def root_slide_template
      @base_hash['root_slide_template'] || 'presentation.html'
    end

    def username
      @base_hash['username'] || 'judson'
    end

    def password
      @base_hash['password'] || 'judsonr00tzme'
    end

    def author
      @base_hash['author_name'] || "Judson Lester"
    end

    def title
      @base_hash['presentation_title'] || 'Presentation'
    end

    def description
      @base_hash['presentation_description'] || "A nifty presentation made with Rhet Butler"
    end

    def search_paths
      @base_hash["sources"] || []
    end

    def template_cache
      @base_hash["template-cache"] || ".template-cache"
    end

    def static_target
      @base_hash["static_target"] || "static"
    end

    def impress_config
      @base_hash['impress-config'] || {}
    end

    def root_arrangement
      @base_hash["arrangement"] || "horizontal"
    end

    def arrangement_blueprint
      @base_hash["blueprint"] || []
    end

    def serve_port
      @base_hash["serve_port"] || 8081
    end

    def root_slide
      @base_hash["root_slide"] || "slides.yaml"
    end

    def named_filter_lists
      @base_hash["named-filters"] || {"textile" => [SlideRenderers::Textile.new]}
    end

    def default_content_filters
      @default_content_filters ||= @base_hash["default-content-filters"] || "textile"
    end

    def default_note_filters
      @default_note_filters ||= @base_hash["default-note-filters"] || "textile"
    end
  end
end
