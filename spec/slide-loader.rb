require 'valise'
require 'rhet-butler/configuration'
require 'rhet-butler/slide-loader'

describe RhetButler::SlideLoader do
  let :files do
    Valise::Set.define do
      stemmed("slides") do
        rw 'spec_support/fixtures/project'
      end
      rw 'spec_support/fixtures/project'

      handle "config.yaml", :yaml, :hash_merge
    end
  end

  let :configuration do
    RhetButler::Configuration.new(files)
  end

  let :loader do
    described_class.new(configuration)
  end

  let :slides do
    loader.load_slides
  end

  it "should parse YAML for the configs" do
    slides.should have_at_least(1).slides
    slides.should be_all{|slide| RhetButler::Slide === slide}
  end
end
