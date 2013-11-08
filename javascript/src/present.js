  /*
 * RhetButler presentation Javascript
 *
 * Copyright 2013 Judson Lester (@judsonlester)
 *
 * Heavily influenced by impress.js by
 *   Bartek Szopka (@bartaz)
 *
 * (and therefore)
 * Released under the MIT and GPL Licenses.
 */

//TODO
//actual motion functions (advance-slide, reverse-item
//motion cancelling (advance before advance completes)
//all event handling in stationList?
//
//revisit fragment <-> slide mapping
//fragment <-> slide
//
//Overall architecture:
//
//Steps (Item, Slide, Group, [Root?])
//  References to the elements within the document that are part of the presentation
//  Able to relate selves to other steps in order to calculate motions
//    - "which step is <motion> from you?"
//    - "where is <step> in relation to you?"
//
//StationList -> *[Station]
//  Runs through the JS mechanics of transitioning between steps - marks all slides
//  in the stream as prior and post, marks the current step, handles event listeners
//  issue most custom events.
//
//  FSM: preparing -> started-uphill -> downhill -> completed
//
//Presenter
//  The overall interface to the application
//  Maintains some state, receives method calls to e.g. move between slides
//  Builds the step-tree
//  Builds StationLists
//

rhetButler = { };

(function(){
    var utils = rhetButler;
    var prefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'];

    // `arraify` takes an array-like object and turns it into real Array
    // to make all the Array.prototype goodness available.
    utils.arrayify = function ( a ) {
        return [].slice.call( a );
    };

    // `$$` return an array of elements for given CSS `selector` in the `context` of
    // the given element or whole document.
    utils.$$ = function ( selector, context ) {
      context = context || document;
      return this.arrayify( context.querySelectorAll(selector) );
    };

    // `byId` returns element with given `id` - you probably have guessed that ;)
    utils.byId = function ( id ) {
      return document.getElementById(id);
    };

    // `triggerEvent` builds a custom DOM event with given `eventName` and `detail` data
    // and triggers it on element given as `el`.
    utils.triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };

    utils.bindFunction = (function() {
        if(!Function.prototype.bind){
          return function(fToBind, thisArg) {
            if (typeof fToBind !== "function") {
              // closest thing possible to the ECMAScript 5 internal IsCallable function
              throw new TypeError("bindFunction - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 2),
            fNOP = function () {},
            fBound = function () {
              return fToBind.apply(thisArg, aArgs.concat(Array.prototype.slice.call(arguments)));
              /*
               * Probably more correct, but fails if `this` has undefined prototype
               * which sometimes happens with DOM nodes...
              return fToBind.apply(this instanceof fNOP && thisArg
                ? this
                : thisArg,
                aArgs.concat(Array.prototype.slice.call(arguments)));
                */
            };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
          };
        } else {
          return function(fun, thisArg) {
            return fun.bind(thisArg);
          };
        }
      })();

    // `pfx` is a function that takes a standard CSS property name as a parameter
    // and returns it's prefixed version valid for current browser it runs in.
    // The code is heavily inspired by Modernizr http://www.modernizr.com/
    utils.pfx = (function () {
        var style = document.createElement('dummy').style,
            memory = {};

        return function ( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {

                var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
                  props   = [ucProp] + prefixes.map(function(prefix){ return prefix + ucProp;});

                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[i] ] !== undefined ) {
                        memory[ prop ] = props[i];
                        break;
                    }
                }

            }

            return memory[ prop ];
        };
    })();
})();

rhetButler.Step = function(element){
  this.element = element;
  this.groups = [];
  this.steps = [];
};

