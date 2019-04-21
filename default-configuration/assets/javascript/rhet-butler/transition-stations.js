//StationList -> *[Station]
//  Runs through the JS mechanics of transitioning between steps -
//
//  * marks all slides in the stream as prior and post
//  * marks the current step,
//  * handles event listeners
//  * issues most custom events.
//
//  FSM: preparing -> started-uphill -> downhill -> completed
//

goog.provide('rhetButler.TransitionStations');
goog.require('rhetButler.TransitionStation');
goog.require('rhetButler');

rhetButler.TransitionStations = function(presenter, firstStep, currentStep, lastStep){
  this.presenter = presenter;
  this.uphill = [];
  this.uphillIndex = 0;
  this.downhill = [];
  this.downhillIndex = 0;
  this.firstStep = firstStep;
  this.currentStep = currentStep;
  this.lastStep = lastStep;
  this.buildList();
  this.currentState = null;
  this.changeState("preparing")
};

//XXX element/step/station...
;(function(){
    var stationList = rhetButler.TransitionStations.prototype;
    var states = {
      preparing: {},
      uphill: {},
      downhill: {},
      cancelled: {},
      arrived: {}
    }

    var baseState = { };

    // baseState should throw a buncha not-implemented or wrong-state
    baseState.enter = function(){
    };

    baseState.start = function(){
      //raise exception?
    };

    baseState.cancel = function(){
      this.changeState("cancelled");
    };

    baseState.forceFinish = function(){
      console.log("Force Finish");

    };

    baseState.finish = function(){
      //
    };

    baseState.currentLeg = function(){
      return [];
    };

    baseState.enterState = function(){
    };

    baseState.resumeStep = function(){
      return this.firstStep;
    };

    baseState.currentStation = function(){
      return null;
    };

    baseState.advanceStation = function(){
    };

    baseState.nextStation = function(){
      this.currentStation().visit();
      if(this.currentStation().checkIn){
        return this.advanceStation();
      } else {
        var stationList = this;
        var targetStation = this.currentStation();
        this.currentStation().setArriveHandler( function(event){ stationList.arriveListener(targetStation, event); });
        return false;
      }
    };

    for(name in states){
      for(func in baseState){
        states[name][func] = baseState[func];
      }
    }

    states.preparing.enterState = function(){
      this.eachStation(function(station){ station.prepare(); })
    };

    states.preparing.start = function(){
      this.changeState("uphill");
      this.elementArrived(this.currentStep);
      //Events + class changes
    };

    states.preparing.forceFinish = function(){
      this.eachStation(function(station){ station.visited() });
      this.changeState("arrived");
    }

    states.uphill.enterState = function(){
      this.currentStep = this.uphill[0].step;

      this.presenter.rootStep.beginTransition(this);

      this.firstStep.beginDeparture();
      this.lastStep.beginArrival();
    };

    states.uphill.finish = function(){
      this.changeState("downhill");
    };

    states.uphill.currentLeg = function(){
      return this.uphill;
    };

    states.uphill.currentStation = function(){
      return this.uphill[this.uphillIndex];
    };

    states.uphill.advanceStation = function(){
      this.uphillIndex++;
      if(this.uphillIndex < this.uphill.length){
        this.currentStep = this.currentStation().step;
      } else {
        this.changeState("downhill");
      }
      return true
    };

    states.downhill.currentLeg = function(){
      return this.downhill;
    };

    states.downhill.enterState = function(){
      this.currentStep = this.downhill[0].step;
    };

    states.downhill.currentStation = function(){
      return this.downhill[this.downhillIndex];
    };

    states.downhill.advanceStation = function(){
      this.downhillIndex++;
      if(this.downhillIndex < this.downhill.length){
        this.currentStep = this.currentStation().step;
        return true;
      } else {
        this.changeState("arrived");
        return false;
      }
    };

    states.downhill.finish = function(){
      this.changeState("arrived");
    };

    states.downhill.resumeStep = function(){
      return this.lastStep;
    };

    states.cancelled.enterState = function(){
      this.eachStation(function(station){
          if(station.step == this.currentStep){ return; };
          station.complete()
        }, this)

      this.presenter.rootStep.completeTransition(this);

      this.firstStep.completeDeparture();
      this.lastStep.cancelArrival();
    };

    states.arrived.enterState = function(){
      this.eachStation(function(station){ station.complete() })

      this.currentStep = this.lastStep;

      this.presenter.rootStep.completeTransition(this);

      this.firstStep.completeDeparture();
      this.lastStep.completeArrival();

      this.presenter.completeTransition();
    };

    states.arrived.resumeStep = function(){
      return this.lastStep;
    };

    states.arrived.nextStation = function(){
      return false;
    };

    states.arrived.cancel = function(){
      return false;
    };

    stationList.changeState = function(name){
      if(typeof quiet_console == "undefined"){
        console.log("Changing state: " + name +
            " S/C/E: " + this.firstStep.toString() +
            " / " + this.currentStep.toString() +
            " / " + this.lastStep.toString());
        }
      var newState = states[name];
      for(func in newState){
        this[func] = newState[func];
      }
      for(stateName in states){
        this.presenter.rootStep.removeClass(stateName);
      }
      this.presenter.rootStep.addClass(name);
      this.currentState = name;
      this.enterState();
    }

    stationList.buildList = function(){
      var step = this.firstStep;
      var checkedIn = true;
      var station;

      this.direction = this.firstStep.relativePosition(this.lastStep);

      while(step != null){
        checkedIn = checkedIn && (step != this.currentStep);
        station = new rhetButler.TransitionStation(step);
        this.uphill.push(station);
        if(checkedIn){
          station.visited();
        }
        step = step.parent;
      }
      step = this.lastStep;
      while(step != null){
        this.downhill.unshift(new rhetButler.TransitionStation(step));
        step = step.parent;
      }
    };

    stationList.startElemId = function(){
      return "prev_" + this.firstStep.element.id;
    };

    stationList.endElemId = function(){
      return "next_" + this.lastStep.element.id;
    };

    stationList.eachStation = function(func){
      this.uphill.forEach(func, this);
      this.downhill.forEach(func, this);
    };

    //XXX The bind does not appear to be working:
    //  station is an animation event, and
    //  event is undefined
    stationList.arriveListener = function(station, event){
      console.log("rhet-butler/transition-stations.js:256", "event", event);
      event.stopPropagation();

      station.visited();
      this.elementArrived();

      return true;
    };

    stationList.elementArrived = function(station){
      while(this.nextStation()){
      };
      if(typeof quiet_console == "undefined"){
        console.log("Waiting for event")
      };
    };
  })();
