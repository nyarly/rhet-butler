import ChildStep from '../child-step.js';

export default class extends ChildStep {
  constructor(parent, element, indexes){
    super(parent, element, indexes);
    this.items = [];
  }

  addChild(newChild){
    if(this.items.some(item => newChild.cue() == item.cue() )){
      return;
    }
    this.items.push(newChild);
  }

  joinParent(parent){
    parent.lastSlide = this;
    if (parent.firstSlide == null) {
      parent.firstSlide = this;
      parent.firstItem = this;
      if(parent.prevSlide != null){
        parent.prevSlide.addNextSlide(this);
        this.addPrevSlide(parent.prevSlide);
      }
    }
  }

  treeFinished(){
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

    for(let newChild of this.items) {
      newChild.prevSlide = this.prevSlide;
      super.addChild(newChild);
    }
  }

  addNextStep(step){
    step.addPrevSlide(this);
  }

  addPrevStep(step){
    step.addNextSlide(this);
  }

  addPrevGroup(group){
    this.debugAssoc("spg", group)
    if(group.lastSlide){
      this.addPrevSlide(group.lastSlide)
    }
  }

  addNextSlide(slide){
    this.debugAssoc("sns", slide)

    this.nextSlide = slide;
    this.children.forEach(function(item){ item.nextSlide = slide; })
    this.lastChild().nextItem = slide;
  }

  addPrevSlide(slide){
    this.debugAssoc("sps", slide)
    this.prevSlide = slide;
    this.children.forEach(function(item){
        item.prevSlide = slide;
      })
    this.prevItem = slide.lastChild();
  }
}
