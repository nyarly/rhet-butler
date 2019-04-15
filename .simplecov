require 'cadre/simplecov'

SimpleCov.start do
  formatter SimpleCov::Formatter::MultiFormatter.new([
    SimpleCov::Formatter::HTMLFormatter,
    Cadre::SimpleCov::VimFormatter
  ])
end
