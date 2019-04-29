# vim: set ft=ruby :
require 'corundum/tasklibs'
require 'jasmine'

load 'jasmine/tasks/jasmine.rake'

module Corundum
  Corundum::register_project(__FILE__)

  core = Core.new

  core.in_namespace do
    GemspecFiles.new(core) do |files|
      files.extra_files = Rake::FileList["default-configuration/**/*"]
      files.extra_files.exclude("**/*-sourcemap-js")
    end
    %w{profanity debugging ableism racism sexism}.each do |type|
      QuestionableContent.new(core) do |qc|
        qc.type = type
      end
    end
    rspec = RSpec.new(core)
    cov = SimpleCov.new(core, rspec) do |cov|
      cov.threshold = 91
    end

    gem = GemBuilding.new(core)
    cutter = GemCutter.new(core,gem)
    #email = Email.new(core)
    vc = Git.new(core) do |vc|
      vc.branch = "master"
    end

    #yd = YARDoc.new(core)

    #docs = DocumentationAssembly.new(core, yd, rspec, cov)

    #pages = GithubPages.new(docs)
  end
end

#task 'gemspec_files:files_exist' =>
#"default-configuration/assets/javascript/rhet-present.js"

task :default => [:release, :publish_docs]