;(function(){
    var step = rhetButler.Step.prototype;
    rhetButler.Step.buildTree = function(rootElement, elements){
      var rootStep;
      var parentStack = [];
      var indexes = {
        step: 0,
        group: 0,
        slide: 0,
        item: 0,
      };

      function getParent(element){
        var checkElement, parent, parentElement;
        while(parentStack.length > 0) {
          parent = parentStack[0];
          parentElement = parent.element;
          checkElement = element;
          while(checkElement != parentElement && checkElement != rootElement){
            checkElement = checkElement.parentElement;
          }

          if(checkElement == parentElement){
            return parent;
          }

          parentStack.shift();
        }

        return null;
      }

      elements.forEach( function(element, index){
          var step;

          var parent = getParent(element);

          if(element.classList.contains("root")){
            if(element.id.length == 0){
              element.id = "rhet-root"
            }
            step = new rhetButler.Root(element, indexes);
            rootStep = step;
          } else if(element.classList.contains("group")){
            indexes.group++;
            if(element.id.length == 0){
              element.id = "group-" + indexes.group
            }
            step = new rhetButler.Group(parent, element, indexes);
          } else if(element.classList.contains("slide")){
            indexes.slide++;
            if(element.id.length == 0){
              element.id = "slide-" + indexes.slide
            }
            step = new rhetButler.Slide(parent, element, indexes);
          } else if(element.classList.contains("item")){
            indexes.item++;
            if(element.id.length == 0){
              element.id = "item-" + indexes.item
            }
            step = new rhetButler.Item(parent, element, indexes);
          } else {
            return //root or malformed
          }
          indexes.step++;

          parentStack.unshift(step);
        });

      return rootStep;
    };

    step.toString = function() {
      return "A Step " + this.element.id
    };

    step.setup = function(element, indexes){
      this.element = element;
      this.children = [];
      this.indexes = {};

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

    step.addClass = function(name){
      this.element.classList.add(name);
    };

    step.removeClass = function(name){
      this.element.classList.remove(name);
    };

    step.hasClass = function(name){
      return this.element.classList.contains(name);
    };

    step.eachStep = function(dothis){
      dothis(this);
      this.children.forEach(function(step){
          step.eachStep(dothis);
        });
    };

    // Given a structure level, return the kind and direction of transition to another step
    step.relativeLevelPosition = function(level, target){
      var difference = this.indexes[level] - target.indexes[level];

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
      this.debugAssoc("Xac", newChild);
      //console.log("addchild", this.toString(), newChild.toString());
      var lastChild = this.children.slice(-1)[0];
      if(lastChild){
        newChild.addPrevStep(lastChild);
        lastChild.addNextStep(newChild);
      }
      this.children.push(newChild);
      this.addDescendant(newChild);
    };

    step.addDescendant = function(newChild){
      if(newChild instanceof rhetButler.Slide){
        this.lastSlide = newChild;
        console.log("sad f?", this.toString(), (this.firstSlide == null ? null : this.firstSlide.toString()))
        if (this.firstSlide == null) {
          this.firstSlide = newChild;
          this.firstItem = newChild;
          console.log("sad n?", (this.prevSlide != null))
          if(this.prevSlide != null){
            this.prevSlide.addNextSlide(newChild);
            newChild.addPrevSlide(this.prevSlide);
          }
        }
      }
      if(newChild instanceof rhetButler.Item){
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
      console.log(assoc, this.toString(), other.toString());
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

rhetButler.Root = function(element, indexes){
  this.setup(element, indexes);
};
rhetButler.Root.prototype = new rhetButler.Step;

;(function(){
    var root = rhetButler.Root.prototype;

    root.propagateDescendant = function(newChild){
    };

    root.addNextStep = function(step){
      step.addPrevRoot(this);
    };

    root.addPrevStep = function(step){
      step.addNextRoot(this);
    };
  })();

rhetButler.ChildStep = function(){
};
rhetButler.ChildStep.prototype = new rhetButler.Step;

;(function(){
    var childStep = rhetButler.ChildStep.prototype;
    var supertype = rhetButler.Step.prototype;

    childStep.setup = function(parent, element, indexes){
      this.parent = parent;
      supertype.setup.call(this, element, indexes);
      this.parent.addChild(this);
    };

    childStep.propagateDescendant = function(newChild){
      this.parent.addDescendant(newChild);
    };
})();

rhetButler.Group = function(parent, element, indexes){
  this.setup(parent, element, indexes);
};
rhetButler.Group.prototype = new rhetButler.ChildStep;

;(function(){
    var group = rhetButler.Group.prototype;
    group.addNextStep = function(step){
      step.addPrevGroup(this);
    };

    group.addPrevStep = function(step){
      step.addNextGroup(this);
    };

    group.addNextSlide = function(slide){
      this.debugAssoc("gns", slide)

      this.nextSlide = slide;
      if(this.lastSlide){
        this.lastSlide.addNextSlide(slide);
      }
    };

    group.addPrevSlide = function(slide){
      this.debugAssoc("gps", slide)
      if(!this.lastSlide){
        this.lastSlide = slide;
      }
      if(!this.lastItem){
        this.lastItem = slide.lastChild();
      }
      this.prevSlide = slide;
      this.prevItem = slide.lastChild();
    };

    group.addNextGroup = function(group){
      this.debugAssoc("gng", group)
      //
    };

    group.addPrevGroup = function(group){
      this.debugAssoc("gpg", group)

      this.prevSlide = group.lastSlide;

      this.lastSlide = group.lastSlide;
      this.lastItem = group.lastItem;
    };
  })();


rhetButler.Slide = function(parent, element, indexes){
  this.setup(parent, element, indexes);
};
rhetButler.Slide.prototype = new rhetButler.ChildStep;
;(function(){
    var slide = rhetButler.Slide.prototype;
    var step = rhetButler.Step.prototype;

    slide.addChild = function(newChild){
      if(this.children.length == 0){
        newChild.prevItem = this
        this.nextItem = newChild
      }
      step.addChild.call(this, newChild)
    };

    slide.addNextStep = function(step){
      step.addPrevSlide(this);
    };

    slide.addPrevStep = function(step){
      step.addNextSlide(this);
    };

    slide.addPrevGroup = function(group){
      this.debugAssoc("spg", group)
      console.log("spg l?", group.lastSlide ? group.lastSlide.toString(): group.lastSlide);
      if(group.lastSlide){
        this.addPrevSlide(group.lastSlide)
      }
    };

    slide.addNextSlide = function(slide){
      this.debugAssoc("sns", slide)

      this.nextSlide = slide;
      this.children.forEach(function(item){ item.nextSlide = slide; })
      this.lastChild().nextItem = slide;
    };

    slide.addPrevSlide = function(slide){
      this.debugAssoc("sps", slide)
      this.prevSlide = slide;
      this.children.forEach(function(item){
          item.prevSlide = slide;
        })
      this.prevItem = slide.lastChild();
    };
  })();

rhetButler.Item = function(parent, element, indexes){
  this.setup(parent, element, indexes);
};
rhetButler.Item.prototype = new rhetButler.ChildStep;

;(function(){
    var item = rhetButler.Item.prototype;

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
  })();
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
rhetButler.TransitionStations = function(presenter, firstStep, currentStep, lastStep){
  this.presenter = presenter;
  this.uphill = [];
  this.downhill = [];
  this.firstStep = firstStep;
  this.currentStep = currentStep;
  this.lastStep = lastStep;
  this.buildList();
  this.changeState("preparing")
};

rhetButler.TransitionStation = function(stationList, step){
  this.stationList = stationList;
  this.step = step;
  this.checkedIn = false;
  this.eventListener = null;
  this.eventListener = rhetButler.bindFunction(this.handleMotionComplete, this);
};

//XXX element/step/station...
;(function(){
    var motionStyles = [
      "transition-duration",
      "animation-name",
      "animation-iteration-count",
      "animation-play-state"
    ];

    var motionCompleteEvents = (function(){
        var events = ["transitionend", "animationend"];
        var prefixes = ["webkit", "o"];
        prefixes.forEach(function(prefix){
            events = events.concat(events.map(function(event){ return prefix + event; }))
          })
        return events;
      })();

    var utils = rhetButler;
    var stationList = rhetButler.TransitionStations.prototype;
    var station = rhetButler.TransitionStation.prototype;
    var states = {
      preparing: {},
      uphill: {},
      downhill: {},
      arrived: {}
    }

    var baseState = { };

    baseState.enter = function(){
    };

    baseState.start = function(){
      //raise exception?
    };

    baseState.cancel = function(args){

    };

    baseState.forceFinish = function(){

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

    for(name in states){
      for(func in baseState){
        states[name][func] = baseState[func];
      }
    }

    states.preparing.start = function(){
      this.changeState("uphill");
      this.eachStation(function(station){ station.prepare(); })
      this.elementArrived(currentStep);
      //Events + class changes
    };

    states.preparing.forceFinish = function(){
      this.eachStation(function(station){ station.visited() });
      this.changeState("arrived");
    }

    states.uphill.enterState = function(){
      this.presenter.root.classList.add("moving");
      this.presenter.root.classList.add(this.startElemId());
      this.presenter.root.classList.add(this.endElemId());
      this.direction.forEach(function(dirPart){
          this.presenter.root.classList.add(dirPart);
        })
      this.firstStep.addClass("previous");
      this.lastStep.addClass("next");
    };

    states.uphill.finish = function(){
      this.changeState("downhill");
    };

    states.uphill.currentLeg = function(){
      return this.uphill;
    };

    states.downhill.currentLeg = function(){
      return this.downhill;
    };

    states.downhill.finish = function(){
      this.changeState("arrived");
    };

    states.downhill.resumeStep = function(){
      return this.lastStep;
    };

    states.arrived.enterState = function(){
      this.eachStation(function(station){ station.removeListener() })

      this.presenter.root.classList.remove("moving");
      this.presenter.root.classList.remove(this.startElemId());
      this.presenter.root.classList.remove(this.endElemId());
      this.direction.forEach(function(dirPart){
          this.presenter.rootStep.removeClass(dirPart);
        }, this)
      this.firstStep.removeClass("previous");
      this.firstStep.removeClass("present");
      this.firstStep.addClass("past");

      this.lastStep.removeClass("next");
      this.lastStep.removeClass("current");
      this.lastStep.removeClass("future");
      this.lastStep.removeClass("present");
      this.presenter.completeTransition();
    };

    states.arrived.resumeStep = function(){
      return this.lastStep;
    };

    stationList.changeState = function(name){
      var newState = states[name];
      for(func in newState){
        this[func] = newState[func];
      }
      for(stateName in states){
        this.presenter.root.classList.remove(stateName);
      }
      this.presenter.root.classList.add(name);
      this.enterState();
    }

    stationList.buildList = function(){
      var step = this.firstStep;
      var checkedIn = true;
      var station;

      this.direction = this.firstStep.relativePosition(this.lastStep);

      while(step != null){
        checkedIn = checkedIn && (step != this.currentStep);
        station = new rhetButler.TransitionStation(this, step);
        this.uphill.push(station);
        if(checkedIn){
          station.visisted();
        }
        step = step.parent;
      }
      step = this.lastStep;
      while(step != null){
        this.downhill.unshift(new rhetButler.TransitionStation(this, step));
        step = step.parent;
      }
    };

    stationList.startElemId = function(){
      "prev_" + this.firstStep.element.id;
    };

    stationList.endElemId = function(){
      "next_" + this.lastStep.element.id;
    };


    stationList.eachStation = function(func){
      this.uphill.forEach(func, this);
      this.downhill.forEach(func, this);
    };



    stationList.elementArrived = function(station){
      if(this.currentLeg().every(function(station){ return station.visit(); })){
        this.finish()
      }
    };

    station.visit = function(){
      var beforeStyles, afterStyles;

      if(this.checkIn){ return true; }

      beforeStyles = this.getMotionStyles();
      this.step.addClass("am-at");
      afterStyles = this.getMotionStyles();

      if(beforeStyles != afterStyles){ this.checkIn = false; };

      if(!this.elementHasMotion()){ this.visited(); };

      if(this.checkIn){ this.step.removeClass("am-at"); };

      this.stationList.currentStep = this.step;

      return this.checkIn;
    };

    station.handleMotionComplete = function(event){
      event.stopPropagation();

      this.visited();
      this.stationList.elementArrived(this);

      return true;
    };

    station.visited = function(){
      this.step.removeClass("to-come");
      this.step.addClass("has-gone");
      this.checkIn = true;
    };

    station.prepare = function(){
      this.step.addClass("to-come");
      this.attachListener();
    };


    station.getMotionStyles = function(){
      var style = window.getComputedStyle(this.step.element);
      var result = {}
      motionStyles.map(function(style){
          result[style] = style.getPropertyValue(utils.pfx(style));
        });
      return result;
    }

    station.elementHasMotion = function(){
      var style = this.getMotionStyles();
      var durations = style["transition-duration"].split(/\s*,\s*/); //there's a non-zero one
      var states, counts;
      if(durations.every(function(duration){ return (duration == "0s") })){ return true; }
      if(style["animation-name"] == null){ return false };
      //XXX Each of these needs to consider a list of values...
      states = style["animation-play-state"].split(/\s*,\s*/);
      counts = style["animation-iteration-count"].split(/\s*,\s*/);

      if(states.length < counts.length){
        states = states.append(states);
      } else {
        counts = counts.append(counts);
      }

      return (states.some(function(state, index){
            return (state != "paused" && counts[index] != "infinite")
          }));
    };

    station.attachListener = function(){
      motionCompleteEvents.forEach(function(eventName){
          this.step.element.addEventListener(eventName, this.eventListener, true);
        }, this)
    };

    station.removeListener = function(){
      motionCompleteEvents.forEach(function(eventName){
          this.step.element.removeEventListener(eventName, this.eventListener, true);
        }, this)
    };
  })();

rhetButler.Presenter = function(document, window){
  this.document = document;
  this.body = document.body;
  this.window = window;
  this.stepsById = {};
  this.rootStep = null;
  this.currentTransition = null;

  this.previousSlideIndex = 0;
  this.nextStepIndex = 0;

  this.previousStepIndex = 0;
  this.nextStepIndex = 0;
};

(function(){
    var presenter = rhetButler.Presenter.prototype;
    var utils = rhetButler;

    presenter.setup = function(rootId) {
      this.root = utils.byId(rootId);
      this.body.classList.remove("rhet-disabled");
      this.body.classList.add("rhet-enabled");

      // get and init steps
      var stepElements = utils.arrayify(this.root.getElementsByClassName("rhet-butler"));
      this.rootStep = rhetButler.Step.buildTree(this.root, stepElements);
      this.rootStep.eachStep(function (step) {
          step.addClass("future");
        });

      var prev = this.rootStep.firstItem;

      this.currentTransition = new rhetButler.TransitionStations(this, prev, prev, prev);
      this.currentTransition.forceFinish();

      this.bindHandlers();

      utils.triggerEvent(this.root, "rhet:init", { api: this });
    };

    //    presenter.updateBeforeAndAfter = function(previousStep, nextStep){
    //      this.markRange(0, previousStep.indexes.step, "before");
    //      this.markRange(nextStep.indexes.step, undefined, "after");
    //      previousStep.eachParent(function(step){ step.removeClass("before"); });
    //      nextStep.eachParent(function(step){ step.removeClass("after"); });
    //    };

    presenter.markRange = function(start, end, mark){
      this.stepsList.slice(start, end).forEach(function(elem){
          var containers;
          containers = this.containingElements(elem);
          containers.steps.forEach(function(step){ this.thisClassNotThose(step, mark, "before", "after", "passing"); }, this);
          containers.slides.forEach(function(slide){ this.thisClassNotThose(slide, mark, "before", "after", "passing"); }, this);
        }, this);
    };

    presenter.bindHandlers = function(){
      //Our own :init event
      var initListener = function(){
        // last hash detected
        var lastHash = "";

        // STEP CLASSES
//        this.root.addEventListener("rhet:stepenter", function (event) {
//            this.thisClassNotThose(event.target, "present", "past", "future");
//          }, false);
//
//        this.root.addEventListener("rhet:stepleave", function (event) {
//            this.thisClassNotThose(event.target, "past", "present", "future");
//          }, false);

        // `#/step-id` is used instead of `#step-id` to prevent default browser
        // scrolling to element in hash.
        //
        // And it has to be set after animation finishes, because in Chrome it
        // makes transtion laggy.
        // BUG: http://code.google.com/p/chromium/issues/detail?id=62820
        this.root.addEventListener("rhet:stepenter", function (event) {
            window.location.hash = lastHash = "#/" + event.target.id;
          }, false);

        window.addEventListener("hashchange", function () {
            if (window.location.hash !== lastHash) {
              this.goto( this.getElementFromHash() );
            }
          }, false);

        // START
        // by selecting step defined in url or first step of the presentation

        this.teleport(this.getElementFromHash() || this.rootStep.firstItem);
      };

      this.root.addEventListener("rhet:init", utils.bindFunction(initListener, this), false);
    };

    presenter.resolveStep = function(reference){
      if(reference instanceof rhetButler.Step){
        return reference;
      }
    };

    presenter.buildTransition = function(reference){
      var previousStep = this.currentTransition.resumeStep();
      var currentStep = this.currentTransition.currentStep;
      var nextStep = this.resolveStep(reference);

      this.currentTransition.cancel();
      this.currentTransition = new rhetButler.TransitionStations(this, previousStep, currentStep, nextStep);
      //this.updateBeforeAndAfter(previousStep, nextStep);
    };

    presenter.teleport = function(reference){
      this.buildTransition(reference);
      this.currentTransition.forceFinish();
    };

    presenter.goto = function(reference){
      this.buildTransition(reference);
      this.currentTransition.start();
    };

    presenter.completeTransition = function(){
    };

    ///// METHODS BELOW HERE STILL IN NEED OF REFACTORING

    presenter.checkSupport = function (){
      var ua = navigator.userAgent.toLowerCase();
      var impressSupported = ( pfx("perspective") !== null ) && ( body.classList ) && ( body.dataset )
      //also should check getComputedStyle

      if (!impressSupported) {
        // we can't be sure that `classList` is supported
        this.body.className += " rhet-not-supported ";
        return false
      } else {
        this.body.classList.remove("rhet-not-supported");
        this.body.classList.add("rhet-supported");
        return true
      }
    };

    // `getElementFromHash` returns an element located by id from hash part of
    // window location.
    presenter.getElementFromHash = function () {
      // get id from url # by removing `#` or `#/` from the beginning,
      // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
      return utils.byId( window.location.hash.replace(/^#\/?/,"") );
    };

    // `getStep` is a helper function that returns a step element defined by
    // parameter.
    // If a number is given, step with index given by the number is returned, if a string
    // is given step element with such id is returned, if DOM element is given it is returned
    // if it is a correct step element.
    presenter.getStep = function ( step ) {
      if (typeof step === "number") {
        step = step < 0 ? this.stepsList[ stepsList.length + step] : this.stepsList[ step ];
      } else if (typeof step === "string") {
        step = utils.byId(step);
      }
      return (step && step.id && this.stepsData[step.id]) ? step : null;
    };

    // `prev` API function goes to previous step (in document order)
    presenter.prev = function () {
      var prev = this.steps.indexOf( this.activeStep ) - 1;
      prev = prev >= 0 ? this.steps[ prev ] : this.getStep(-1);

      return this.goto(prev);
    };

    // `next` API function goes to next step (in document order)
    presenter.next = function () {
      var next = steps.indexOf( activeStep ) + 1;
      next = next < steps.length ? steps[ next ] : steps[ 0 ];

      return this.goto(next);
    };

    //thisClassNotThose(someEl, "setMe", "unsetMe", "unsetMeToo")
    //e.g.
    //thisClassNotThose(event.target, "present", "past", "future")
    presenter.thisClassNotThose = function(element, setClass) { //...exclusiveClasses
      var idx, length = arguments.length;
      for(idx=2; idx < arguments.length; idx++){
        element.classList.remove(arguments[idx]);
      }
      element.classList.add(setClass);
    };

    //General classes:
    //past: we have visited this
    //present: we're currently here
    //future: we have never visited
    //
    //previous: we're "leaving" this one
    //next: we're "going to" this one
    //before: the current index > this one
    //after: the current index < this one
    //passing: index between next and previous index
    //
    //XXX Move to stationList
    //Relation between current/next/etc step and slide and group
    presenter.unmarkEndpoint = function(stepIndex, mark){
      var containers = this.containingElements(this.steps[stepIndex]);
      var slide = containers.slides[0];

      containers.all.forEach(function(elem){ elem.classList.remove(mark); })

      this.root.classList.remove(mark + "-" + slide.id)
    };

    presenter.markTime = function(stepIndex, mark){
      var containers = this.containingElements(this.steps[stepIndex]);
      var slide = containers.slides[0];

      containers.all.forEach(function(elem){
          this.thisClassNotThose(elem, mark, "past", "present", "future");
        }, this)
    };

    presenter.markEndpoint = function(stepIndex, mark){
      var containers = this.containingElements(this.steps[stepIndex]);
      var slide = containers.slides[0];

      containers.all.forEach(function(elem){
          this.thisClassNotThose(elem, mark, "before", "after", "passing");
        }, this)

      this.root.classList.add(mark + "-" + slide.id);
      return containers
    };

  })();
