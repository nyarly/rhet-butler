goog.provide('rhetButler.ChildStep');
goog.require('rhetButler.Step');

rhetButler.ChildStep = function(){
};
rhetButler.ChildStep.prototype = new rhetButler.Step;

;(function(){
    var childStep = rhetButler.ChildStep.prototype;
    var supertype = rhetButler.Step.prototype;

    childStep.setup = function(parent, element, indexes){
      this.parent = parent;
      supertype.setup.call(this, element, indexes);
      this.parent.addChild(this);
    };

    childStep.propagateDescendant = function(newChild){
      this.parent.addDescendant(newChild);
    };
})();
