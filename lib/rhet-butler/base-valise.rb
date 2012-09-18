require 'valise'

module RhetButler
  module BaseValise
    def self.instance
      @instance ||= Valise::define do
        rw ".rhet"
        rw "~/.rhet"
        rw "/usr/share/rhet-butler"
        rw "/etc/rhet-butler"
        ro from_here("../../default-configuration")
      end
    end
  end
end
