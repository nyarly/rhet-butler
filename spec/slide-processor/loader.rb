require 'rhet-butler/slide-loader'

describe RhetButler::SlideLoader do
  let :loader do
    described_class.new(RhetButler::BaseValise.instance).tap do |loader|
      loader.reset_overlay
      loader.extend_search("slides") do
        rw 'spec_support/fixtures/project'
      end
    end
  end

  let :slides do
    loader.load('one.yaml')
  end

  it "should parse YAML for the configs" do
    slides.should have_at_least(1).slides
    slides.should be_all{|slide| RhetButler::Slide === slide}
  end
end
