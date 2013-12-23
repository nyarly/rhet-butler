require 'rhet-butler/resource-localizer'

describe RhetButler::ResourceLocalizer, :vcr => {} do
  let :test_target do
    "spec_support/tmp/test_localize"
  end

  let :valise do
    tgt = test_target
    Valise::define do
      rw tgt
    end
  end

  let :localizer do
    RhetButler::ResourceLocalizer.new.tap do |generator|
      generator.files = valise
      generator.source_uri = "http://fonts.googleapis.com/css?family=Arimo:700|Droid+Sans+Mono|Cinzel+Decorative:700,900|Slackey&subset=latin,latin-ext"
      generator.target_path = "stylesheets/fonts.css"
    end
  end

  before :each do
    FileUtils::rm_rf test_target
    FileUtils::mkdir_p test_target

    localizer.go!
  end

  it "should make some files" do
    Dir.entries(File::join(test_target, "stylesheets")).should include("fonts.css")
  end

  #it "should copy in static javascript"
  #it "should copy in static stylesheets"
  #it "should render sass files"
end
