goog.provide('rhetButler.Steps.Root');
goog.require('rhetButler.Step');
rhetButler.Steps.Root = function(element, indexes){
  this.setup(element, indexes);
};
rhetButler.Steps.Root.prototype = new rhetButler.Step;

;(function(){
    var root = rhetButler.Steps.Root.prototype;

    root.propagateDescendant = function(newChild){
    };

    root.addNextStep = function(step){
      step.addPrevRoot(this);
    };

    root.addPrevStep = function(step){
      step.addNextRoot(this);
    };

    root.beginTransition = function(stationList){
      this.addClass("moving");
      this.addClass(stationList.startElemId());
      this.addClass(stationList.endElemId());
      stationList.direction.forEach(function(dirPart){
          this.addClass(dirPart);
        }, this);
    };

    root.completeTransition = function(stationList){
      this.removeClass("moving");
      this.removeClass(stationList.startElemId());
      this.removeClass(stationList.endElemId());
      stationList.direction.forEach(function(dirPart){
          this.removeClass(dirPart);
        }, this);
    };

    root.beginArrival = function(){ };
    root.completeArrival = function(){ };
    root.beginDeparture = function(){ };
    root.completeDeparture = function(){ };
  })();
