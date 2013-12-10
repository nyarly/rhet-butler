require 'nokogiri'

RSpec.configure do |config|
  config.backtrace_exclusion_patterns.delete(/gems/)
end
