//
//  Able to relate selves to other steps in order to calculate motions
//    - "which step is <motion> from you?"
//    - "where is <step> in relation to you?"
//
goog.provide('rhetButler.Step');
goog.require('rhetButler');
rhetButler.Step = function(element){
  this.element = element;
  this.groups = [];
  this.steps = [];
};

;(function(){
    var step = rhetButler.Step.prototype;
    step.toString = function() {
      return "A Step " + this.element.id
    };

    step.setup = function(element, indexes){
      this.element = element;
      this.children = [];
      this.indexes = {};
      this.childrenById = {};

      for(field in indexes) {
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
    };

    step.treeFinished = function() {
    };

    step.addClass = function(name){
      this.element.classList.add(name);
    };

    step.removeClass = function(name){
      if(name instanceof RegExp){
        Array.prototype.forEach.call(this.element.classList, function(klass){
          if(name.test(klass)){
            this.element.classList.remove(klass);
          }
        }, this)
      } else {
        this.element.classList.remove(name);
      }
    };

    step.hasClass = function(name){
      return this.element.classList.contains(name);
    };

    step.beginDeparture = function(){
      this.addClass("previous");
    };

    step.completeDeparture = function(){
      this.removeClass("previous");

      this.removeClass("present");
      this.removeClass("future");
      this.addClass("past");
    };

    step.beginArrival = function(){
      this.addClass("next");
    };

    step.completeArrival = function(){
      this.removeClass("next");
      this.addClass("current");

      this.removeClass("future");
      this.removeClass("past");
      this.addClass("present");
    };

    step.eachStep = function(dothis){
      dothis(this);
      this.children.forEach(function(step){
          step.eachStep(dothis);
        });
    };

    // Given a structure level, return the kind and direction of transition to another step
    step.relativeLevelPosition = function(level, target){
      var difference = target.indexes[level] - this.indexes[level];

      if(difference < -1){
        return ["jump", "backwards", level];
      } else if(difference == -1){
        return ["advance", "backwards", level];
      } else if(difference == 1){
        return ["advance", "forwards", level];
      } else if(difference > 1){
        return ["jump", "forwards", level];
      }

      return ["none", "same", level];
    };

    step.relativePosition = function(target){
      var relPos = this.relativeLevelPosition("slide", target);
      if(relPos[0] == "none"){
        relPos = this.relativeLevelPosition("item", target);
      }
      return relPos;
    };

    step.addChild = function(newChild){
      this.debugAssoc("Xanc", newChild);
      var lastChild = this.children.slice(-1)[0];
      if(lastChild){
        this.debugAssoc("Xalc", lastChild);
        newChild.addPrevStep(lastChild);
        lastChild.addNextStep(newChild);
      }
      this.children.push(newChild);
      this.addDescendant(newChild);
    };

    step.addDescendant = function(newChild){
      this.childrenById[newChild.element.id] = newChild;

      if(newChild instanceof rhetButler.Steps.Slide){
        this.lastSlide = newChild;
        if (this.firstSlide == null) {
          this.firstSlide = newChild;
          this.firstItem = newChild;
          if(this.prevSlide != null){
            this.prevSlide.addNextSlide(newChild);
            newChild.addPrevSlide(this.prevSlide);
          }
        }
      }
      if(newChild instanceof rhetButler.Steps.Item){
        this.lastItem = newChild;
      }

      this.propagateDescendant(newChild);
    };

    step.lastChild = function(){
      if(this.children.length > 0){
        return this.children.slice(-1)[0];
      } else {
        return this
      }
    };

    step.debugAssoc = function(assoc, other){
      //console.log(assoc, this.toString(), other.toString());
    };

    step.addNextRoot = function(root){
      this.debugAssoc("Xnr", root)
    };

    step.addPrevRoot = function(root){
      this.debugAssoc("Xpr", root)
    };

    step.addNextGroup = function(group){
      this.debugAssoc("Xng", group)
    };

    step.addPrevGroup = function(group){
      this.debugAssoc("Xpg", group)
    };

    step.addNextSlide = function(slide){
      this.debugAssoc("Xns", slide)
    };

    step.addPrevSlide = function(slide){
      this.debugAssoc("Xps", slide)
    };

    step.addNextItem = function(item){
      this.debugAssoc("Xni", item)
    };

    step.addPrevItem = function(item){
      this.debugAssoc("Xpi", item)
    };
  })();
