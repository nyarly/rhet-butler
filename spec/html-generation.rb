require 'rhet-butler/html-generator'
require 'rhet-butler/file-manager'
require 'rhet-butler/slide'
require 'rhet-butler/configuration'

describe RhetButler::HTMLGenerator do
  let :slides do
    one = RhetButler::Slide.new
    one.content = "A test slide"
    [ one ]
  end

  let :files do
    manager = Object.new
    manager.extend(RhetButler::FileManager)
    manager.config_files("viewer") + manager.config_files("common")
  end

  let :template_handler do
    RhetButler::TemplateHandler.new(files, "templates")
  end

  let :configuration do
    RhetButler::Configuration.new(files)
  end

  let :generator do
    described_class.new(configuration, template_handler).tap do |gen|
      gen.slides = slides
    end
  end

  let :html do
    generator.html
  end

  it "should produce text from slides" do
    html.should be_a(String)
  end

  it "should produce good HTML" do
    expect do
      Nokogiri::HTML::Document.parse(html, nil, nil, Nokogiri::XML::ParseOptions::DEFAULT_XML)
    end.to_not raise_error
  end
end
