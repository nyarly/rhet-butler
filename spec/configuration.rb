require 'rhet-butler/configuration'
require 'valise'

describe RhetButler::Configuration, "defaults" do
  let :test_fileset do
    Valise::Set.new
  end

  subject :config do
    described_class.new(test_fileset)
  end

  its(:root_slide_template){ should == "presentation.html" }
  its(:username){ should == 'judson' }
  its(:password){ should == 'judsonr00tzme' }
  its(:author){ should == "Judson Lester" }
  its(:title){ should == 'Presentation' }
  its(:description){ should == "A nifty presentation made with Rhet Butler" }
  its(:search_paths){ should == [] }
  its(:static_target){ should == "static" }
  its(:impress_config){ should == {} }
  its(:root_arrangement){ should == "horizontal" }
  its(:arrangement_blueprint){ should == [] }
  its(:serve_port){ should == 8081 }
  its(:root_slide){ should == "slides.yaml" }
  its('default_content_filters'){ should == "textile" }
end
