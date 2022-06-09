class WizardNewVariableForForm extends WizardNewVariableForm {
  constructor(dnd, element, data) {
    super(dnd, element, data);
  }
 
  template() {
    return (
      `<div class="wizard-box-edit-dialog">
         <h4>Create variable</h4>
         <input type="text" id="newVar" name="newVar" value='${this.data.userValue}' />
           <p id="newVarExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
           <button id="newVarBtn">update</button> 
         </div>
       `);
   }
  
  addListeners(){
    this.btn = document.querySelector('#newVarBtn');
    this.btn.addEventListener('click', this.updateWizardVarBox.bind(this));
  }
  
  updateWizardVarBox(ev) {
    const value = document.querySelector('#newVar').value;
    const tempVarName = this.dnd.block.variableName;
    if(!this.validVarName(value)) {
      this.dnd.block.variableName = tempVarName;
      return;
    }
    this.element.value = value;
    const data = JSON.parse(this.element.parentElement.getAttribute('data-we'));
    data.userValue = this.element.value;
    data.forVar = true;
    this.element.parentElement.setAttribute('data-we', JSON.stringify(data));
    this.btn.removeEventListener('click', this.updateWizardVarBox.bind(this));
    this.overlayEdition.remove(); 
    this.dnd.buildWizardExpression();
  }
}