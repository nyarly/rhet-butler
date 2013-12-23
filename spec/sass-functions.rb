require 'rhet-butler/sass-functions'
require 'rhet-butler/web/assets-app'
require 'rhet-butler/file-manager'

describe Sass::Script::Functions do
  let :files do
    RhetButler::FileManager.new("sources" => %w{ spec_support/fixtures/project })
  end

  let :assets do
    RhetButler::Web::AssetsApp.new(files)
  end

  let :rendered do
    assets.assets_context.render("stylesheets/tricky.css")
  end

  it "should calculate exp(2px,2)" do
    rendered.should match(/font-size: 4px/)
  end

  it "should calculate tween(1em, 3em, 50%)" do
    rendered.should match(/height: 2em/)
  end
end
