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
});

rhetButler.Step = function(element){
  this.element = element;
  this.groups = [];
  this.steps = [];
}

rhetButler.Step = function(){};

rhetButler.Group = function(parent, element, indexes){
  this.setup(parent, element,indexes);
};
rhetButler.Group.prototype = new rhetButler.Step

rhetButler.Slide = function(parent, element, indexes){
  this.setup(parent, element, indexes);
};
rhetButler.Slide.prototype = new rhetButler.Step

rhetButler.Item = function(parent, element, indexes){
  this.setup(parent, element, indexes);
};
rhetButler.Item.prototype = new rhetButler.Step

// DONE
//Steps (Item, Slide, Group, [Root?])
//  References to the elements within the document that are part of the presentation
//  Able to relate selves to other steps in order to calculate motions
//    - "which step is <motion> from you?"
//    - "where is <step> in relation to you?"
//
(function(){
    var step = rhetButler.Step.prototype;

    var group = rhetButler.Group.prototype;
    var slide = rhetButler.Slide.prototype;
    var item = rhetButler.Item.prototype;

    rhetButler.Step.buildTree = function(rootElement, elements){
      var steps = [];
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

          indexes.step++;
          if(element.classList.has("item")){
            indexes.item++;
            if(element.id.length == 0){
              element.id = "item-" + indexes.item
            }
            step = new rhetButler.Item(parent, element, indexes);
          } else if(element.classList.has("slide")){
            indexes.slide++;
            if(element.id.length == 0){
              element.id = "slide-" + indexes.slide
            }
            step = new rhetButler.Slide(parent, element, indexes);
          } else if(element.classList.has("group")){
            indexes.group++;
            if(element.id.length == 0){
              element.id = "group-" + indexes.group
            }
            step = new rhetButler.Group(parent, element, indexes);
          }

          parentStack.unshift(step);

          steps[step.indexes.step] = step;
        });

      return steps;
    };

    step.setup = function(parent, element, indexes){
      this.element = element;
      this.parent = parent;
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

      parent.addChild(this);
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
      var lastChild = this.children.slice(-1)[0];
      newChild.addPrevStep(lastChild);
      lastChild.addNextStep(newChild);
      this.children.push(newChild);
      this.addDescendant(newChild);
    };


    slide.addDescendant = function(newChild){
      this.nextItem = newChild;
      newChild.prevItem = this;
      this.parent.addDescendant(newChild);
    };

    step.lastChild = function(){
      this.children.slice(-1)[0];
    };

    group.addNextStep = function(step){
      step.addPrevGroup(this);
    };

    group.addPrevStep = function(step){
      step.addNextGroup(this);
    };

    slide.addNextStep = function(step){
      step.addPrevSlide(this);
    };
    slide.addPrevStep = function(step){
      step.addNextSlide(this);
    };

    item.addNextStep = function(step){
      step.addPrevItem(this);
    };
    item.addPrevStep = function(step){
      step.addNextItem(this);
    };

    item.addNextItem = function(item){
      this.nextItem = item;
    };
    item.addPrevItem = function(item){
      this.prevItem = item;
    };

    slide.addNextSlide = function(slide){
      this.nextSlide = slide;
      this.children.forEach(function(item){
          item.nextSlide = slide;
        })
      this.lastChild().nextItem = slide;
    };

    slide.addPrevSlide = function(slide){
      this.prevSlide = slide;
      this.children.forEach(function(item){
          item.prevSlide = slide;
        })
      this.prevItem = slide.lastChild();
    };

    group.addNextSlide = function(slide){
      this.nextSlide = slide;
      this.lastSlide.addNextSlide(slide);
    };

    group.addPrevSlide = function(slide){
      this.prevSlide = slide;
      //no firstSlide, yet
    };

    group.addNextGroup = function(group){
      //
    };

    group.addPrevGroup = function(group){
      this.prevSlide = group.lastSlide;
    };

    group.addDescendant = function(newChild){
      if(newChild instanceof rhetButler.Slide){
        this.lastSlide = newChild;
        if (this.firstSlide == null) {
          this.firstSlide = newChild;
          this.firstItem = newChild;
          this.prevSlide.addNextSlide(newChild);
          newChild.addPrevSlide(this.prevSlide);
        }
      }
      if(newChild instanceof rhetButler.Item){
        this.lastItem = newChild;
      }

      if(this.parent != null){
        this.parent.addDescendant(newChild);
      }
    };
})

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

//XXX I think rather than element, this should be step
rhetButler.TransitionStation = function(stationList, step){
  this.stationList = stationList;
  this.step = step;
  this.checkedIn = false;
  this.eventListener = null;
  this.eventListener = this.handleMotionComplete.bind(this);
  this.motionStyles = this.buildMotionStyles();
};

