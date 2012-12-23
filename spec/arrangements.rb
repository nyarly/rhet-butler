require 'rhet-butler/arrangement'
require 'rhet-butler/slide'
require 'rhet-butler/slide-loader'

describe RhetButler::Arrangement do
  let :slides do
    (1..5).map do |num|
      RhetButler::Slide.new.tap do |slide|
        slide.content = "Slide ##{num}"
      end
    end
  end

  let :arranger do
    arranger = RhetButler::SlideArranger.new
    arranger.root_arrangement = arrangement
    arranger
  end

  let :arranged do
    arranger.traverse
    arranger.slides
  end

  describe "digression" do
    let :arrangement do
      arrangement = RhetButler::Arrangement["linear"].new(1000, 0)
      digression = RhetButler::Arrangement["linear-digress"].new(0, 1000)
      digression.slides = (1..3).map do |num|
        RhetButler::Slide.new.tap do |slide|
          slide.content = "Aside ##{num}"
        end
      end
      arrangement.slides = slides
      arrangement.slides.insert(4, digression)
      arrangement
    end

    it "should still last slide a 5000,0" do
      arranged.last.position.x.should == 5000
      arranged.last.position.y.should == 0
    end

    it "should have 8 slides" do
      arranged.should have(8).slides
    end

    it "should put the last digression slide at 4000,3000" do
      arranged[6].position.x.should == 4000
      arranged[6].position.y.should == 3000
    end
  end

  describe "horizontal" do
    let :arrangement do
      arrangement = RhetButler::Arrangement["horizontal"].new
      arrangement.slides = slides
      arrangement
    end

    it "should all at the same y position" do
      arranged.map do |slide|
        slide.position.y
      end.uniq.should have(1).value
    end

    it "should monotonically increase x position" do
      arranged.each_cons(2).map do |left, right|
        right.position.x - left.position.x
      end.each do |difference|
        difference.should > 0
      end
    end

  end
end
