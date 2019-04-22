//Presenter
//  The overall interface to the application
//  Maintains some state, receives method calls to e.g. move between slides
//  Builds the step-tree
//  Builds StationLists

import * as utils from "./utils.js";
import TreeBuilder from "./rhet-butler/tree-builder.js";
import TransitionStations from "./rhet-butler/transition-stations.js";
import Step from './rhet-butler/step.js';

export default class {
  constructor(document, window, rootId){
    this.document = document;
    this.body = document.body;
    this.window = window;
    this.stepsById = {};

    this.previousSlideIndex = 0;
    this.nextStepIndex = 0;

    this.root = utils.byId(rootId);
    this.body.classList.remove("rhet-disabled");
    this.body.classList.add("rhet-enabled");

    // get and init steps
    var stepElements = utils.arrayify(this.root.getElementsByClassName("rhet-butler"));
    var treeBuilder = new TreeBuilder(this.root, "rhet-butler");
    this.rootStep = treeBuilder.buildTree();
    this.rootStep.eachStep(function (step) {
        step.addClass("future");
      });

    var prev = this.rootStep.firstItem;

    this.currentTransition = new TransitionStations(this, prev, prev, prev);
    this.currentTransition.forceFinish();

    this.unbinders = [];
    this.bindHandlers();

    utils.triggerEvent(this.root, "rhet:init", { api: this });
  }

  //    updateBeforeAndAfter(previousStep, nextStep){
  //      this.markRange(0, previousStep.indexes.step, "before");
  //      this.markRange(nextStep.indexes.step, undefined, "after");
  //      previousStep.eachParent(function(step){ step.removeClass("before"); });
  //      nextStep.eachParent(function(step){ step.removeClass("after"); });
  //    }

  teardown(){
    this.unbindHandlers();
  }

  markRange(start, end, mark){
    this.stepsList.slice(start, end).forEach(function(elem){
        var containers;
        containers = this.containingElements(elem);
        containers.steps.forEach(function(step){ this.thisClassNotThose(step, mark, "before", "after", "passing"); }, this);
        containers.slides.forEach(function(slide){ this.thisClassNotThose(slide, mark, "before", "after", "passing"); }, this);
      }, this);
  }

  bindHandler(target, event, funk, capture) {
    this.unbinders.push(() => {
        target.removeEventListener(event, funk, capture);
      })

    target.addEventListener(event, funk, capture);
  }

  unbindHandlers() {
    for(let f of this.unbinders){
      f();
    }
  }

  bindHandlers(){
    var presenter = this;

    this.unbindHandlers();

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

      presenter.bindHandler(presenter.root, "rhet:stepenter", function (event) {
          window.location.hash = lastHash = "#/" + event.target.id;
        }, false);


      presenter.bindHandler(window, "hashchange",
        function(event){
          if(window.location.hash !== lastHash) {
            presenter.moveTo( presenter.getElementFromHash() );
          }
        }, false);

      // START
      // by selecting step defined in url or first step of the presentation

      presenter.teleport(presenter.getElementFromHash() || presenter.rootStep.firstItem);
    }

    this.bindHandler(this.root, "rhet:init", initListener, false);
  }

  resolveStep(reference, thing){
    // find by id
    // find by relavtive pos (next,prev)*(slide,item)
    if(reference instanceof Step){
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
  }

  currentStep(){
    return this.currentTransition.currentStep;
  }

  buildTransition(nextStep){
    var previousStep = this.currentTransition.resumeStep();
    var currentStep = this.currentTransition.currentStep;
    if(typeof quiet_console == "undefined") {
      console.log("New transition list: " +
          "S/C/E: " + previousStep.toString() +
          " / " + currentStep.toString() +
          " / " + nextStep.toString());
      }

    this.currentTransition.cancel();
    this.currentTransition = new TransitionStations(this, previousStep, currentStep, nextStep);
  }

  teleport(reference, thing){
    var nextStep = this.resolveStep(reference, thing);
    if(nextStep){
      this.buildTransition(nextStep);
      this.currentTransition.forceFinish();
    }
  }

  moveTo(reference, thing){
    var nextStep = this.resolveStep(reference, thing);
    if(nextStep){
      this.buildTransition(nextStep);
      this.currentTransition.start();
    }
  }

  completeTransition(){
    var elem = document.getElementById(this.currentTransition.currentStep.element.id);
    utils.triggerEvent(elem, "rhet:stepenter", { api: this });
  }

  ///// METHODS BELOW HERE STILL IN NEED OF REFACTORING

  checkSupport (){
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
  }

  // `getElementFromHash` returns an element located by id from hash part of
  // window location.
  getElementFromHash () {
    // get id from url # by removing `#` or `#/` from the beginning,
    // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
    return window.location.hash.replace(/^#\/?/,"");
  }

  // `getStep` is a helper function that returns a step element defined by
  // parameter.
  // If a number is given, step with index given by the number is returned, if a string
  // is given step element with such id is returned, if DOM element is given it is returned
  // if it is a correct step element.
  getStep ( step ) {
    if (typeof step === "number") {
      step = step < 0 ? this.stepsList[ stepsList.length + step] : this.stepsList[ step ];
    } else if (typeof step === "string") {
      step = utils.byId(step);
    }
    return (step && step.id && this.stepsData[step.id]) ? step : null;
  }

  // `prev` API function goes to previous step (in document order)
  prev () {
    var prev = this.steps.indexOf( this.activeStep ) - 1;
    prev = prev >= 0 ? this.steps[ prev ] : this.getStep(-1);

    return this.moveTo(prev);
  }

  // `next` API function goes to next step (in document order)
  next () {
    var next = steps.indexOf( activeStep ) + 1;
    next = next < steps.length ? steps[ next ] : steps[ 0 ];

    return this.moveTo(next);
  }

  //thisClassNotThose(someEl, "setMe", "unsetMe", "unsetMeToo")
  //e.g.
  //thisClassNotThose(event.target, "present", "past", "future")
  thisClassNotThose(element, setClass) { //...exclusiveClasses
    var idx, length = arguments.length;
    for(idx=2; idx < arguments.length; idx++){
      element.classList.remove(arguments[idx]);
    }
    element.classList.add(setClass);
  }

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
  unmarkEndpoint(stepIndex, mark){
    var containers = this.containingElements(this.steps[stepIndex]);
    var slide = containers.slides[0];

    containers.all.forEach(function(elem){ elem.classList.remove(mark); })

    this.root.classList.remove(mark + "-" + slide.id)
  }

  markTime(stepIndex, mark){
    var containers = this.containingElements(this.steps[stepIndex]);
    var slide = containers.slides[0];

    containers.all.forEach(function(elem){
        this.thisClassNotThose(elem, mark, "past", "present", "future");
      }, this)
  }

  markEndpoint(stepIndex, mark){
    var containers = this.containingElements(this.steps[stepIndex]);
    var slide = containers.slides[0];

    containers.all.forEach(function(elem){
        this.thisClassNotThose(elem, mark, "before", "after", "passing");
      }, this)

    this.root.classList.add(mark + "-" + slide.id);
    return containers
  }
}
