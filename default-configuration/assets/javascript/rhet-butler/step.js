//
//  Able to relate selves to other steps in order to calculate motions
//    - "which step is <motion> from you?"
//    - "where is <step> in relation to you?"
//
//import Slide from './steps/slide.js';

export default class {
  constructor(element, indexes){
    this.element = element;
    this.groups = [];
    this.steps = [];

    this.children = [];
    this.indexes = {};
    this.childrenById = {};

    for(let field in indexes) {
      this.indexes[field] = indexes[field];
    };

    this.element.classList.add("future");

    this.firstSlide = null;
    this.lastSlide = null;

    this.prevSlide = null;
    this.nextSlide = null;

    this.firstItem = null;
    this.lastItem = null;

    this.prevItem = null;
    this.nextItem = null;
  }

  toString() {
    return "A Step " + this.element.id
  }

  treeFinished() {
  }

  addClass(name){
    this.element.classList.add(name);
  }

  removeClass(name){
    if(name instanceof RegExp){
      Array.prototype.forEach.call(this.element.classList, function(klass){
          if(name.test(klass)){
            this.element.classList.remove(klass);
          }
        }, this)
    } else {
      this.element.classList.remove(name);
    }
  }

  hasClass(name){
    return this.element.classList.contains(name);
  }

  beginDeparture(){
    this.addClass("previous");
    this.removeClass("current");
    this.parent.beginDeparture();
  }

  completeDeparture(){
    this.removeClass("previous");

    this.removeClass("present");
    this.removeClass("future");
    this.removeClass("current");
    this.addClass("past");
    this.parent.completeDeparture();
  }

  beginArrival(){
    this.addClass("next");
    this.parent.beginArrival();
  }

  completeArrival(){
    this.removeClass("next");
    this.addClass("current");

    this.removeClass("future");
    this.removeClass("past");
    this.addClass("present");
    this.parent.completeArrival();
  }

  cancelArrival(){
    this.removeClass("next");
  }

  eachStep(dothis){
    dothis(this);
    this.children.forEach(function(step){
        step.eachStep(dothis);
      });
  }

  // Given a structure level, return the kind and direction of transition to another step
  relativeLevelPosition(level, target){
    if(!target){ return ["none", "same", level]; };
    var difference = target.indexes[level] - this.indexes[level];

    if(difference < -1){
      return ["jump", "backwards", "by-" + level];
    } else if(difference == -1){
      return ["advance", "backwards", "by-" + level];
    } else if(difference == 1){
      return ["advance", "forwards", "by-" + level];
    } else if(difference > 1){
      return ["jump", "forwards", "by-" + level];
    }

    return ["none", "same", "by-" + level];
  }

  relativePosition(target){
    var relPos = this.relativeLevelPosition("slide", target);
    if(relPos[0] == "none"){
      relPos = this.relativeLevelPosition("item", target);
    }
    return relPos;
  }

  addChild(newChild){
    this.debugAssoc("Xanc", newChild);
    var lastChild = this.children.slice(-1)[0];
    if(lastChild){
      this.debugAssoc("Xalc", lastChild);
      newChild.addPrevStep(lastChild);
      lastChild.addNextStep(newChild);
    }
    this.children.push(newChild);
    this.addDescendant(newChild);
  }

  addDescendant(newChild){
    this.childrenById[newChild.element.id] = newChild;

    newChild.joinParent(this);

    this.propagateDescendant(newChild);
  }

  joinParent(parent){}

  lastChild(){
    if(this.children.length > 0){
      return this.children.slice(-1)[0];
    } else {
      return this
    }
  }

  debugAssoc(assoc, other){
    //console.log(assoc, this.toString(), other.toString());
  }

  addNextRoot(root){
    this.debugAssoc("Xnr", root)
  }

  addPrevRoot(root){
    this.debugAssoc("Xpr", root)
  }

  addNextGroup(group){
    this.debugAssoc("Xng", group)
  }

  addPrevGroup(group){
    this.debugAssoc("Xpg", group)
  }

  addNextSlide(slide){
    this.debugAssoc("Xns", slide)
  }

  addPrevSlide(slide){
    this.debugAssoc("Xps", slide)
  }

  addNextItem(item){
    this.debugAssoc("Xni", item)
  }

  addPrevItem(item){
    this.debugAssoc("Xpi", item)
  }
}
