require 'rhet-butler/stasis'
module RhetButler
  module Stasis
    class Writer
      def initialize(root)
        @root = root
      end
      attr_accessor :store_log

      def write(path, content)
        store_log.puts "Writing: #{path}" if store_log.respond_to? :puts
        store(path, content)
      end

      def store(path, content)
        File::open(File::join(@root, path), "w") do |file|
          file.write(content)
        end
      end
    end

    class ValiseWriter < Writer
      def initialize(valise)
        @target_valise = valise
      end

      attr_reader :target_valise

      def store(path, content)
        target = target_valise.get(path).writable.first
        target.contents = content
      end
    end
  end
end
