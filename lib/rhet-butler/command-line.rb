require 'thor'

module RhetButler
  class CommandLine < ::Thor

    desc "static", "Builds a static version of the presentation"
    method_option :target, :type => :string
    method_option :sources, :type => :array
    method_option :root_slides, :type => :string
    def static
      require 'rhet-butler/static-generator'
      require 'rhet-butler/base-valise'
      generator = StaticGenerator.new(BaseValise.instance)
      generator.target_directory = options[:target] if options.has_key? :target
      generator.root_slides = options[:root_slides] if options.has_key? :root_slides

      slides = options[:sources]
      unless slides.nil?
        generator.extend_search("slides") do
          slides.each do |source|
            ro source
          end
        end
      end

      generator.go!
    end
  end
end
