goog.provide('rhetButler.TransitionStation');
goog.require('rhetButler');

rhetButler.TransitionStation = function(step){
  this.step = step;
  this.checkIn = false;
  this.eventListener = null;
};

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

    var station = rhetButler.TransitionStation.prototype;

    station.visit = function(){
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
    };

    station.setArriveHandler = function(funk){
      this.removeListener();
      this.eventListener = funk;
      this.attachListener();
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

    station.complete = function(){
      this.step.removeClass("to-come");
      this.step.removeClass("has-gone");
      this.step.removeClass("am-at");
      this.removeListener();
    };


    station.getMotionStyles = function(){
      var style = window.getComputedStyle(document.getElementById(this.step.element.id));
      var result = {}
      motionStyles.map(function(styleName){
          result[styleName] = style.getPropertyValue(rhetButler.pfx(styleName));
        });
      return result;
    }

    station.elementHasMotion = function(){
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
    };

    station.attachListener = function(){
      if(this.eventListener){
        motionCompleteEvents.forEach(function(eventName){
            this.step.element.addEventListener(eventName, this.eventListener, true);
          }, this)
      }
    };

    station.removeListener = function(){
      if(this.eventListener){
        motionCompleteEvents.forEach(function(eventName){
            this.step.element.removeEventListener(eventName, this.eventListener, true);
          }, this)
      }
    };
  })();