//XXX element/step/station...
(function(){
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
      this.firstStep;
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
      this.firstStep.element.classList.add("previous");
      this.lastStep.element.classList.add("next");
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
      this.lastStep;
    };

    states.arrived.enterState = function(){
      this.stations.forEach(function(station){ station.removeListener() })

      this.presenter.root.classList.remove("moving");
      this.presenter.root.classList.remove(this.startElemId());
      this.presenter.root.classList.remove(this.endElemId());
      this.direction.forEach(function(dirPart){
          this.presenter.root.classList.remove(dirPart);
        })
      this.firstStep.element.classList.remove("previous");
      this.firstStep.element.classList.remove("present");
      this.firstStep.element.classList.add("past");

      this.lastStep.element.classList.remove("next");
      this.lastStep.element.classList.remove("current");
      this.lastStep.element.classList.remove("future");
      this.lastStep.element.classList.remove("present");
      this.presenter.completeTransition();
    };

    states.arrived.resumeStep = function(){
      this.lastStep;
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

      this.direction = this.firstStep.relativePostion(this.lastStep);

      while(step != null){
        checkedIn = checkedIn && (step != currentStep);
        station = new rhetButler.TransitionStation(step);
        uphill.push(station);
        if(checkedIn){
          station.visisted();
        }
        step = step.parent;
      }
      step = lastStep;
      while(step != null){
        downhill.unshift(new rhetButler.TransitionStation(step));
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
      this.step.element.classList.add("am-at");
      afterStyles = this.getMotionStyles();

      if(beforeStyles != afterStyles){ this.checkIn = false; };

      if(!this.elementHasMotion()){ this.visited(); };

      if(this.checkIn){ this.step.element.classList.remove("am-at"); };

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
      this.step.element.classList.remove("to-come");
      this.step.element.classList.add("has-gone");
      this.checkIn = true;
    };

    station.prepare = function(){
      this.step.element.classList.add("to-come");
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
  this.stepsbyId = {};
  this.stepsList = [];
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
      var stepElements = this.arrayify(root.getElementsByClassName("rhet-butler"));
      this.stepsList = rhetButler.Step.buildTree(stepElements)
      this.stepsList.forEach(function(step){ this.stepsById[step.element.id] = step; }, this)

      //initial TransitionStations

      this.bindHandlers();

      utils.triggerEvent(this.root, "rhet:init", { api: this });
    };

    presenter.goto = function(nextStep){
      var previousStep = this.currentTransition.resumeStep();
      var currentStep = this.currentTransition.currentStep;
      this.currentTransition.cancel();
      this.currentTransition = new rhetButler.TransitionStations(previousStep, currentStep, nextStep);
      this.currentTransition.start();
      this.updateBeforeAndAfter(previousStep, nextStep);
    };

    presenter.updateBeforeAndAfter = function(previousStep, nextStep){
      this.markRange(0, previousStep.indexes.step, "before");
      this.markRange(nextStep.indexes.step, undefined, "after");
      previousStep.eachParent(function(step){ step.removeClass("before"); });
      nextStep.eachParent(function(step){ step.removeClass("after"); });
    };

    presenter.markRange = function(start, end, mark){
      this.stepsList.slice(start, end).forEach(function(elem){
          var containers;
          containers = this.containingElements(elem);
          containers.steps.forEach(function(step){ this.thisClassNotThose(step, mark, "before", "after", "passing"); }, this);
          containers.slides.forEach(function(slide){ this.thisClassNotThose(slide, mark, "before", "after", "passing"); }, this);
        }, this);
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
        return this.byId( window.location.hash.replace(/^#\/?/,"") );
    };

    // `getStep` is a helper function that returns a step element defined by
    // parameter.
    // If a number is given, step with index given by the number is returned, if a string
    // is given step element with such id is returned, if DOM element is given it is returned
    // if it is a correct step element.
    presenter.getStep = function ( step ) {
      if (typeof step === "number") {
        step = step < 0 ? this.steps[ steps.length + step] : this.steps[ step ];
      } else if (typeof step === "string") {
        step = byId(step);
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
        element.classLIst.remove(arguments[idx]);
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
    presenter.update = function(previousStep, nextStep){
      var stationList = [];
      var containers;
      var lowStep, highStep = previousStep, nextStep;
      if( previousStep > nextStep ){
        lowStep = nextStep;
        highStep = previousStep;
      }
      this.markRange(0, lowStep, "before");
      this.markRange(lowStep + 1, highStep, "passing");
      this.markRange(highStep + 1, undefined, "after");

      switch(highStep - lowStep) {
        case 0:
          this.thisClassNotThose(this.root, "arrived", "stepping", "jumping");
          break
        case 1:
          this.thisClassNotThose(this.root, "stepping", "arrived", "jumping");
          break
        default:
          this.thisClassNotThose(this.root, "jumping", "stepping", "arrived");
      }

      if(this.previousStep != previousStep){
        this.unmarkEndpoint(this.previousStep, "previous");
        this.markTime(this.previousStep, "past")
        containers = this.markEndpoint(previousStep, "previous");
        stationList.append(containers.slides)
        stationList.append(containers.groups)
      }

      if(this.nextStep != nextStep){
        this.unmarkEndpoint(this.nextStep, "next");
        this.markTime(nextStep, "present")
        containers = this.markEndpoint(nextStep, "next");
        stationList.append(containers.slides)
        stationList.append(containers.groups)
      }

      this.stations = new rhetButler.TransitionStationList(this, stationList)
      this.stations.start();

      this.previousStep = previousStep;
      this.nextStep = nextStep;
    };

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

    presenter.goto = function(index){
      this.update(this.previousStep, index);
    };

    presenter.completeTransition = function(){
      this.update(this.nextStep, this.NextStep);
    };

    presenter.bindHandlers = function(){
      //Our own :init event
      console.log(typeof this);
      console.log(this.root);
      this.root.addEventListener("rhet:init", function(){
          // STEP CLASSES
          this.steps.forEach(function (step) {
              step.classList.add("future");
            });

          this.root.addEventListener("rhet:stepenter", function (event) {
              this.thisClassNotThose(event.target, "present", "past", "future");
            }, false);

          this.root.addEventListener("rhet:stepleave", function (event) {
              this.thisClassNotThose(event.target, "past", "present", "future");
            }, false);
        }, false);

      // Adding hash change support.
      this.root.addEventListener("rhet:init", function(){

          // last hash detected
          var lastHash = "";

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
                goto( getElementFromHash() );
              }
            }, false);

          // START
          // by selecting step defined in url or first step of the presentation
          goto(getElementFromHash() || this.steps[0], 0);
        }, false);
    };
  })();
