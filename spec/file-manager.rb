require 'rhet-butler/file-manager'

describe RhetButler::FileManager do
  let :file_manager do
    described_class.define do
      stemmed("slides") do
        rw 'spec_support/fixtures/project'
      end
    end
  end

  let :slides do
    file_manager.load_slides('one.yaml')
  end

  it "should parse YAML for the configs" do
    slides.should have_at_least(1).slides
    slides.should be_all{|slide| RhetButler::Slide === slide}
  end
end
