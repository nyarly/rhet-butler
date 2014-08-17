require 'thin'
require 'rack/sockjs'

module RhetButler
  class QueueSession < SockJS::Session
    include Thin::Logging

    def initialize(connection)
      super
      @queue = connection.options[:queue]
    end
  end

  class FollowerSession < QueueSession
    def opened
      log_info("Follower opened socket")
      @queue.subscribe(self)
    end

    def close(*args)
      log_info("Follower closed socket")
      @queue.unsubscribe(self)
      super
    end
  end

  class LeaderSession < QueueSession
    def opened
      log_info("Leader opened socket")
    end

    def close(*args)
      log_info("Leader closed socket")
    end

    def process_message(message)
      log_info("Leader moved to slide #{message}")
      @queue.current_slide = message
      @queue.enqueue(message)
    end
  end

  class SlideMessageQueue
    include Thin::Logging

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
      @listeners.delete(session)
    end

    def enqueue(message)
      @listeners.keys.each do |session|
        begin
          session.send(message)
        rescue MetaState::WrongStateError => wse
          log_info("Follower in wrong state: #{wse.inspect}")
          @listeners.delete(session)
        end
      end
    end
  end
end
