goog.provide('rhetButler.Steps.Slide');
goog.require('rhetButler.ChildStep');

rhetButler.Steps.Slide = function(parent, element, indexes){
  this.setup(parent, element, indexes);
  this.items = [];
};
rhetButler.Steps.Slide.prototype = new rhetButler.ChildStep;
;(function(){
    var slide = rhetButler.Steps.Slide.prototype;
    var step = rhetButler.Step.prototype;

    slide.addChild = function(newChild){
      if(this.items.some(function(item){ return newChild.cue() == item.cue() })){
          return;
        }
      this.items.push(newChild);
    };

    slide.treeFinished = function(){
      var cueRegex = /^cue-(\d+)/;
      if(this.items.length == 0){
        return;
      };

      this.items = this.items.sort(function(left, right){
          var leftNum = parseInt(cueRegex.exec(left.cue())[1], 10);
          var rightNum = parseInt(cueRegex.exec(right.cue())[1], 10);
          if(leftNum == rightNum){
            if(left.cue() < right.cue()){
              return -1
            } else {
              return 1
            }
          } else if(leftNum < rightNum) {
            return -1
          } else {
            return 1;
          }
        });

      this.items[0].prevItem = this;
      this.nextItem = this.items[0];

      var itemIndex = Math.max.apply(undefined, this.items.map(function(item){return item.indexes.item}));
      this.items.forEach(function(item){
          item.indexes.item = itemIndex;
          itemIndex++;
        });

      this.items.forEach(function(newChild){
          newChild.prevSlide = this.prevSlide;
          step.addChild.call(this, newChild)
        }, this);
    };

    slide.addNextStep = function(step){
      step.addPrevSlide(this);
    };

    slide.addPrevStep = function(step){
      step.addNextSlide(this);
    };

    slide.addPrevGroup = function(group){
      this.debugAssoc("spg", group)
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
