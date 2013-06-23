Gem::Specification.new do |spec|
  spec.name		= "rhet-butler"
  spec.version		= "0.0.1"
  author_list = {
    "Judson Lester" => 'nyarly@gmail.com'
  }
  spec.authors		= author_list.keys
  spec.email		= spec.authors.map {|name| author_list[name]}
  spec.summary		= ""
  spec.description	= <<-EndDescription
  EndDescription

  spec.rubyforge_project= spec.name.downcase
  spec.homepage        = "http://nyarly.github.com/#{spec.name.downcase}"
  spec.required_rubygems_version = Gem::Requirement.new(">= 0") if spec.respond_to? :required_rubygems_version=

  # Do this: y$@"
  # !!find lib bin doc spec spec_help -not -regex '.*\.sw.' -type f 2>/dev/null
  spec.files		= %w[
    lib/rhet-butler/web/assets-app.rb
    lib/rhet-butler/web/presentation-app.rb
    lib/rhet-butler/web/main-app.rb
    lib/rhet-butler/web/qr-display-app.rb
    lib/rhet-butler/messaging.rb
    lib/rhet-butler/file-manager.rb
    lib/rhet-butler/configuration.rb
    lib/rhet-butler/command-line.rb
    lib/rhet-butler/html-generator.rb
    lib/rhet-butler/slide-group.rb
    lib/rhet-butler/arrangement.rb
    lib/rhet-butler/yaml-schema.rb
    lib/rhet-butler/slide-loader.rb
    lib/rhet-butler/slide.rb
    lib/rhet-butler/slide-includer.rb
    lib/rhet-butler/static-generator.rb
    lib/rhet-butler/yaml-type.rb
    lib/rhet-butler/layout-rule.rb
    lib/rhet-butler.rb
    bin/rhet-butler
    spec/slide-loader.rb
    spec/slide-processing.rb
    spec/html-generation.rb
    spec/rhet-butler.rb
    spec/presentation-view.rb
    spec/arrangements.rb
  ]

  spec.test_file        = "spec_support/gem_test_suite.rb"
  spec.licenses = ["MIT"]
  spec.require_paths = %w[lib/]
  spec.rubygems_version = "1.3.5"

  spec.has_rdoc		= true
  spec.extra_rdoc_files = Dir.glob("doc/**/*")
  spec.rdoc_options	= %w{--inline-source }
  spec.rdoc_options	+= %w{--main doc/README }
  spec.rdoc_options	+= ["--title", "#{spec.name}-#{spec.version} Documentation"]

  spec.executables = %w{rhet-butler}

  spec.add_dependency("tilt", "> 0")
  spec.add_dependency("thor", "> 0")
  spec.add_dependency("rack", "> 0")
  spec.add_dependency("thin", "> 0")
  spec.add_dependency("sockjs", "~> 0.2.1")
  spec.add_dependency("valise", "~> 0.9.1")

  spec.add_dependency("system-getifaddrs", "~> 0.2.0")
  spec.add_dependency("rqrcode", "~> 0.4.2")

  spec.add_dependency("RedCloth", "~> 4.2.9")

  #spec.post_install_message = "Thanks for installing my gem!"
end
