require 'fileutils'
File::open(ARGV[0]) do |list|
  list.each_line do |line|
    line.chomp!
    dest = line.sub(/.*fonts\//,"")
    FileUtils::mkdir_p(File::dirname(dest))
    %x"curl #{line} -o #{dest}"
  end
end
