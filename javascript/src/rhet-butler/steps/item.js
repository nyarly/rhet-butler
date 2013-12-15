goog.provide('rhetButler.Steps.Item');
goog.require('rhetButler.ChildStep');

rhetButler.Steps.Item = function(parent, element, indexes, cue){
  this._cue = cue;
  this.setup(parent, element, indexes);
};
rhetButler.Steps.Item.prototype = new rhetButler.ChildStep;

;(function(){
    var item = rhetButler.Steps.Item.prototype;

    item.cue = function(){ return this._cue; };

    item.addChild = function(step){
      this.parent.addChild(step);
    };

    item.addNextStep = function(step){
      step.addPrevItem(this);
    };

    item.addPrevStep = function(step){
      step.addNextItem(this);
    };

    item.addNextItem = function(item){
      this.debugAssoc("ini", item)
      this.nextItem = item;
    };

    item.addPrevItem = function(item){
      this.debugAssoc("ipi", item)
      this.prevItem = item;
    };

    item.beginDeparture = function(){
      this.parent.addClass("prev-" + this.cue());
      this.parent.removeClass(/^current-cue-.*/);
      this.parent.beginDeparture();
    };

    item.completeDeparture = function(){
      this.parent.removeClass("prev-" + this.cue());
      this.parent.completeDeparture();
    };

    item.beginArrival = function(){
      this.parent.addClass("next-" + this.cue());
      this.parent.beginArrival();
    };

    item.completeArrival = function(){
      this.parent.removeClass("next-" + this.cue());
      this.parent.addClass("current-" + this.cue());
      this.parent.completeArrival();
    };
  })();
