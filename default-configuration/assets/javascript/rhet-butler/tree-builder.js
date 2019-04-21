goog.provide('rhetButler.TreeBuilder');
goog.require('rhetButler.Steps.Root');
goog.require('rhetButler.Steps.Group');
goog.require('rhetButler.Steps.Slide');
goog.require('rhetButler.Steps.Item');

rhetButler.TreeBuilder = function(element, stepClass){
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
};

;(function(){
    var builder = rhetButler.TreeBuilder.prototype;

    builder.getParent = function(element){
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
    };

    builder.assembleNextElement = function(element){
      var step;

      var parent = this.getParent(element);

      if(element.classList.contains("root")){
        if(element.id.length == 0){
          element.id = "rhet-root"
        }
        step = new rhetButler.Steps.Root(element, this.indexes);
        this.rootStep = step;
        this.indexes.step++;
        this.parentStack.unshift(step);
      } else if(element.classList.contains("group")){
        this.indexes.group++;
        if(element.id.length == 0){
          element.id = "group-" + this.indexes.group
        }

        step = new rhetButler.Steps.Group(parent, element, this.indexes);
        this.indexes.step++;
        this.parentStack.unshift(step);
      } else if(element.classList.contains("slide")){
        this.indexes.slide++;
        if(element.id.length == 0){
          element.id = "slide-" + this.indexes.slide
        }

        step = new rhetButler.Steps.Slide(parent, element, this.indexes);
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
          step = new rhetButler.Steps.Item(parent, element, this.indexes, cues[i]);
          if(step.parent.items.some(function(item){ return item == step})){
            this.indexes.step++;
          } else {
            this.indexes.item--;
          }
        }
      } else {
        return //malformed
      }
    };

    builder.buildTree = function(){
      var elements = rhetButler.arrayify(this.root.getElementsByClassName(this.stepClass));

      elements.forEach(this.assembleNextElement, this);
      while(this.parentStack.length > 0){
        this.parentStack.shift().treeFinished();
      };

      return this.rootStep;
    };
})();
