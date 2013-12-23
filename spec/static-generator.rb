require 'rhet-butler/static-generator'
require 'rhet-butler/configuration'

describe RhetButler::Stasis::ResourceMapping do
  let :mapper do
    described_class.new.tap do |mapper|
      mapper.default_uri = "http://example.com"
    end
  end

  it "should map / to index.html" do
    mapper.storage_for("/").should == "index.html"
  end

  it "should map /assets/stylesheet.css to assets/stylesheet.css" do
    mapper.storage_for("/assets/stylesheet.css").should == "assets/stylesheet.css"
  end
end

describe RhetButler::StaticGenerator do
  let :test_target do
    "spec_support/tmp/test_target"
  end

  let :store_log do
    require 'stringio'
    StringIO.new
  end

  before :each do
    test_target = "spec_support/tmp/test_target"

    files = RhetButler::FileManager.new(
      "sources" => ["spec_support/fixtures/project"],
      "static_target" => test_target)

    generator = RhetButler::StaticGenerator.new(files)
    generator.store_log = store_log

    FileUtils::rm_rf test_target
    FileUtils::mkdir_p test_target

    generator.go!
  end

  it "should make some files" do
    Dir.entries(test_target).should include("index.html")
    store_log.string.lines.to_a.size.should > 3
  end

  #it "should copy in static javascript"
  #it "should copy in static stylesheets"
  #it "should render sass files"
end
