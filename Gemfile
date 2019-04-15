source 'https://rubygems.org'

group :deploy do
  gem 'compass', "~> 1.0"
  gem 'corundum'
end

group :test, :development do
  gem "cadre"
  # gem 'perftools.rb' # doesn't work on Ruby 2.5?
end

group :test do
  gem 'nokogiri'
  gem 'rack-test'
  gem 'fuubar'
  gem 'vcr'
  gem 'webmock'
end

gemspec name: 'rhet-butler'
