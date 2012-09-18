require 'rhet-butler/arrangement'
require 'rhet-butler/slide'

describe RhetButler::Arrangement do
  let :slides do
    (1..5).map do |num|
      RhetButler::Slide.new.tap do |slide|
        slide.content = "Slide ##{num}"
      end
    end
  end

  describe "horizontal" do
    let :arrangement do
      RhetButler::Arrangement["horizontal"].new(slides)
    end

    let :arranged do
      arrangement.to_a
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
