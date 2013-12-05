goog.provide('rhetButler.Steps.Group');
goog.require('rhetButler.ChildStep');

rhetButler.Steps.Group = function(parent, element, indexes){
  this.setup(parent, element, indexes);
};
rhetButler.Steps.Group.prototype = new rhetButler.ChildStep;

;(function(){
    var group = rhetButler.Steps.Group.prototype;
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
