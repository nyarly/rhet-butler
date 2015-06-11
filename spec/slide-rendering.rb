require 'rhet-butler/slide-loader'

describe RhetButler::SlideRenderer do
  def slide(content)
    slide = RhetButler::Slide.new
    slide.raw_content = content
    slide.content_filters = default_content_filters
    slide.note_filters = default_content_filters
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
    group(*slides)
  end

  let :default_content_filters do
    [RhetButler::SlideRenderers::Textile.new]
  end

  let :rendering do
    rendering = RhetButler::SlideRendering.new
    rendering.root_group = root_group
    rendering
  end

  let :result do
    rendering.traverse
    root_group
  end

  it "should apply rendering to all slides" do
    result.first.content.should =~ /<p>/
  end

  describe "with markdown" do
    let :default_content_filters do
      [RhetButler::SlideRenderers::Markdown.new]
    end

    it "should apply rendering to all slides" do
      result.first.content.should =~ /<p>/
    end
  end
end
