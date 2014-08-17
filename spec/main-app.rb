require 'rhet-butler/web/main-app'

describe RhetButler::Web::MainApp do
  let :files do
    RhetButler::FileManager.new
  end

  let :app do
    RhetButler::Web::MainApp.new(files).tap do |app|
      app.presentation_app_class = RhetButler::Web::MemoizedPresentationApp
      app.assets_app_class = RhetButler::Web::MemoizedAssetsApp
    end
  end

  it "should build a server" do
    app.build_server.should be_a(Thin::Server)
  end
end
