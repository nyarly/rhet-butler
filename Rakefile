# vim: set ft=ruby :
require 'corundum/tasklibs'
require 'closure-tasklib'

module Corundum
  Corundum::register_project(__FILE__)

  core = Core.new

  core.in_namespace do
    GemspecFiles.new(core) do |files|
      files.extra_files = Rake::FileList["default-configuration/**/*"]
    end
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

ClosureCompiler::Build.new do |build|
  build.target_dir.absolute_path = "default-configuration/assets/javascript"
  build.target_javascript.relative_path = "rhet-present.js"
  build.entry_point = "rhetButler.Presenter"
end

file "default-configuration/assets/javascript/present.js" => "javascript/src/present.js" do |task|
  cmd("cp", "default-configuration/assets/javascript/present.js", "javascript/src/present.js").must_succeed!
end

task :default => [:release, :publish_docs]
