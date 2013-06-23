require 'thin'
require 'rack/sockjs'

module RhetButler
  class FollowerSession < SockJS::Session
    def initialize(connection)
      super
      @queue = connection.options[:queue]
    end

    def opened
      @queue.subscribe(self)
    end

    def close(*args)
      @queue.unsubscribe(self)
      super
    end
  end

  class LeaderSession < SockJS::Session
    def initialize(connection)
      super
      @queue = connection.options[:queue]
    end

    def process_message(message)
      @queue.current_slide = message
      @queue.enqueue(message)
    end
  end

  class SlideMessageQueue
    attr_accessor :current_slide
    def initialize
      @listeners = {}
    end

    def inspect
      "<<#{self.class.name} Listeners: #{@listeners.keys.length}>>"
    end

    def subscribe(session)
      @listeners[session] = true
      session.send(current_slide) unless current_slide.nil?
    end

    def unsubscribe(session)
      @listeners.delete_key(session)
    end

    def enqueue(message)
      @listeners.keys.each do |session|
        session.send(message)
      end
    end
  end
end
