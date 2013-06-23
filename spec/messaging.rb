require 'rhet-butler/messaging'
require 'ostruct'

describe RhetButler::SlideMessageQueue do
  let :queue do
    RhetButler::SlideMessageQueue.new
  end

  let :sockjs_options do
    OpenStruct.new(:options =>{ :sockjs_url => "/assets/javascript/sockjs-0.2.1.js", :queue => queue})
  end

  let :leader do
    RhetButler::LeaderSession.new(sockjs_options)
  end

  let :follower do
    RhetButler::FollowerSession.new(sockjs_options).tap do |follower|
      follower.opened
    end
  end

  it "should transmit messages from leader to follower" do
    leader
    follower.should_receive(:send).with("testing")
    leader.process_message("testing")
  end

  it "should transmit 'leader arrived' with slide when leader connects"
  it "should transmit current slide to new followers"
  it "should not send a current slide if leader has detached"
end
