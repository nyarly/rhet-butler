import {pfx} from '../utils.js';

var motionStyles = [
  "transition-duration",
  "animation-name",
  "animation-iteration-count",
  "animation-play-state"
];

var motionCompleteEvents = []

;(function(){
    var events = ["TransitionEnd", "AnimationEnd"];
    var prefixes = ["webkit", "o", "MS", ""];
    prefixes.forEach(function(prefix){
        events.forEach(function(event){
            motionCompleteEvents.push(prefix + event);
            motionCompleteEvents.push(prefix + event.toLowerCase());
          });
      });
  })();

export default class {
  constructor(step){
    this.step = step;
    this.checkIn = false;
    this.eventListener = null;
  }

  visit(){
    var beforeStyles, afterStyles;

    if(this.checkIn){ return true; }

    beforeStyles = this.getMotionStyles();

    this.step.addClass("am-at");
    this.step.removeClass("to-come");
    afterStyles = this.getMotionStyles();

    this.checkIn = true;
    for(name in afterStyles){
      if(beforeStyles[name] != afterStyles[name]){
        this.checkIn = false; };
    }

    if(!this.elementHasMotion()){ this.visited(); };

    if(this.checkIn){ this.step.removeClass("am-at"); };

    return this.checkIn;
  }

  setArriveHandler(funk){
    this.removeListener();
    this.eventListener = funk;
    this.attachListener();
  }

  visited(){
    this.step.removeClass("to-come");
    this.step.addClass("has-gone");
    this.checkIn = true;
  }

  prepare(){
    this.step.addClass("to-come");
    this.attachListener();
  }

  complete(){
    this.step.removeClass("to-come");
    this.step.removeClass("has-gone");
    this.step.removeClass("am-at");
    this.removeListener();
  }


  getMotionStyles(){
    var style = window.getComputedStyle(document.getElementById(this.step.element.id));
    var result = {}
    motionStyles.map(function(styleName){
        result[styleName] = style.getPropertyValue(pfx(styleName));
      });
    return result;
  }

  elementHasMotion(){
    var style = this.getMotionStyles();
    var durations = []
    var states, counts;

    if(style["transition-duration"]){
      durations = style["transition-duration"].split(/\s*,\s*/); //there's a non-zero one
    }
    if(!durations.every(function(duration){ return (duration == "0s") })){
      return true;
    }

    if(style["animation-name"] == null || style['animation-name'] == 'none'){
      return false
    };

    states = style["animation-play-state"].split(/\s*,\s*/);
    counts = style["animation-iteration-count"].split(/\s*,\s*/);

    if(states.length < counts.length){
      states = states.concat(states);
    } else {
      counts = counts.concat(counts);
    }

    return (states.some(function(state, index){
          return (state != "paused" && counts[index] != "infinite")
        }));
  }

  attachListener(){
    if(this.eventListener){
      motionCompleteEvents.forEach(function(eventName){
          this.step.element.addEventListener(eventName, this.eventListener, true);
        }, this)
    }
  }

  removeListener(){
    if(this.eventListener){
      motionCompleteEvents.forEach(function(eventName){
          this.step.element.removeEventListener(eventName, this.eventListener, true);
        }, this)
    }
  }
}
