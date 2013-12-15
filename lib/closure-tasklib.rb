require 'mattock'

module ClosureCompiler
  class Build < ::Mattock::TaskLib
    default_namespace :closure

    dir(:target_dir, 'generated',
        path(:target_javascript),
        path(:target_minified),
        path(:source_map)
       )

    dir(:project_dir, 'javascript',
      dir(:source_dir, "src", path(:header_template, "header-comments.js.erb")),
      dir(:temp_dir, "tmp", path(:header_comments, "header-comments.js"))
    )

    dir(:node_modules, "node_modules",
        dir(:closure_dir, "closure-library/closure",
            path(:closure_depswriter, "bin/build/depswriter.py"),
            dir(:closure_library_dir, "goog")),
        path(:closure_jar, "gclosure/tools/compiler.jar"),
          dir(:npm_bin, ".bin", path(:karma, "karma"))
    )

    #The entry point for the javascript - important so that Compiler doesn't
    #minify it away
    setting :entry_point

    setting :source_files
    setting :closure_dots

    setting :package_config, nested(
      :version => "0.5", #started in line with gem version
      :build_date => Time.new.strftime("%m-%d-%Y"),
      :copyright_year => Time.new.strftime("%Y")
    )

    def resolve_configuration
      super
      if source_map.field_unset?(:relative_path)
        source_map.relative_path = target_javascript.relpath + "-sourcemap-js"
      end
      if target_minified.field_unset?(:relative_path)
        target_minified.relative_path = target_javascript.relpath.sub(/\.js$/, ".min.js")
      end
      resolve_paths
      if field_unset?(:source_files)
         self.source_files = FileList["#{source_dir.abspath}/**/*.js"]
      end
      self.closure_dots = File::join(*(%w{..} * closure_library_dir.abspath.split(File::Separator).length))
    end

    def define
      in_namespace do
        namespace :test do
          task :start do
            exec(karma.abspath, "start")
          end

          desc "Force Karma to run the test suite"
          task :run do
            exec(karma.abspath, "run")
          end
        end

        namespace :build do
          directory target_dir.abspath
          directory temp_dir.abspath

          file header_comments.abspath => temp_dir.abspath do |file|
            templates = Valise::read_only(source_dir.abspath).templates([])
            erb = templates.find(header_template.relpath).contents
            File::open(file.to_s, "w") do |file|
              file.write(erb.render(package_config, {}))
            end
          end

#          file "src/deps.js" => source_files do |file|
#            sh %{/usr/bin/env python #{closure_depswriter} --root_with_prefix="#{source_dir} #{closure_dots}/#{source_dir}" > #{file}}
#          end

#          file "dependency.MF" => source_files do |file|
#            sh %{/usr/bin/env java -jar #{closure_jar} #{source_files.map{|src| "--js #{src}"}.join(" ")} --output_manifest #{file}}
#          end
#
          task :clobber_header_comments do
            rm_f header_comments.abspath
          end

          file target_javascript.abspath => [header_comments.abspath, target_dir.abspath] + source_files do |file|
            tmpfile = File::join(temp_dir.abspath, file.to_s.gsub(File::Separator, "_"))
            sh "java -jar #{closure_jar.abspath} " +
              "--closure_entry_point '#{entry_point}' " +
              "--create_source_map '#{source_map.abspath}' " +
              "--formatting PRETTY_PRINT " +
              "--manage_closure_dependencies " +
              "#{source_files.map{|file| "--js #{file} "}} " +
              "--js_output_file #{tmpfile}"

            sh "cat #{header_comments.abspath} #{tmpfile} > #{file}"
            #Trouble is that CC builds a source map with the full FS paths of
            #the sources - Chrome then tries to use those as the paths for URLs
            #to fetch them...
            #sh "echo '//# sourceMappingURL=/javascript/#{source_map.relpath}'
            #>> #{file}"
          end

          file target_minified.abspath => [target_javascript.abspath, header_comments.abspath, temp_dir.abspath] do |file|
            tmpfile = File::join(temp_dir.abspath, file.to_s.gsub(File::Separator, "_"))
            sh "java -jar #{closure_jar.abspath} --js #{target_javascript.abspath} --js_output_file #{tmpfile}"
            sh "cat #{header_comments.abspath} #{tmpfile} > #{file}"
            #sh "echo '//# sourceMappingURL=/javascript/#{source_map.relpath}'
            #>> #{file}"
          end

          task :project => [:clobber_header_comments, target_javascript.abspath, target_minified.abspath]
        end

        desc "Start a Karma test server"
        task :default => self['test:start']

        desc "Build the project and produce archived packages"
        task :build => self["build:project"]
      end
    end
  end
end
