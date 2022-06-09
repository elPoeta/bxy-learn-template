class WizardEditFuncItem extends WizardEditVarFuncBase {
  constructor(dnd, element, data) {
    super(dnd, element, data);
  }
  
  template(element, data) {
    const functions = flowChartEditor.canvas.tabs[1].api.program['1'].blocks.map(block => { return { id: block.id, code: block.code, vars: block.vars } }).filter(block => block.code !== '');
    this.variables = [...this.dnd.block.getAllVariableScope()]
      .map(variable => variable[1]).filter(variable => variable.isInFlow)
      .map(variable => this.setUuid(variable));
    return !functions.length ? 
      (
       `<div class="wizard-box-edit-dialog">
          <h4>Function</h4>
          <p>No functions defined yet</p>
          <div id="defineNewBtnWizardFunc" style="display:flex;justify-content:center;align-items:center;margin:10px; font-size:1.4em;">
             <span style="padding:5px;border:2px solid #237874;border-radius:20px;color:#237874;font-weight:bold;cursor:pointer;">Declare New Function</span>
          </div>
          <button id="funcBtn" data-btn="empty">accept</button> 
        </div>`)
      : (
        `<div class="wizard-box-edit-dialog" style="grid-template-rows: 80px 0px 1fr 1fr auto;">
           <div>
             <h4 style="position: relative;top: 20px;">Function selected</h4>
             <div id="funcDropZone" class="funcDropZone funcVarItemsDropZone"></div>
           </div>
           <div id="varDropContainer"></div> 
          <div>
           <h4>Functions</h4>
          <div class="wizard-box-table-container wizard-box-table-container-func custom-gray-scroll custom-gray-scroll">
            <div class="wizard-box-table wizard-box-table-header" style="background:#b0c9ef;grid-template-columns: auto;">
              <h5>Functions</h5>
            </div>
            ${functions.map(funcValue => (
              ` <div class="wizard-box-table wizard-box-table-body function-item" style="grid-template-columns: auto;" data-function='${JSON.stringify(funcValue)}' draggable="true">
                  <h6>${funcValue.code}</h6>
                </div>`
            )).join('')}
          </div>
          </div>
          <div>
          <h4>Variables</h4>
          <div class="wizard-box-table-container wizard-box-table-container-param custom-gray-scroll">
            <div class="wizard-box-table wizard-box-table-header">
              <h5>Name</h5>
              <h5>Type</h5>
              <h5>Scope</h5>
            </div>
            ${this.variables.map(variable => (
              ` <div id="${variable.uuid}" class="wizard-box-table wizard-box-table-body param-item" draggable="true">
                  <h6>${variable.name} ${variable.declarationType === 'Array' ? '[ ]' : variable.declarationType === 'MultiDimensional Array' ? '[ ] [ ]' : ''}</h6>
                  <h6>${variable.declaration}</h6>
                  <h6>${variable.scope.replace(' scope', '')}</h6>
                </div>`
            )).join('')}
          </div>
          </div>
          <div style="height:90px;">
           <h4>Customize</h4>
           <div class="wizard-box-table-container custom-gray-scroll">
            <div class="wizard-box-table wizard-box-table-header" style="background:orange;color:#fff;grid-template-columns: auto;">
              <h5>Custom</h5>
            </div>
            <div class="wizard-box-table wizard-box-table-body param-item" style="grid-template-columns: auto;" data-variable='${JSON.stringify({"value":"","declaration":"any"})}' draggable="true">
              <h6>Custom parameter</h6>
            </div>
          </div>
          </div>
          <p id="functionExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
          <button id="funcBtn" data-btn="full">update</button> 
        </div>
       `);
  }
  
  setUuid(variable) {
    variable.uuid = Utils.uuid();
		return variable;
  }
  
  addListeners(element) {
    this.addNewFuncListener();
    this.updateFuncBtn = document.querySelector('#funcBtn');
    this.updateFuncBtn.addEventListener('click', this.updateWizardBoxFunction.bind(this, element));
    if(!document.querySelector('.wizard-box-table-container-func')) return;
    this.draggableFunctions = document.querySelectorAll('.function-item');
    this.dropZone = document.querySelector('#funcDropZone');
    this.draggableFunctions.forEach(element => element.addEventListener('dragstart', this.handleDragStart.bind(this)));
    this.draggableFunctions.forEach(element => element.addEventListener('dragend', this.handleDragEnd.bind(this)));
    this.dropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
    this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
    this.dropZone.addEventListener('drop', this.handleDrop.bind(this)); 
    this.draggableFunctions.forEach(element => element.addEventListener('touchstart', this.handleTouchStart.bind(this)));
    this.draggableFunctions.forEach(element => element.addEventListener('touchmove', this.handleTouchMove.bind(this)));
    this.draggableFunctions.forEach(element => element.addEventListener('touchend', this.handleTouchEnd.bind(this)));
    this.draggableParams = document.querySelectorAll('.param-item');   
    this.draggableParams.forEach(element => element.addEventListener('dragstart', this.handleParamDragStart.bind(this)));
    this.draggableParams.forEach(element => element.addEventListener('dragend', this.handleParamDragEnd.bind(this)));
    this.draggableParams.forEach(element => element.addEventListener('touchstart', this.handleTouchStart.bind(this)));
    this.draggableParams.forEach(element => element.addEventListener('touchmove', this.handleTouchMove.bind(this)));
    this.draggableParams.forEach(element => element.addEventListener('touchend', this.handleTouchEnd.bind(this)));
    this.overlayEdition.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.overlayEdition.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.overlayEdition.addEventListener('mouseup', this.handleMouseUp.bind(this))    
    if(element.hasAttribute('data-values')) {
      const dataValues = element.getAttribute('data-values');
      const dataFunc = JSON.parse(dataValues);
      let displayValue = dataFunc.vars.params.reduce((acc, curr) => `${acc}${curr.declarationType},`,`${dataFunc.vars.functionName}(`);
      displayValue = displayValue.charAt(displayValue.length-1) === ',' ?  displayValue.replace(/,$/, ')') : `${displayValue})` ;
      this.dropZone.innerHTML = `<h5 id="dropedDataFunc" data-funcname='${dataFunc.vars.functionName}'>${displayValue}</h5>`; 
      document.querySelector('#dropedDataFunc').setAttribute('data-funcprops',JSON.stringify(dataFunc));
      if(dataFunc.usedParams) {
        this.createParamDropZone(dataFunc); 
        this.addParamsToDropZone(dataFunc.usedParams);
      }
    }
  }
  
  addNewFuncListener() {
    if(!document.querySelector('#defineNewBtnWizardFunc')) return;
    this.declareWizardFuncBtn = document.querySelector('#defineNewBtnWizardFunc');
    const message = ` <p>Do you want to declare a new function?.</p> 
           <p>Define new function form will open.</p>
           <p>If you accept, you will lose the changes to this form.</p>`;
    this.declareWizardFuncBtn.addEventListener('click', this.dnd.block.handleDeclareNew.bind(this.dnd.block, 'WizardFunc', message));  
  }
  
  addParamsToDropZone(params) {
    const elements = [...document.querySelector('#paramDropZone').children];
    elements.forEach((element,index) => {
      element.innerHTML = `<h5 style="font-size:1.4em;" data-paramname='${params[index]}' >${params[index]}</h5>`;     
    });
  }
  
  handleMouseUp(ev) {
    ev.preventDefault();
    if (this.activeEvent === 'move') {
      if(this.dragSourceItem.classList.contains('function-item')) {
       const droppedZoneBox = this.dropZone.getBoundingClientRect();
       if (this.dnd.validDropZone(droppedZoneBox, this.dragSourceItem)) {
         this.handleDrop(ev);
        }           
      } else {
          const droppedZoneBox = this.dropParamZone.getBoundingClientRect();
          if (this.dnd.validDropZone(droppedZoneBox, this.dragSourceItem)) {
            this.paramDropTouchAction();
         }           
      }
      if(this.dragSourceItem.classList.contains('function-item')) { 
        this.dropZone.classList.remove('dropZone-over'); 
      } 
      this.dragSourceItem.remove();
      this.activeEvent = null;
      this.dragSourceItem = null;
      this.dragParamSourceItem = null;
    }
  }
  
  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if(!this.dragSourceItem || !this.dragSourceItem.classList.contains('function-item')) return;
    const dataFunc = JSON.parse(this.dragSourceItem.getAttribute('data-function'));
    let displayValue = dataFunc.vars.params.reduce((acc, curr) => `${acc}${curr.declarationType},`,`${dataFunc.vars.functionName}(`);
    displayValue = displayValue.charAt(displayValue.length-1) === ',' ?  displayValue.replace(/,$/, ')') : `${displayValue})` ;
    this.dropZone.innerHTML = `<h5 id="dropedDataFunc" data-funcname='${dataFunc.vars.functionName}' style="overflow: auto;">${displayValue}</h5>`;
    document.querySelector('#dropedDataFunc').setAttribute('data-funcprops',JSON.stringify(dataFunc));
    this.createParamDropZone(dataFunc);
  }
  
  createParamDropZone(dataFunc) {
    const { vars } = dataFunc;
    const varDropContainer = document.querySelector('#varDropContainer');
    const dialogBox = document.querySelector('.wizard-box-edit-dialog');
    if(!vars.params.length) {
      this.cleanParamZone(varDropContainer, dialogBox);
      return;
    }
    this.removeParamDropListeners();
    dialogBox.style = "grid-template-rows: 80px 180px 1fr 1fr auto;";
    this.paramsLen = vars.params.length;
    varDropContainer.innerHTML = this.templateDropZoneParam(vars.params);
    this.addParamListeners();
  }
  
  templateDropZoneParam(params) {
    return (
      `<h4>Parameter/s selected</h4>
       <div id="paramDropZone" class="custom-gray-scroll">
         ${params.map(param => (
           `<div class="paramDropItem" data-kind='${param.declarationType}' data-content='Drop ${param.declarationType} parameter here' ></div>`
         )).join('')}
       </div>`);  
  }
  
  addParamListeners() {
    this.dropParamZone = document.querySelector('#paramDropZone');
    this.dropParamZone.addEventListener('dragenter', this.handleParamDragEnter.bind(this));
    this.dropParamZone.addEventListener('dragleave', this.handleParamDragLeave.bind(this));
    this.dropParamZone.addEventListener('dragover', this.handleParamDragOver.bind(this));
    this.dropParamZone.addEventListener('drop', this.handleParamDrop.bind(this));
  }
  
  handleParamDragStart(ev) {
    this.dragParamSourceItem = ev.target;
  }
  
  handleParamDragEnter(ev) {
    ev.preventDefault();   
  }
  
  handleParamDragLeave(ev) {
    ev.preventDefault(); 
  }
  
  handleParamDragOver(ev) {
    ev.preventDefault();
  }
  
  handleParamDragEnd(ev) {
    ev.stopPropagation();
    this.dragParamSourceItem = null;
    if(this.dropParamZone)
      this.dropParamZone.classList.remove('dropZone-over');  
    return false;
  }

  handleParamDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();  
    this.paramDropAction(ev.target);
  }
  
  paramDropAction(target) {
    if(this.dropParamZone)
      this.dropParamZone.classList.remove('dropZone-over'); 
    if(!this.dragParamSourceItem || !this.dragParamSourceItem.classList.contains('param-item')) return;
    const dataKind = target.getAttribute('data-kind');
    const dataParam = JSON.parse(this.dragParamSourceItem.getAttribute('data-variable'))
    if(dataKind !== dataParam.declaration && dataParam.declaration !== 'any') {
      this.dnd.displayExpressionError('functionExpressionError', `Incompatible data type: required ${dataKind}  `);
      return;
    }
    if(dataParam.declaration !== 'any') {
      target.innerHTML = `<h5 style="font-size:1.4em;" data-paramname='${dataParam.name}' >${dataParam.name}</h5>`;         
    } else {
        this.addCustomParameter(target);
    }
  }
  
  addCustomParameter(target) {
    const div = document.createElement('div');
    div.classList.add('overlay');
    div.id = 'overlayCustomParam';
    div.style = Utils.hasCssBackdrop() ? 
      `background: rgba(255, 255, 255, 0.05);backdrop-filter: blur(5px);-webkit-backdrop-filter: blur(5px);` : `background: #263d5a73;`; 
    div.innerHTML = this.templateCustomParameter();
    document.querySelector('body').appendChild(div);
    this.customParamBtn = document.querySelector('#customParamBtn');
    this.customParamBtn.addEventListener('click', this.handleAddCustomParam.bind(this, target));
  }
  
  handleAddCustomParam(element, ev) {
    const value = document.querySelector('#customInputParam').value;
    if(Utils.isEmpty(value)) {
      this.dnd.displayExpressionError('customParamExpressionError', 'Expression is empty');
      return;
    }
    element.innerHTML = `<h5 style="font-size:1.4em;" data-paramname='${value}' >${value}</h5>`;         
    this.customParamBtn.removeEventListener('click', this.handleAddCustomParam.bind(this, element));  
    document.querySelector('#overlayCustomParam').remove();
  }
  
  templateCustomParameter() {
    return (
      `<div class="wizard-box-edit-dialog" style="border:3px solid #f3610a;">
         <h4>Create Parameter</h4>
         <input type="text" id="customInputParam" name="customInputParam" value='' />
         <p id="customParamExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
         <button id="customParamBtn">add</button> 
      </div>`);
  }
  
  paramDropTouchAction() {
    const children = Array.from(this.dropParamZone.children);
    let index = -1;
    for (let i = 0; i < children.length; i++) {
      if (this.dnd.validDropZone(children[i].getBoundingClientRect(), this.dragSourceItem)) {
        index = i;
        break;
      }
    } 
    if(index > -1) {
      this.dragParamSourceItem = this.dragSourceItem;
      this.paramDropAction(children[index]); 
    }
  }
  
  updateWizardBoxFunction(element, ev) {
    const type = ev.target.getAttribute('data-btn');
    if(type === 'empty') {
      element.parentElement.remove();
    } else {
      if(!document.querySelector('#dropedDataFunc')) {
        this.dnd.displayExpressionError('functionExpressionError', 'Expression is empty');
        return;
      }
      const droppedFunc = document.querySelector('#dropedDataFunc');
      const funcProps = JSON.parse(droppedFunc.getAttribute('data-funcprops'));
      let expression = droppedFunc.getAttribute('data-funcname') + '(';
      if(document.querySelector('#paramDropZone')) {
        const elements = [...document.querySelector('#paramDropZone').children];
        if(!this.validParams(elements, funcProps.vars.params)) {
          this.dnd.displayExpressionError('functionExpressionError', 'Missing params');
          return;
        }
        expression = elements.reduce((acc,curr) => `${acc}${curr.firstElementChild.innerText},`,expression)           
        funcProps.usedParams = elements.map(element => element.firstElementChild.innerText);
      }
      element.value = expression.charAt(expression.length-1) === ',' ?  expression.replace(/,$/, ')') : `${expression})` ;
      const dataWe = JSON.parse(element.parentElement.getAttribute('data-we'));
      funcProps.name = element.value;
      element.setAttribute('data-values',  JSON.stringify(funcProps));  
      dataWe.userValue = element.value;
      dataWe.extraProps = funcProps;
      element.parentElement.setAttribute('data-we', JSON.stringify(dataWe));
      this.dnd.buildWizardExpression();
      this.removeFunctionListeners();
    }
    this.overlayEdition.remove();  
  }
  
  validParams(elements, params) {
    let countParams = 0;
    elements.forEach(element => {
      if(element.firstElementChild) {
        countParams++;
      }
    });
    return params.length === countParams;
  }
  
  cleanParamZone(varDropContainer, dialogBox) {
    this.removeParamDropListeners();
    varDropContainer.innerHTML = '';
    dialogBox.style = "grid-template-rows: 80px 0px 1fr 1fr auto;";  
  }
  
  removeParamDropListeners() {
    if(!document.querySelector('#paramDropZone')) return;
    this.dropParamZone.removeEventListener('dragenter', this.handleParamDragEnter.bind(this));
    this.dropParamZone.removeEventListener('dragleave', this.handleParamDragLeave.bind(this));
    this.dropParamZone.removeEventListener('dragover', this.handleParamDragOver.bind(this));
    this.dropParamZone.removeEventListener('drop', this.handleParamDrop.bind(this));
  }
  
  removeFunctionListeners() {
    this.draggableFunctions.forEach(element => element.removeEventListener('dragstart', this.handleDragStart.bind(this)));
    this.draggableFunctions.forEach(element => element.removeEventListener('dragend', this.handleDragEnd.bind(this)));
    this.dropZone.removeEventListener('dragenter', this.handleDragEnter.bind(this));
    this.dropZone.removeEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dropZone.removeEventListener('dragover', this.handleDragOver.bind(this));
    this.dropZone.removeEventListener('drop', this.handleDrop.bind(this)); 
    this.draggableParams.forEach(element => element.removeEventListener('dragstart', this.handleParamDragStart.bind(this)));
    this.draggableParams.forEach(element => element.removeEventListener('dragend', this.handleParamDragEnd.bind(this)));
    this.updateFuncBtn.removeEventListener('click', this.updateWizardBoxFunction.bind(this, this.element));
  }
 
}