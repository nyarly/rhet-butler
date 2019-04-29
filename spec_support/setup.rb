require 'nokogiri'
require 'vcr'
require 'rspec/its'

RSpec.configure do |config|
  config.backtrace_exclusion_patterns.delete(/gems/)

  config.run_all_when_everything_filtered = true
  config.example_status_persistence_file_path = "example_status"
  config.expect_with(:rspec) { |c| c.syntax = [:should, :expect] } # ought to just be expect
end

VCR.configure do |config|
  config.cassette_library_dir = "vcr_cassettes"
  config.hook_into :webmock
  config.configure_rspec_metadata!
end
