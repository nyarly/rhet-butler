require 'rhet-butler/web/main-app'
require 'rhet-butler/file-manager'
require 'rhet-butler/configuration'
require 'rack/test'

describe RhetButler::Web::MainApp do
  describe "presentation view" do
    include Rack::Test::Methods

    let :files do
      RhetButler::FileManager.define do
        stemmed("slides") do
          rw "spec_support/fixtures/project"
        end
      end +
        RhetButler::FileManager.defaults("viewer") +
        RhetButler::FileManager.defaults("common")
    end

    let :config_hash do
      {}
    end

    let :configuration do
      RhetButler::Configuration.new(files, config_hash)
    end

    let :app do
      described_class.new(configuration, nil).app
    end

    describe "/" do
      before :each do
        get "/"
      end

      it "should serve a presentation" do
        last_response.should be_ok
      end

      it "should have a script tag for impress.js" do
        doc = Nokogiri::HTML(last_response.body)
        doc.xpath("//script[contains(@src, 'impress.js')]").should_not be_empty
      end
    end

    describe "/assets/javascript/impress.js" do
      before :each do
        get "/assets/javascript/impress.js"
      end

      it "should serve the javascript" do
        last_response.should be_ok
      end

      it "should serve as application/javascript" do
        last_response.headers["Content-Type"].should == "application/javascript"
      end

    end


    it "should have get WebSocket commands to sync with presenter"

    it "should be able to split from presenter"

    it "should be able to resync with presenter"

    it "should have a resource for the current presenter's slide"
  end
end
