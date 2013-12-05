goog.provide('rhetButler.Presenter');
goog.require('rhetButler');
goog.require('rhetButler.Step');
goog.require('rhetButler.TransitionStations');
goog.require('rhetButler.TreeBuilder');
//Presenter
//  The overall interface to the application
//  Maintains some state, receives method calls to e.g. move between slides
//  Builds the step-tree
//  Builds StationLists
//

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
      var treeBuilder = new rhetButler.TreeBuilder(this.root, "rhet-butler");
      this.rootStep = treeBuilder.buildTree();
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

        window.addEventListener("hashchange", rhetButler.bindFunction(function () {
            if (window.location.hash !== lastHash) {
              this.goto( this.getElementFromHash() );
            }
          }, this), false);

        // START
        // by selecting step defined in url or first step of the presentation

        this.teleport(this.getElementFromHash() || this.rootStep.firstItem);
      };

      this.root.addEventListener("rhet:init", utils.bindFunction(initListener, this), false);
    };

    presenter.resolveStep = function(reference, thing){
      // find by id
      // find by relavtive pos (next,prev)*(slide,item)
      if(reference instanceof rhetButler.Step){
        return reference;
      } else {
        switch(reference){
        case 'next':
          switch(thing){
          case 'slide':
            return this.currentTransition.lastStep.nextSlide;
            break;
          case 'item':
            return this.currentTransition.lastStep.nextItem;
            break
          default:
            throw "Bad step reference: '" + reference +","+ thing +"'";
          }
          break;
        case 'prev':
        case 'previous':
          switch(thing){
          case 'slide':
            return this.currentTransition.lastStep.prevSlide;
            break;
          case 'item':
            return this.currentTransition.lastStep.prevItem;
            break
          default:
            throw "Bad step reference: '" + reference +","+ thing +"'";
          }

          break;
        default:
          if(reference in this.rootStep.childrenById){
            return this.rootStep.childrenById[reference];
          }else{
            throw "Bad slide direction: '" + reference +"'";
          }
        }
      }
    };

    presenter.currentStep = function(){
      return this.currentTransition.currentStep;
    };

    presenter.buildTransition = function(reference, thing){
      var previousStep = this.currentTransition.resumeStep();
      var currentStep = this.currentTransition.currentStep;
      var nextStep = this.resolveStep(reference, thing);

      this.currentTransition.cancel();
      this.currentTransition = new rhetButler.TransitionStations(this, previousStep, currentStep, nextStep);
    };

    presenter.teleport = function(reference){
      this.buildTransition(reference);
      this.currentTransition.forceFinish();
    };

    presenter.goto = function(reference, thing){
      //console.log("rhet-butler/presenter.js:168", "goto: reference", reference);
      this.buildTransition(reference, thing);
      this.currentTransition.start();
    };

    presenter.completeTransition = function(){
      utils.triggerEvent(this.currentTransition.currentStep.element, "rhet:stepenter", { api: this });
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
      return window.location.hash.replace(/^#\/?/,"");
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
