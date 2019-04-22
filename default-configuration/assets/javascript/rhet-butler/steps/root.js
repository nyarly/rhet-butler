import Step from "../step.js";

export default class extends Step {
  constructor(element, indexes){
    super(element, indexes)
  }

  propagateDescendant(newChild){
  }

  addNextStep(step){
    step.addPrevRoot(this);
  }

  addPrevStep(step){
    step.addNextRoot(this);
  }

  beginTransition(stationList){
    this.addClass("moving");
    this.addClass(stationList.startElemId());
    this.addClass(stationList.endElemId());
    stationList.direction.forEach(function(dirPart){
        this.addClass(dirPart);
      }, this);
  }

  completeTransition(stationList){
    this.removeClass("moving");
    this.removeClass(stationList.startElemId());
    this.removeClass(stationList.endElemId());
    stationList.direction.forEach(function(dirPart){
        this.removeClass(dirPart);
      }, this);
  }

  beginArrival(){ }
  completeArrival(){ }
  beginDeparture(){ }
  completeDeparture(){ }
}
