import ChildStep from "../child-step.js";

export default class extends ChildStep {
  constructor(parent, element, indexes, cue){
    super(parent, element, indexes);
    this._cue = cue;
  }

  cue(){
    return this._cue;
  }

  addChild(step){
    this.parent.addChild(step);
  }

  joinParent(parent){
    parent.lastItem = this;
  }

  addNextStep(step){
    step.addPrevItem(this);
  }

  addPrevStep(step){
    step.addNextItem(this);
  }

  addNextItem(item){
    this.debugAssoc("ini", item)
    this.nextItem = item;
  }

  addPrevItem(item){
    this.debugAssoc("ipi", item)
    this.prevItem = item;
  }

  beginDeparture(){
    this.parent.addClass("prev-" + this.cue());
    this.parent.removeClass(/^current-cue-.*/);
    this.parent.beginDeparture();
  }

  completeDeparture(){
    this.parent.removeClass("prev-" + this.cue());
    this.parent.completeDeparture();
  }

  beginArrival(){
    this.parent.addClass("next-" + this.cue());
    this.parent.beginArrival();
  }

  completeArrival(){
    this.parent.removeClass("next-" + this.cue());
    this.parent.addClass("current-" + this.cue());
    this.parent.completeArrival();
  }
}
