require 'rhet-butler/slide'
require 'rhet-butler/slide-group'
require 'rhet-butler/slide-includer'

YAML.add_tag('!slide', RhetButler::Slide)
YAML.add_tag('!group', RhetButler::SlideGroup)
YAML.add_tag('!include', RhetButler::Includer)
