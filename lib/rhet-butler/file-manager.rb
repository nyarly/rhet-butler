require 'valise'
require 'rhet-butler/configuration'
require 'compass/import-once'
require 'compass/core'

module RhetButler
  #All file handling is routed through this class.
  #
  #Basic configuration (including additional search paths for other configs and
  #slides) can only come from the current directory or the "basic search path":
  #* .rhet/
  #* ~/.rhet/
  #* /usr/share/rhet-butler/
  #* /etc/rhet-butler/
  #[the defaults provided by the gem]
  #
  #Other paths configured by --sources or sources: [] in base configs are added
  #after the current directory and before that list.
  #
  #There are several subdirectories searched in these search paths, depending
  #on context:
  #
  #* presenter/
  #* viewer/
  #* common/
  #
  #Presenter and viewer files are used for displaying the appropriate
  #presentation, so that the presenter can have a different display (e.g. with
  #notes and a timer) than the audience (e.g. nifty transitions etc.)
  #
  #Slide files are loaded without a sub-directory - they're always the same
  #regardless of context.
  #
  #Presenter configs, templates, and assets are searched for in presenter, then
  #common.
  #
  #Audience configs, templates and assets are searched for in viewer, then
  #common.
  #
  class FileManager
    def initialize(overrides = nil)
      @overrides = overrides || {}
      @cached_configs = {}
      @cached_templates = {}
    end

    def base_config
      @base_config ||= load_config(base_config_search_path)
    end

    def slide_files
      all_files.sub_set("slides") + all_files
    end

    def all_files
      current_directory + configured_search_path + base_config_set
    end

    def base_config_search_path
      set = current_directory + base_config_set
      set + set.sub_set("common")
    end

    def template_config(type)
      case type
      when "sass", "scss"
        load_paths = all_files.sub_set("assets/stylesheets").map(&:to_s)
        load_paths << Compass::Core.base_directory("stylesheets")
        {:template_options =>
          { :load_paths => load_paths }}
      else
        nil
      end
    end

    def aspect_config(aspect_name)
      load_config(aspect_search_path(aspect_name))
    end

    def base_assets(template_cache)
      all_files.templates("assets") do |mapping|
        (template_config(mapping) || {}).merge(:template_cache => template_cache)
      end
    end

    def aspect_templates(aspect, template_cache = nil)
      aspect_search_path(aspect).templates do |mapping|
        (template_config(mapping) || {}).merge(:template_cache => template_cache)
      end
    end

    def aspect_search_path(aspect)
      aspect = aspect.to_s
      set = all_files.sub_set(aspect)
      set += all_files.sub_set("common")
      set += all_files
      return set
    end

    def load_config(files)
      Configuration.new(files, @overrides)
    end

    def current_directory
      Valise::Set.define do
        rw "."
        handle "config.yaml", :yaml, :hash_merge
      end
    end

    def configured_search_path
      base_config = self.base_config
      Valise::Set.define do
        base_config.search_paths.each do |path|
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

    def target_valise
      @target_valise ||=
        begin
          target_directory = base_config.static_target
          Valise::define do
            rw target_directory
          end
        end
    end
  end
end
