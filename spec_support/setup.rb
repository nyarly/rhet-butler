require 'nokogiri'

RSpec.configure do |config|
  config.backtrace_clean_patterns.delete(/gems/)
end
