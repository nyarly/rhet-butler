require 'jasmine'

class JasminePage < Jasmine::Page
  def runner_template
    File.read(File.join(File.dirname(__FILE__), "run.html.erb"))
  end

  def render
    ERB.new(runner_template).result(@context.instance_eval { binding })
  end
end

Jasmine.configure do |config|
  config.prevent_phantom_js_auto_install = true
  config.runner_browser = :chromeheadless
  config.src_dir = 'default-configuration/assets/javascript'
  config.add_rack_path(config.src_path, lambda {
    Rack::Cascade.new([
      Rack::URLMap.new('/' => Rack::File.new(config.src_dir)),
      Rack::Jasmine::Runner.new(JasminePage.new(config))
    ])
  })
end
