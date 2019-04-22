import ChildStep from "../child-step.js";

export default class extends ChildStep {
  constructor(parent, element, indexes){
    super(parent, element, indexes);
  }

  addNextStep(step){
    step.addPrevGroup(this);
  }

  addPrevStep(step){
    step.addNextGroup(this);
  }

  addNextSlide(slide){
    this.debugAssoc("gns", slide)

    this.nextSlide = slide;
    if(this.lastSlide){
      this.lastSlide.addNextSlide(slide);
    }
  }

  addPrevSlide(slide){
    this.debugAssoc("gps", slide)
    if(!this.lastSlide){
      this.lastSlide = slide;
    }
    if(!this.lastItem){
      this.lastItem = slide.lastChild();
    }
    this.prevSlide = slide;
    this.prevItem = slide.lastChild();
  }

  addNextGroup(group){
    this.debugAssoc("gng", group)
    //
  }

  addPrevGroup(group){
    this.debugAssoc("gpg", group)

    this.prevSlide = group.lastSlide;

    this.lastSlide = group.lastSlide;
    this.lastItem = group.lastItem;
  }
}
