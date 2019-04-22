let states = {
  preparing: {},
  uphill: {},
  downhill: {},
  cancelled: {},
  arrived: {}
};

export default states;

for(name in states){
  // states[name] should throw a buncha not-implemented or wrong-state
  states[name].enter = function(){ };

  states[name].start = function(){
    //raise exception?
  };

  states[name].cancel = function(){
    this.changeState("cancelled");
  };

  states[name].forceFinish = function(){
    console.log("Force Finish");

  };

  states[name].finish = function(){
    //
  };

  states[name].currentLeg = function(){
    return [];
  };

  states[name].enterState = function(){ };

  states[name].resumeStep = function(){
    return this.firstStep;
  };

  states[name].currentStation = function(){
    return null;
  };

  states[name].advanceStation = function(){ };

  states[name].nextStation = function(){
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
