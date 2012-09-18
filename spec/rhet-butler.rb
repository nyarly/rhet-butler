require 'rhet-butler'

describe RhetButler do
  describe "web server" do
    describe "presentation view" do
      it "should serve a presentation"

      it "should include impress.js"

      it "should have get WebSocket commands to sync with presenter"

      it "should be able to split from presenter"

      it "should be able to resync with presenter"

      it "should have a resource for the current presenter's slide"
    end

    describe "passive view" do
      it "should serve the presentation"

      it "should not respond to key press events"
    end

    describe "presenter's view" do
      it "should serve a presenter's view"

      it "should include a link to the presentation"

      it "should include the live presentation in an iframe"

      it "should use a different arrangement for the presentation"
    end

    describe "review view" do
      it "should update the slides automatically when the files change"

      it "should update processed assets automatically"
    end
  end

  describe "slide processing" do
    describe "text processing" do
      it "should process slide text as directed"

      it "should transform Markdown to HTML"

      it "should transform asset macros"

      it "should insert slides from set references"

      it "should nest slides from set references"
    end

    describe "asset handling" do
      it "should process SASS files and provide CSS links"
    end
  end
end
