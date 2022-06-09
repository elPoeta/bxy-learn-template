class WrapFunctionCallJava extends WrapFunctionCall {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.returnFunctionType = '';
    this.returnType = null;
  }
  
  modal() {
    const funcRepo = this.c.tabs[1].api.program['1'].blocks.map(block => { return { id: block.id, code: block.code } }).filter(block => block.code !== '');
    const template = !funcRepo.length ? this.noFunctionTemplate() : this.genericTemplate(this.templateContent('function', funcRepo));
    const div = document.createElement('div');
    div.setAttribute('class', 'overlay');
    div.innerHTML = template;
    document.querySelector('body').appendChild(div);
    this.c.updateCanvas();
    this.addListenersByTemplate(funcRepo, div);
  }

  noFunctionTemplate() {
    return (
      `<div class="wizard-box-edit-dialog">
         <h4>Function</h4>
         <p>No functions defined yet</p>
         <div id="defineNewBtnManual" style="display:flex;justify-content:center;align-items:center;margin:10px; font-size:1.4em;">
           <span style="padding:5px;border:2px solid #237874;border-radius:20px;color:#237874;font-weight:bold;cursor:pointer;">Declare New Function</span>
         </div>
         <button id="btnCallDecAccept">accept</button> 
       </div>` );
  }
  
  templateContent(title, funcRepo) {
    const stateVariables = [...this.getAllVariableScope()]
                             .map(variable => variable[1])
                             .filter(variable => variable.isInFlow);
    const { blockColor, fontColor, lineColor } = configEditor.flow.customizedBlocks.wrapBlock;
    this.lineColor = !this.lineColor ? lineColor : this.lineColor;
    this.bgColor = !this.bgColor ? blockColor : this.bgColor;
    this.fontColor = !this.fontColor ? fontColor : this.fontColor;
    return {
      title,
      help:
        `<p>Wrap help</p> `,
      styles: `height: 280px; top: -108px; width: max-content; padding: 15px 10px; text-align:left;`,
      content:
       `<div style="font-size:1.4em; margin-top: 10px;">Variables</div>
         <select id="variables" name="variables" multiple size='5' style="font-size: 1.4em; overflow: auto; padding:8px; width: 100%;">
          ${!stateVariables.length ?
            `<option disabled selected>No variables defined yet</option>` :
            `${stateVariables.map(variable => (
              `<option value='${variable.name}' title="${variable.declaration} ${variable.name} ${variable.declarationType} | ${variable.scope}">${variable.declaration} ${variable.name} ${variable.declarationType} | ${variable.scope}</option>`
            )).join('')}`
          }
        </select> 
        <div style="margin-top:10px; font-size:1.4em;">Defined Functions</div> 
        <select id="repository" name="repository" multiple size='5' style="font-size: 1.4em; overflow: auto; padding:8px; width: 100%;">
          ${!funcRepo.length ?
            `<option disabled selected>No functions defined yet</option>` :
            `${funcRepo.map(f => (
              `<option value='${f.id}' title="${f.code}">${f.code}</option>`
            )).join('')}`
          }
         </select>  
         <div id="defineNewBtnManual" style="display:flex;justify-content:right;align-items:center;margin:5px; font-size:1.4em;">
           <span style="padding:5px;border:2px solid #237874;border-radius:20px;color:#237874;font-weight:bold;cursor:pointer;">Declare New</span>
         </div>
         <div style="font-size:1.4em; margin-top:5px;">Name</div>
         <input type="text" id="funcCode" name="funcCode" value='${this.code.replace(/'/g, "&apos;")}' required placeholder='call function'  style="width: 95%; padding:8px;" required >
         <p id="nameError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>function code is required</p>
         <div style="font-size:1.4em; margin-top:5px;">Colors</div>
         <div style="display: flex; justify-content: space-evenly; align-items: center;">
             <p>Background </p>
             <input type="color" id="backgroundColor" name="backgroundColor" value="${this.bgColor}"/>
             <p>Line </p>
             <input type="color" id="lineColor" name="lineColor" value="${this.lineColor}"/>
             <p>Font </p>
             <input type="color" id="fontColor" name="fontColor" value="${this.fontColor}"/>
         </div>
         <input type="text" id="tabId" name="tabId" value='${this.tabId}' hidden>`
    }
  }

  getWrapFormValues() {
    const form = document.forms.namedItem("blockForm");
    const formData = new FormData(form);
    const funcCode = formData.get('funcCode');
    if (Utils.isEmpty(funcCode)) {
      const nameError = document.querySelector('#nameError');
      nameError.classList.remove('hide');
      return null;
    }
    const bgColor = formData.get('backgroundColor');
    const lineColor = formData.get('lineColor');
    const fontColor = formData.get('fontColor');
    const tabId = formData.get('tabId');
    return { funcCode, bgColor, lineColor, fontColor, tabId };
  }

  addListenersByTemplate(funcRepo, div) {
    if(!funcRepo.length) {
      document.querySelector('#btnCallDecAccept')
        .addEventListener('click', e => div.remove());
      this.commonListeners();
    } else {
        this.addListeners();
        this.handlerModalButtons(div);
        this.renderWizardBuilder(div);
        this.okBuilderBtn.addEventListener('click', this.handlerWizardOk.bind(this,div));  
    }  
  }
  
  addListeners() {
    this.comboRepo = document.querySelector('#repository');
    this.comboRepo.addEventListener('click', this.handlerSelection.bind(this));
    this.commonListeners();
  }
  
  commonListeners() {
    this.declareBtn = document.querySelector('#defineNewBtnManual');
    const message = ` <p>Do you want to declare a new function?.</p> 
           <p>Define new function form will open.</p>`;
    this.declareBtn.addEventListener('click', this.handleDeclareNew.bind(this, 'Manual', message));
  }

  handlerSelection(ev) {
    for (let i = 0; i < this.comboRepo.length; i++) {
      if (this.comboRepo.options[i].selected) {
        const id = this.comboRepo.options[i].value;
        const idx = this.c.tabs[1].api.program['1'].blocks.findIndex(block => block.id == id);
        const name = this.c.tabs[1].api.program['1'].blocks[idx].vars.functionName;
        const params = this.c.tabs[1].api.program['1'].blocks[idx].vars.params.map(param => param.name).join(', ');
        document.querySelector('#tabId').value = this.c.tabs[1].api.program['1'].blocks[idx].vars.tabId;
        document.querySelector('#funcCode').value = `${name}(${params})`;
      }
    }
  }
  
  handlerModalButtons(div) {
    document.querySelector('#ok-modal')
      .addEventListener('click', e => {
        e.preventDefault();
        const formValues = this.getWrapFormValues();
        if (!formValues) return;
        const { funcCode, bgColor, lineColor, fontColor, tabId } = formValues;
        this.code = funcCode;
        this.bgColor = bgColor;
        this.lineColor = lineColor;
        this.fontColor = fontColor;
        this.tabId = tabId;
        this.cleanAndUpdateBlockForm(div);
      });
    document.querySelector('#cancel-modal')
      .addEventListener('click', e => {
        this.cleanAndUpdateBlockForm(div);
      });
  }
  
  handlerWizardOk(div,ev) {
    ev.preventDefault();
    const { error, message, droppedElements } = this.validateWizardExpression(); 
    if(error) {
      this.wizardForm.dnd.expressionContainerBorder('error');
      this.wizardForm.dnd.displayExpressionError('builderExpressionError', message);
      return;
    }
    this.wizardForm.dnd.evalEqualStringExpression(); 
    const hiddenUpdateValue = this.wizardForm.dnd.getWizardExpression();
    this.code = hiddenUpdateValue;
    this.wizardCode = hiddenUpdateValue;
    this.droppedElements = droppedElements;
    this.tabId = this.getTabIdFromDroppedElements(droppedElements);
    this.cleanAndUpdateBlockForm(div);   
  }
  
  validateWizardExpression() {
    const hiddenValue = this.wizardForm.dnd.getWizardExpression();
    const hasError = this.wizardForm.dnd.hasError;
    if(Utils.isEmpty(hiddenValue) || hasError){
      const message = Utils.isEmpty(hiddenValue) ? 'The expression is empty' : 'Syntax error: expression contains errors';
      return { error: true, droppedElements: [], message };
    }
    const droppedElements = this.wizardForm.dnd.getDroppedElements();
    if(!droppedElements.some(val => val.name === 'function')) 
      return { error: true, droppedElements: [], message: 'Expression not contains any function' };
    return { error: false, droppedElements, message: '' };
  }
  
  getTabIdFromDroppedElements(droppedElements) {
    for(const item of droppedElements) {
      if(item.name !== 'function') continue;
      return item.extraProps.vars.tabId;
    }
  }
}