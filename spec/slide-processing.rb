require 'rhet-butler/slide-loader'

describe RhetButler::SlideProcessor do
  def slide(content)
    slide = RhetButler::Slide.new
    slide.content = content
    slide
  end

  def group(*slides)
    group = RhetButler::SlideGroup.new
    group.slides = slides
    group
  end

  let :slides do
    [
      slide("A"),
      slide("B"),
      group(slide("C"), slide("D"), slide("E"))
    ]
  end

  let :root_group do
    group(slides)
  end

  let :root_arrangement do
    RhetButler::Arrangement['horizontal'].new
  end

  let :blueprint do
    {}
  end

  let :processor do
    processor = RhetButler::SlideProcessor.new
    processor.root_group = root_group
    processor.root_arrangement = root_arrangement
    processor.blueprint = blueprint
    processor
  end

  let :result do
    processor.process
    processor.slides
  end

  it "should produce slides" do
    result.each do |slide|
      slide.should be_a_kind_of(RhetButler::Slide)
    end
  end

  it "should put all the slides in order" do
    result.map do |slide|
      slide.content
    end.should == %w{A B C D E}
  end
end
