class WizardNewVariableForm {
  constructor(dnd, element, data) {
    this.data = data;
    this.element = element;
    this.dnd = dnd;
  }
  
  show() {
    this.overlayEdition = document.createElement('div');
    this.overlayEdition.classList.add('overlay');
    this.overlayEdition.id = 'overlayEdition';
    this.overlayEdition.innerHTML = this.template();
    document.querySelector('body').appendChild(this.overlayEdition);
    this.addListeners();
    return this;
  }
   
   validVarName(value) {
     if(Utils.isEmpty(value)) {
       this.dnd.displayExpressionError('newVarExpressionError', 'Expression is empty');
       return false;
     }
     if (!/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(value)) {
       this.dnd.displayExpressionError('newVarExpressionError', `variable name "${value}" contains ilegal characters`);
       return false;
     }
     if (this.dnd.block.reservedWords.includes(value)) {
       this.dnd.displayExpressionError('newVarExpressionError', `variable name "${value}" is a reserved word`);
       return false;
     }
     this.dnd.block.variableName = value;
     if (this.dnd.block.isInvalidNameInScope()) {
       this.dnd.displayExpressionError('newVarExpressionError', `variable name "${value}" is alrready used`);
       return false;
     }
     return true;
   }
   
   
}