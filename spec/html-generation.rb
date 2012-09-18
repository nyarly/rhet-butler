require 'rhet-butler/html-generator'
require 'rhet-butler/file-manager'
require 'rhet-butler/slide'

describe RhetButler::HTMLGenerator do
  let :slides do
    one = RhetButler::Slide.new
    one.content = "A test slide"
    [ one ]
  end

  let :template_handler do
    RhetButler::TemplateHandler.new(RhetButler::FileManager.default, "templates")
  end

  let :generator do
    described_class.new(template_handler).tap do |gen|
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
