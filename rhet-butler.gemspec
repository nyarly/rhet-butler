Gem::Specification.new do |spec|
  spec.name		= "rhet-butler"
  spec.version		= "0.5.0"
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
  # !!find default-configuration -not -regex '.*\.sw.' -type f 2>/dev/null
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
    default-configuration/assets/favicon.ico
    default-configuration/assets/apple-touch-icon-precomposed.png
    default-configuration/assets/apple-touch-icon.png
    default-configuration/assets/rhet-butler.jpg
    default-configuration/assets/fonts/ptserif/v5/QABk9IxT-LFTJ_dQzv7xpJ0EAVxt0G0biEntp43Qt6E.ttf
    default-configuration/assets/fonts/ptserif/v5/EgBlzoNBIHxNPCMwXaAhYPesZW2xOQ-xsNqO47m55DA.ttf
    default-configuration/assets/fonts/ptserif/v5/Foydq9xJp--nfYIx2TBz9fEr6Hm6RMS0v1dtXsGir4g.ttf
    default-configuration/assets/fonts/ptserif/v5/03aPdn7fFF3H6ngCgAlQzC3USBnSvpkopQaUR-2r7iU.ttf
    default-configuration/assets/fonts/ptsans/v5/lILlYDvubYemzYzN7GbLkInF5uFdDttMLvmWuJdhhgs.ttf
    default-configuration/assets/fonts/ptsans/v5/FUDHvzEKSJww3kCxuiAo2A.ttf
    default-configuration/assets/fonts/ptsans/v5/0XxGQsSc1g4rdRdjJKZrNC3USBnSvpkopQaUR-2r7iU.ttf
    default-configuration/assets/fonts/ptsans/v5/PIPMHY90P7jtyjpXuZ2cLKCWcynf_cDxXwCLxiixG1c.ttf
    default-configuration/assets/fonts/opensans/v6/MTP_ySUJH_bn48VBG8sNSonF5uFdDttMLvmWuJdhhgs.ttf
    default-configuration/assets/fonts/opensans/v6/xjAJXh38I15wypJXxuGMBp0EAVxt0G0biEntp43Qt6E.ttf
    default-configuration/assets/fonts/opensans/v6/cJZKeOuBrn4kERxqtaUH3aCWcynf_cDxXwCLxiixG1c.ttf
    default-configuration/assets/fonts/opensans/v6/PRmiXeptR36kaC0GEAetxi8cqLH4MEiSE0ROcU-qHOA.ttf
    default-configuration/assets/stylesheets/google-open-sans.css
    default-configuration/assets/stylesheets/presenter/presentation.css
    default-configuration/assets/stylesheets/highlight/solarized_dark.css
    default-configuration/assets/stylesheets/setup.css
    default-configuration/assets/stylesheets/presentation.css
    default-configuration/assets/javascript/sockjs-0.2.1.js
    default-configuration/assets/javascript/highlight.pack.js
    default-configuration/assets/javascript/highlight.js/LICENSE
    default-configuration/assets/javascript/highlight.js/README.md
    default-configuration/assets/javascript/highlight.js/README.ru.md
    default-configuration/assets/javascript/highlight.js/classref.txt
    default-configuration/assets/javascript/impress.js
    default-configuration/assets/javascript/sockjs-0.3.js
    default-configuration/presenter/config.yaml
    default-configuration/presenter/templates/stylesheets.html.erb
    default-configuration/presenter/templates/slide-notes.html.erb
    default-configuration/presenter/templates/live-javascript.html.erb
    default-configuration/common/config.yaml
    default-configuration/common/templates/header-javascript.html
    default-configuration/common/templates/stylesheets.html.erb
    default-configuration/common/templates/presentation.html.erb
    default-configuration/common/templates/presenter-qr.html.erb
    default-configuration/viewer/config.yaml
    default-configuration/viewer/templates/slide-notes.html.erb
    default-configuration/viewer/templates/live-javascript.html.erb
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

  spec.add_dependency("tilt", "~> 1.4")
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
