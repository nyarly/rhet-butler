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

import states from './transition-states.js';
import TransitionStation from './transition-station.js';
//import * from '../utils.js';

export default class {
  constructor(presenter, firstStep, currentStep, lastStep){
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
  }

  changeState(name){
    if(typeof quiet_console == "undefined"){
      console.log("Changing state: " + name +
          " S/C/E: " + this.firstStep.toString() +
          " / " + this.currentStep.toString() +
          " / " + this.lastStep.toString()
      );
    }
    var newState = states[name];
    for(let func in newState){
      this[func] = newState[func];
    }
    for(let stateName in states){
      this.presenter.rootStep.removeClass(stateName);
    }
    this.presenter.rootStep.addClass(name);
    this.currentState = name;
    this.enterState();
  }

  buildList(){
    var step = this.firstStep;
    var checkedIn = true;
    var station;

    this.direction = this.firstStep.relativePosition(this.lastStep);

    while(step != null){
      checkedIn = checkedIn && (step != this.currentStep);
      station = new TransitionStation(step);
      this.uphill.push(station);
      if(checkedIn){
        station.visited();
      }
      step = step.parent;
    }
    step = this.lastStep;
    while(step != null){
      this.downhill.unshift(new TransitionStation(step));
      step = step.parent;
    }
  }

  startElemId(){
    return "prev_" + this.firstStep.element.id;
  }

  endElemId(){
    return "next_" + this.lastStep.element.id;
  }

  eachStation(func){
    this.uphill.forEach(func, this);
    this.downhill.forEach(func, this);
  }

  //XXX The bind does not appear to be working:
  //  station is an animation event, and
  //  event is undefined
  arriveListener(station, event){
    console.log("rhet-butler/transition-stations.js:256", "event", event);
    event.stopPropagation();

    station.visited();
    this.elementArrived();

    return true;
  }

  elementArrived(station){
    while(this.nextStation()){
    };
    if(typeof quiet_console == "undefined"){
      console.log("Waiting for event")
    };
  }
}
