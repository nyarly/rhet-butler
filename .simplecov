require 'cadre/simplecov'

SimpleCov.start do
  coverage_dir "corundum/docs/coverage"
  add_filter "./spec"

  formatter SimpleCov::Formatter::MultiFormatter[
    SimpleCov::Formatter::HTMLFormatter,
    Cadre::SimpleCov::VimFormatter
  ]
end
