require 'tilt'
require 'valise'
require 'rhet-butler/extendable-valise'

module RhetButler
  class TemplateHandler
    include ExtendableValise

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
      @base_valise = valise
      @extra_valise = Valise::Set.new
    end

    def find_template(path)
      p path
      potential_templates = valise.glob(path + "*").group_by do |item|
        item.depth
      end
      highest = potential_templates.min_by do |depth, items|
        depth
      end.last
      return  highest.min_by do |item|
        item.rel_path.length
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
