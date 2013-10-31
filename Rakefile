# vim: set ft=ruby :
require 'corundum/tasklibs'

module Corundum
  Corundum::register_project(__FILE__)

  core = Core.new

  core.in_namespace do
    sanity = GemspecSanity.new(core)
    QuestionableContent.new(core) do |swearing|
      swearing.type = :swear
      swearing.words = %w{fuck shit bitch cock}
    end
    QuestionableContent.new(core) do |dbg|
      dbg.words = %w{p debugger}
    end
    rspec = RSpec.new(core)
    cov = SimpleCov.new(core, rspec) do |cov|
      cov.threshold = 70
    end

    gem = GemBuilding.new(core)
    cutter = GemCutter.new(core,gem)
    email = Email.new(core)
    vc = Git.new(core) do |vc|
      vc.branch = "master"
    end

    yd = YARDoc.new(core)

    docs = DocumentationAssembly.new(core, yd, rspec, cov)

    pages = GithubPages.new(docs)
  end
end

file "default-configuration/assets/javascript/present.js" => "javascript/src/present.js" do |task|
  cmd("cp", "default-configuration/assets/javascript/present.js", "javascript/src/present.js").must_succeed!
end

task 'gemspec_sanity:files_exist' => "default-configuration/assets/javascript/present.js"

task :default => [:release, :publish_docs]
