class WizardEditItem {
  constructor(dnd, element, data) {
    this.data = data;
    this.element = element;
    this.dnd = dnd;
  }
  
  show() {
    const div = document.createElement('div');
    div.classList.add('overlay');
    div.id = 'overlayEdition';
    div.innerHTML = this.template(this.data);
    document.querySelector('body').appendChild(div);
    this.addListeners(this.element);
    return this;
  }
  
  template(data) {
    return (
      `<div class="wizard-box-edit-dialog">
         <h4>${data.value}</h4>
        <input type="text" id="txtNum" name="txtNum" value='${data.userValue}' />
        <p id="textNumExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
        <button id="txtNumBtn">update</button> 
      </div>
      `);
  }
  
  addListeners(element) {
    this.btn = document.querySelector('#txtNumBtn');
    this.btn.addEventListener('click', this.updateWizardBoxText.bind(this, element));
  }
  
  updateWizardBoxText(element, ev) {
    const value = document.querySelector('#txtNum').value;
    if(Utils.isEmpty(value)) {
      this.dnd.displayExpressionError('textNumExpressionError', 'Expression is empty');
      return;
    }
    if(this.data.name === 'number') {
      const v = value.replace(/d*(f|L)/g, '');
      if(isNaN(v)){
        this.dnd.displayExpressionError('textNumExpressionError', 'Expression is not a number');
        return;        
      }
    }
    element.value = value;
    const data = JSON.parse(element.parentElement.getAttribute('data-we'));
    data.userValue = element.value;
    element.parentElement.setAttribute('data-we', JSON.stringify(data));
    this.btn.removeEventListener('click', this.updateWizardBoxText.bind(this, element));
    document.querySelector('#overlayEdition').remove(); 
    this.dnd.buildWizardExpression();
  }
}
