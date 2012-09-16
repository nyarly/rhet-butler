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


    describe "presenter's view" do
      it "should serve a presenter's view"

      it "should include a link to the presentation"

      it "should include the live presentation in an iframe"

      it "should use a different arrangement for the presentation"
    end

    describe "review view" do
      it "should update the slides automatically when the files change"
    end
  end

  describe "slide processing" do
    it "should read slide configs and produce HTML"

    it "should parse YAML for the configs"

    describe "text processing" do
      it "should process slide text as directed"

      it "should transform Markdown to HTML"

      it "should transform asset macros"

      it "should insert slides from set references"

      it "should nest slides from set references"
    end

    describe "arrangements" do
      it "should apply arrangements to the slide set"
    end
  end
end
