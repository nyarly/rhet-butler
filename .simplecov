require 'cadre/simplecov'
require 'simplecov-json'

SimpleCov.start do
  coverage_dir('corundum/docs/coverage')
  formatter SimpleCov::Formatter::MultiFormatter.new([
    SimpleCov::Formatter::HTMLFormatter,
    SimpleCov::Formatter::JSONFormatter,
    Cadre::SimpleCov::VimFormatter
  ])
end
