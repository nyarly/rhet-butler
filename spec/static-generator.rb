require 'rhet-butler/static-generator'
require 'rhet-butler/configuration'

describe RhetButler::StaticGenerator do
  let :test_target do
    "spec_support/tmp/test_target"
  end

  before :all do
    test_target = "spec_support/tmp/test_target"

    filer = Object.new.tap do |obj|
      obj.extend RhetButler::FileManager
    end

    files = filer.viewer_config
    configuration = RhetButler::Configuration.new(
      files,
      "sources" => ["spec_support/fixtures/project"],
      "static_target" => test_target)
    generator = RhetButler::StaticGenerator.new(configuration)

    FileUtils::rm_rf test_target
    FileUtils::mkdir_p test_target

    generator.go!
  end

  it "should make some files" do
    Dir.entries(test_target).should include("presentation.html")
  end
end
