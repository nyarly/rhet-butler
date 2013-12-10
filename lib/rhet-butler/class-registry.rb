module RhetButler
  class ClassRegistry
    def initialize
      @classes = {}
    end

    def register(name, klass)
      @classes[name.to_s] = klass
    end

    def fetch(name)
      @classes.fetch(name.to_s)
    end
    alias [] fetch
  end
end
