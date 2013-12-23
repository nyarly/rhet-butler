require 'addressable/uri'
module RhetButler
  module Stasis
    class Document
      attr_accessor :type, :body, :source_uri
    end
  end
end

require 'rhet-butler/stasis/rack-loader'
require 'rhet-butler/stasis/http-loader'
require 'rhet-butler/stasis/writer'
require 'rhet-butler/stasis/resource-mapping'
require 'rhet-butler/stasis/transform-queue'
require 'rhet-butler/stasis/document-transform'
require 'rhet-butler/stasis/identity-transform'
require 'rhet-butler/stasis/html-transform'
require 'rhet-butler/stasis/css-transform'
