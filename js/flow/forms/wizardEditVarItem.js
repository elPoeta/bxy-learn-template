class WizardEditVarItem extends WizardEditVarFuncBase {
  constructor(dnd, element, data) {
    super(dnd, element, data);
  }
  
  template(data) {
    const { type } = this.dnd.block;
    const blockVarName = this.dnd.block.variableName || '';
    this.variables = [...this.dnd.block.getAllVariableScope()]
      .map(variable => variable[1]).filter(variable => variable.isInFlow)
      .filter(variable => (type === 'inputBlock' && variable.declarationType === 'Normal') || type !== 'inputBlock')
      .map(variable => this.setUuid(variable));
    return !this.variables.length && Utils.isEmpty(blockVarName) ? 
      (
       `<div class="wizard-box-edit-dialog">
          <h4>${data.value}</h4>
          <p>No variables defined yet</p>
          <button id="varBtn" data-btn="empty">accept</button> 
        </div>`)
      : (
        `<div class="wizard-box-edit-dialog" style="grid-template-rows: 80px 1fr 80px;gap:10px;">
          <div id="varDropZone"></div>
          <div class="wizard-box-table-container custom-gray-scroll">
              <h4>${data.value}</h4>
            <div class="wizard-box-table wizard-box-table-header">
              <h5>Name</h5>
              <h5>Type</h5>
              <h5>Scope</h5>
            </div>
            ${this.variables.map(variable => (
              `<div id="${variable.uuid}" class="wizard-box-table wizard-box-table-body variable-item" draggable="true">
                  <h6>${variable.name} ${variable.declarationType === 'Array' ? '[ ]' : variable.declarationType === 'MultiDimensional Array' ? '[ ] [ ]' : ''}</h6>
                  <h6>${variable.declaration}</h6>
                  <h6>${variable.scope.replace(' scope', '')}</h6>
                </div>`
            )).join('')}
          </div>
          ${this.showSuggestedVariable(type, blockVarName)}
          <p id="variableExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
          <button id="varBtn" data-btn="full">update</button> 
        </div>
       `);
  }
  
  setUuid(variable) {
    variable.uuid = Utils.uuid();
		return variable;
  }
  
  showSuggestedVariable(type, blockVarName) {
    return type !== 'forBlock' ? '' : (
            `<div style="height:90px;">
           <h4>Suggested variable</h4>
           <div class="wizard-box-table-container custom-gray-scroll">
            <div class="wizard-box-table wizard-box-table-header" style="background:orange;color:#fff;">
              <h5>Name</h5>
              <h5>Type</h5>
              <h5>Scope</h5>
            </div>
            <div class="wizard-box-table wizard-box-table-body variable-item"  data-variable='${JSON.stringify({"name":blockVarName,"value":"0","declaration":"int","declarationType":"Normal","scope":"For scope","isInFlow":true})}' draggable="true">
              <h6>${blockVarName}</h6>
              <h6>int</h6>
              <h6>For</h6>
            </div>
          </div>
          </div>`);  
  }
  
  addListeners(element) {
    this.updateVarBtn = document.querySelector('#varBtn');
    this.updateVarBtn.addEventListener('click', this.updateWizardBoxVar.bind(this, element));
    if(!document.querySelector('.wizard-box-table-container')) return;
    this.draggableVariables = document.querySelectorAll('.wizard-box-table-body');
    this.dropZone = document.querySelector('#varDropZone');
    this.draggableVariables.forEach(element => element.addEventListener('dragstart', this.handleDragStart.bind(this)));
    this.draggableVariables.forEach(element => element.addEventListener('dragend', this.handleDragEnd.bind(this)));
    this.dropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
    this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
    this.dropZone.addEventListener('drop', this.handleDrop.bind(this)); 
    this.draggableVariables.forEach(element => element.addEventListener('touchstart', this.handleTouchStart.bind(this)));
    this.draggableVariables.forEach(element => element.addEventListener('touchmove', this.handleTouchMove.bind(this)));
    this.draggableVariables.forEach(element => element.addEventListener('touchend', this.handleTouchEnd.bind(this)));
    this.overlayEdition.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.overlayEdition.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.overlayEdition.addEventListener('mouseup', this.handleMouseUp.bind(this));
    if(element.hasAttribute('data-values')) {
      const dataVar = element.getAttribute('data-values');
      const dataValues = JSON.parse(dataVar);
      this.dropZone.innerHTML = `<h5 id="dropedDataVar" data-varname='${dataValues.name}' data-varprops='${dataVar}'>${dataValues.name}</h5>`; 
    }
  }
  
  updateWizardBoxVar(element, ev) {
    const type = ev.target.getAttribute('data-btn');
    if(type === 'empty') {
      element.parentElement.remove();
    } else {
      if(!document.querySelector('#dropedDataVar')) {
        this.dnd.displayExpressionError('variableExpressionError', 'Expression is empty');
        return;
      }
      const dataVarName = document.querySelector('#dropedDataVar').getAttribute('data-varname');
      const dataVarProps = JSON.parse(document.querySelector('#dropedDataVar').getAttribute('data-varprops'));
      const dataWe = JSON.parse(element.parentElement.getAttribute('data-we'));
      element.value = dataVarName;
      element.setAttribute('data-values',  JSON.stringify(dataVarProps));  
      dataWe.userValue = element.value;
      dataWe.extraProps = dataVarProps;
      element.parentElement.setAttribute('data-we', JSON.stringify(dataWe));
      this.dnd.buildWizardExpression();
      this.removeDndListeners(element);
    }
     this.overlayEdition.remove();  
  }
  
  removeDndListeners(element) {
    this.draggableVariables.forEach(element => element.removeEventListener('dragstart', this.handleDragStart.bind(this)));
    this.draggableVariables.forEach(element => element.removeEventListener('dragend', this.handleDragEnd.bind(this)));
    this.dropZone.removeEventListener('dragenter', this.handleDragEnter.bind(this));
    this.dropZone.removeEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dropZone.removeEventListener('dragover', this.handleDragOver.bind(this));
    this.dropZone.removeEventListener('drop', this.handleDrop.bind(this)); 
    this.draggableVariables.forEach(element => element.removeEventListener('touchstart', this.handleTouchStart.bind(this)));
    this.draggableVariables.forEach(element => element.removeEventListener('touchmove', this.handleTouchMove.bind(this)));
    this.draggableVariables.forEach(element => element.removeEventListener('touchend', this.handleTouchEnd.bind(this)));
    this.overlayEdition.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.overlayEdition.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.overlayEdition.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.updateVarBtn.removeEventListener('click', this.updateWizardBoxVar.bind(this, element));
  }
}