import { arrayify } from "../utils.js";
import Step from "./step.js";
import StepsRoot from "./steps/root.js";
import StepsGroup from "./steps/group.js";
import StepsSlide from "./steps/slide.js";
import StepsItem from "./steps/item.js";

export default class {
  constructor(element, stepClass){
    this.root = element;
    this.stepClass = stepClass;
    this.rootStep = null;
    this.parentStack = [];
    this.indexes = {
      step: 0,
      group: 0,
      slide: 0,
      item: 0
    };
  }

  getParent(element){
    var checkElement, parent, parentElement;
    while(this.parentStack.length > 0) {
      parent = this.parentStack[0];
      parentElement = parent.element;
      checkElement = element;
      while(checkElement != parentElement && checkElement != this.root){
        checkElement = checkElement.parentElement;
      }

      if(checkElement == parentElement){
        return parent;
      }

      this.parentStack.shift().treeFinished();
    }

    return null;
  }

  assembleNextElement(element){
    var step;

    var parent = this.getParent(element);

    if(element.classList.contains("root")){
      if(element.id.length == 0){
        element.id = "rhet-root"
      }
      step = new StepsRoot(element, this.indexes);
      this.rootStep = step;
      this.indexes.step++;
      this.parentStack.unshift(step);
    } else if(element.classList.contains("group")){
      this.indexes.group++;
      if(element.id.length == 0){
        element.id = "group-" + this.indexes.group
      }

      step = new StepsGroup(parent, element, this.indexes);
      this.indexes.step++;
      this.parentStack.unshift(step);
    } else if(element.classList.contains("slide")){
      this.indexes.slide++;
      if(element.id.length == 0){
        element.id = "slide-" + this.indexes.slide
      }

      step = new StepsSlide(parent, element, this.indexes);
      this.indexes.step++;
      this.parentStack.unshift(step);
    } else if(element.classList.contains("item")){
      var cues = (Array.prototype.filter.call(element.classList, function(klass){ return /^cue-.*/.test(klass); }));
      var cueLength = cues.length;
      for(var i = 0; i < cueLength; i++){
        this.indexes.item++;
        if(element.id.length == 0){
          element.id = "item-" + this.indexes.item
        }
        step = new StepsItem(parent, element, this.indexes, cues[i]);
        if(step.parent.items.some(function(item){ return item == step})){
          this.indexes.step++;
        } else {
          this.indexes.item--;
        }
      }
    } else {
      return //malformed
    }
  }

  buildTree(){
    var elements = arrayify(this.root.getElementsByClassName(this.stepClass));

    elements.forEach(this.assembleNextElement, this);
    while(this.parentStack.length > 0){
      this.parentStack.shift().treeFinished();
    };

    return this.rootStep;
  }
}
