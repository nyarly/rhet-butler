import Step from './step.js';

export default class extends Step {
  constructor(parent, element, indexes){
    super(element, indexes);
    this.parent = parent;
    this.parent.addChild(this);
  };

  propagateDescendant(newChild){
    this.parent.addDescendant(newChild);
  };
}
