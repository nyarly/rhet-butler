require 'nokogiri'
require 'cadre/rspec'
require 'vcr'

RSpec.configure do |config|
  config.backtrace_exclusion_patterns.delete(/gems/)

  config.run_all_when_everything_filtered = true
  config.add_formatter(Cadre::RSpec::NotifyOnCompleteFormatter)
  config.add_formatter(Cadre::RSpec::QuickfixFormatter)
end

VCR.configure do |config|
  config.cassette_library_dir = "vcr_cassettes"
  config.hook_into :webmock
  config.configure_rspec_metadata!
end
