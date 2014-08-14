require 'rhet-butler/html-generator'
require 'rhet-butler/file-manager'
require 'rhet-butler/slide'
require 'rhet-butler/configuration'

describe RhetButler::HTMLGenerator do
  let :slides do
    one = RhetButler::Slide.new
    one.content = "A test slide"
    one.html_classes << "with-class"
    group = RhetButler::SlideGroup.new
    group.slides = [ one ]
    group.html_classes << "with-class"
    [ group ]
  end

  let :prez do
    RhetButler::SlideGroup.new.tap do |prez|
      prez.slides = slides
    end
  end

  let :files do
    manager = RhetButler::FileManager.new
  end

  let :template_handler do
    files.aspect_templates(:viewer)
  end

  let :configuration do
    files.aspect_config(:viewer)
  end

  let :generator do
    described_class.new(configuration, template_handler).tap do |gen|
      gen.root_step = prez
    end
  end

  let :root_template do
    "presentation.html"
  end

  let :html do
    generator.render(root_template)
  end

  it "should produce text from slides" do
    html.should be_a(String)
  end

  describe "produced HTML" do
    subject :doc do
      Nokogiri::HTML::Document.parse(html, nil, nil, Nokogiri::XML::ParseOptions::DEFAULT_XML)
    end

    it "should include the group" do
      doc.css('.group').should_not be_empty
    end

    it "should add the class to the group" do
      doc.css('.group.with-class').should_not be_empty
    end

    it "should include the slide" do
      doc.css('.slide').should_not be_empty
    end

    it "should add the class to the group" do
      doc.css('.slide.with-class').should_not be_empty
    end
  end
end
