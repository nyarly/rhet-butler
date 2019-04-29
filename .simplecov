require 'cadre/simplecov'
require 'simplecov-json'

SimpleCov.start do
  add_filter 'spec/'
  add_filter 'spec_support/'
  coverage_dir('corundum/docs/coverage')
  formatter SimpleCov::Formatter::MultiFormatter.new([
    SimpleCov::Formatter::HTMLFormatter,
    SimpleCov::Formatter::JSONFormatter,
    Cadre::SimpleCov::VimFormatter
  ])
end
