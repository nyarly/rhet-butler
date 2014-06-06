require 'yaml'

module RhetButler
  class YamlType
    def self.register(name)
      YAML.add_tag("!#{name}", self)
    end

    def setup_defaults
    end

    def check_config_hash(config_hash)
      expected_keys = self.class.required_config + self.class.optional_config
      weird_keys = config_hash.keys.find_all{|key| !expected_keys.include?(key)}
      missing_keys = self.class.required_config.find_all{|key|
        !config_hash.has_key?(key)
      }
      unless weird_keys.empty?
        warn "Found weird keys: #{weird_keys.inspect} in #{config_hash.inspect}"
      end
      unless missing_keys.empty?
        raise "Missing required keys: #{missing_keys.inspect} in #{config_hash.inspect}"
      end
    end

    def value_from_config(name)
      if @config_hash.has_key?(name)
        yield(@config_hash[name])
      end
    end

    def initialize
      setup_defaults
    end

    def init_with(coder)
      setup_defaults

      @config_hash = normalize_config(coder)

      check_config_hash(@config_hash)

      configure
    rescue => ex
      puts "Processing #{coder.inspect}"
      raise
    end
  end
end
