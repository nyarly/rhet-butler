require 'tilt'

module RhetButler
  class TemplateHandler

    class IdentityTemplate
      def initialize(contents)
        @contents = contents
      end

      def render(scope, locals)
        @contents
      end
    end

    def initialize(valise, search)
      @template_cache = Tilt::Cache.new
      @search = search
      @valise = valise
    end

    attr_reader :valise

    def find_template(path)
      potential_templates = valise.glob(path + "*").group_by do |item|
        item.depth
      end
      highest = potential_templates.min_by do |depth, items|
        depth
      end
      return highest.last.min_by do |item|
        item.segments.last.split(".").length
      end
    end

    def template_contents(path)
      find_template(path).contents
    end

    def fetch_template(path, template_options = nil)
      template = @template_cache.fetch(path) do
        template_item = find_template(path)
        begin
          Tilt.new(template_item.rel_path, template_options || {}) do |tmpl|
            template_contents(tmpl.file)
          end
        rescue
          IdentityTemplate.new(template_item.contents)
        end
      end
    end

    def render(path, scope, template_options = nil)
      template = fetch_template(([@search] + [*path]).join("/"), template_options)

      locals = {}
      if block_given?
        yield locals
      end

      template.render(scope, locals)
    end
  end
end
