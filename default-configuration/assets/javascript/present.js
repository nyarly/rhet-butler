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
//uphill/downhill in stationList
//actual motion functions (advance-slide, reverse-item
//revisit fragment <-> slide mapping
//motion cancelling (advance before advance completes)
//all event handling in stationList?
//
//step indexing (so that we know if motion is forward or backward)
//  (what about interrupted motions: likely is "down"
//  which suggests: the "original start" of the motion.
//
//fragment <-> slide

rhetButler = {}
rhetButler.Step = function(element){
  this.element = element;
  this.groups = [];
  this.steps = [];
}

rhetButler.Step = function(){};

rhetButler.Group = function(parent, element){
  this.setup(parent, element);
};
rhetButler.Group.prototype = new rhetButler.Step

rhetButler.Slide = function(parent, element){
  this.setup(parent, element);
};
rhetButler.Slide.prototype = new rhetButler.Step

rhetBulter.Item = function(parent, element){
  this.setup(parent, element);
};
rhetButler.Item.prototype = new rhetButler.Step

(function(){
    var step = rhetButler.Step.prototype;

    var group = rhetButler.Group.prototype;
    var slide = rhetButler.Slide.prototype;
    var item = rhetButler.Item.prototype;

    rhetButler.Step.build = function(parent, element){
      if(element.classList.has("item")){
        return new rhetButler.Item(parent, element)
      } else if(element.classList.has("slide")){
        return new rhetButler.Slide(parent, element)
      } else if(element.classList.has("group")){
        return new rhetButler.Group(parent, element)
      }
    };


    step.setup = function(parent, element){
      this.element = element;
      this.parent = parent;
      this.children = [];

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

rhetButler.TransitionStations = function(presenter, elements){
  this.presenter = presenter;
  this.stations = [];
  this.winder = 0;
  this.init(elements);
};

//XXX I think rather than element, this should be step
rhetButler.TransitionStation = function(stationList, element){
  this.stationList = stationList;
  this.element = element;
  this.checkedIn = false;
  this.eventListener = null;
  this.init();
};

(function(){
    var stationList = rhetButler.TransitionStations.prototype;
    var station = rhetButler.TransitionStation.prototype;

    stationList.init = function(elements){
      this.stations = elements.map(function(element){
          return new rhetButler.TransitionStation(this, element);
        })
    };

    station.init = function(){
      this.eventListener = this.handleMotionComplete.bind(this);
      this.motionStyles = this.buildMotionStyles();
    };

    station.buildMotionStyles = function(){
      return ["transition-duration", "animation-name", "animation-iteration-count", "animation-play-state"]
    };

    station.handleMotionComplete = function(event){
      event.stopPropagation();

      this.arrive();

      return true;
    };

    station.arrive = function(){
      this.checkIn = true;
      this.stationList.elementArrived(this)
    };

    stationList.elementArrived = function(station){
      if(this.stations.every(function(station){ return station.winding(); })){
        this.finish()
      }
    };

    station.getMotionStyles(){
      var style = window.getComputedStyle(this.element);
      var result = {}
      this.motionStyles.map(function(style){
          result[style] = style.getPropertyValue(this.pfx(style));
        });
      return result;
    }

    station.elementHasMotion = function(){
      var style = this.getMotionStyles();
      var durations = style["transition-duration"].split(/\s*,\s*/); //there's a non-zero one
      if(durations.every(function(duration){ return (duration == "0s") })){ return true; }
      if(style["animation-name"] == null){ return false };
      //XXX Each of these needs to consider a list of values...
      if(style["animation-play-state"] == "paused"){ return false}; //not paused
      if(style["animation-iteration-count"] == "infinite"){ return false }; //not infinite
      return true
    };

    station.winding = function(){
      var beforeStyles, afterStyles;

      beforeStyles = this.getMotionStyles();
      this.element.classList.add("am-at");
      afterStyles = this.getMotionStyles();

      if(beforeStyles != afterStyles){ this.checkIn = false; };

      if(!this.elementHasMotion()){ this.checkIn = true; };

      if(this.checkIn){ this.element.classList.remove("am-at"); };

      return this.checkIn
    };

    station.motionCompleteEvents = function(){
      //XXX There's the case where an animation loops but we should arrive on
      //some specific iteration... maybe not?
      var events = ["transitionend", "animationend"];
      var prefixes = ["webkit"];
      prefixes.forEach(function(prefix){
          events.append(events.map(function(event){
                return prefix + event;
              }))
        })
      return events;
    };

    station.attachListener = function(){
      this.motionCompleteEvents().forEach(function(eventName){
          this.element.addEventListener(eventName, this.eventListener, true);
        })
    };

    stationList.removeListener = function(){
      this.motionCompleteEvents().forEach(function(eventName){
          this.element.removeEventListener(eventName, this.eventListener, true);
        })
    };

    stationList.start = function(){
      this.elements[this.winder].classList.add("am-at")
      this.stations.forEach(function(station){ station.attachListener() })
    };

    stationList.finish = function(){
      this.stations.forEach(function(station){ station.removeListener() })
      this.presenter.completeTransition();
    };
})()

rhetButler.Presenter = function(document, window){
  this.document = document;
  this.body = document.body;
  this.window = window;
  this.stepsData = {};
  this.steps = [];

  this.previousSlideIndex = 0;
  this.nextStepIndex = 0;

  this.previousStepIndex = 0;
  this.nextStepIndex = 0;

  this.bindHandlers();
};

(function(){
    var presenter = rhetButler.Presenter.prototype;
    // `arraify` takes an array-like object and turns it into real Array
    // to make all the Array.prototype goodness available.
    presenter.arrayify = function ( a ) {
        return [].slice.call( a );
    };

    // `$$` return an array of elements for given CSS `selector` in the `context` of
    // the given element or whole document.
    presenter.$$ = function ( selector, context ) {
      context = context || document;
      return this.arrayify( context.querySelectorAll(selector) );
    };

    // `byId` returns element with given `id` - you probably have guessed that ;)
    presenter.byId = function ( id ) {
      return document.getElementById(id);
    };

    // `getElementFromHash` returns an element located by id from hash part of
    // window location.
    presenter.getElementFromHash = function () {
        // get id from url # by removing `#` or `#/` from the beginning,
        // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
        return this.byId( window.location.hash.replace(/^#\/?/,"") );
    };

    // `triggerEvent` builds a custom DOM event with given `eventName` and `detail` data
    // and triggers it on element given as `el`.
    presenter.triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };

    presenter.checkSupport = function (){
      var ua = navigator.userAgent.toLowerCase();
      var impressSupported = ( pfx("perspective") !== null ) && ( body.classList ) && ( body.dataset )
      //also should check getComputedStyle

      if (!impressSupported) {
        // we can't be sure that `classList` is supported
        this.body.className += " impress-not-supported ";
        return false
      } else {
        this.body.classList.remove("impress-not-supported");
        this.body.classList.add("impress-supported");
        return true
      }
    };

    presenter.setup = function(rootId) {
      var parentStack = [];
      this.root = this.byId(rootId);
      this.body.classList.remove("impress-disabled");
      this.body.classList.add("impress-enabled");

      // get and init steps
      this.steps = this.arrayify(root.getElementsByClassName("rhet-butler"));

      this.steps.forEach( function(element){
          var rhetParent = element.parentNode;
          while (rhetParent) {
            if(rhetParent.classList.contains("rhet-butler")){
              break;
            } else {
              rhetParent = rhetParent.parentNode;
            }
          }

          this.stepsData[el.id] = rhetButler.Step.build(rhetParent, element);
        }, this );

      triggerEvent(this.root, "impress:init", { api: this });
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
    presenter.thisClassNotThose(element, setClass) { //...exclusiveClasses
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
    //Relation between current/next/etc step and slide and group
    presenter.update = function(previousStep, nextStep){
      var stationList = [];
      var containers;
      var lowStep, highStep = previousStep, nextStep;
      if previousStep > nextStep {
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

      //XXX Need to remove common items...
      //at least duplicates: common ancestors will be marked both before and
      //after and can not-animate as a result
      this.stations = new rhetButler.TransitionStationList(this, stationList)
      this.stations.start();

      this.previousStep = previousStep;
      this.nextStep = nextStep;
    };

    presenter.markRange = function(start, end, mark){
      this.steps.slice(start, end).forEach(function(elem){
          var containers;
          containers = this.containingElements(elem);
          containers.steps.forEach(function(step){ this.thisClassNotThose(step, mark, "before", "after", "passing"); }, this);
          containers.slides.forEach(function(slide){ this.thisClassNotThose(slide, mark, "before", "after", "passing"); }, this);
        }, this);
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

    presenter.containingElements = function(elem) {
      var elems = {all: [], steps: [], slides: [], groups: []}
      var presenterClasses = ["step", "slide", "group"]
      var idx
      while(elem){
        presenterClasses.some(function(class){
            if(elem.classList.contains(class)){
              elems[class + "s"].append(elem)
              elems.all.append(elem)
              return true
            }})
        elem = elem.parent
      }
      return elems
    };

    presenter.goto(index){
      this.update(this.previousStep, index);
    };

    presenter.completeTransition = function(){
      this.update(this.nextStep, this.NextStep);
    };

    presenter.bindHandlers = function(){
      //Our own :init event
      this.root.addEventListener("impress:init", function(){
          // STEP CLASSES
          this.steps.forEach(function (step) {
              step.classList.add("future");
            });

          this.root.addEventListener("impress:stepenter", function (event) {
              this.thisClassNotThose(event.target, "present", "past", "future");
            }, false);

          this.root.addEventListener("impress:stepleave", function (event) {
              this.thisClassNotThose(event.target, "past", "present", "future");
            }, false);
        }, false);

      // Adding hash change support.
      this.root.addEventListener("impress:init", function(){

          // last hash detected
          var lastHash = "";

          // `#/step-id` is used instead of `#step-id` to prevent default browser
          // scrolling to element in hash.
          //
          // And it has to be set after animation finishes, because in Chrome it
          // makes transtion laggy.
          // BUG: http://code.google.com/p/chromium/issues/detail?id=62820
          this.root.addEventListener("impress:stepenter", function (event) {
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

      //
      //Review these for browser compat...
      //animationstart
      //animationend
      //animationiteration
      //transitionend
    };

  })(rhetButler.Presenter.prototype)

new rhetButler.Presenter(document, window)
