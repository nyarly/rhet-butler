require 'nokogiri'
require 'cadre/rspec'

RSpec.configure do |config|
  config.backtrace_exclusion_patterns.delete(/gems/)

  config.run_all_when_everything_filtered = true
  config.add_formatter(Cadre::RSpec::NotifyOnCompleteFormatter)
  config.add_formatter(Cadre::RSpec::QuickfixFormatter)
end
