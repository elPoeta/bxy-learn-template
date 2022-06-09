class WrapJavaBlockWizardForm {
  constructor(canvas, values, formType, wrappedBlocks, index, selectedBlocks) {
    this.index = index;
    this.canvas = canvas;
    this.formType = formType;
    this.selectedBlocks = selectedBlocks;
    this.wrappedBlocks = wrappedBlocks;
    this.values = values;
    this.functionTypes = ['Normal', 'Array', 'MultiDimensional Array'];
    this.functionReturnTypes = ['void', 'String', 'char', 'byte', 'short', 'int', 'long', 'float', 'double', 'boolean'];
    this.reservedWords = ['scanner', 'Class', 'new', 'String', 'char', 'byte', 'short', 'int', 'long', 'float', 'double', 'boolean', 'void'];
    this.preDefinedParams = ['Scanner'];
    this.body = document.querySelector('body');
    this.setFunctionProps();
  }
  
  setFunctionProps() {
    this.functionName = this.values ? this.values.functionName : '';
    this.returnFunctionType = this.values ? this.values.returnFunctionType : 'void';
    this.returnType =  this.values ?  this.values.returnType : 'Normal';
    this.params = this.values ?  this.values.params : [];
    this.lineColor = this.values ? this.values.lineColor : configEditor.flow.customizedBlocks.wrapBlock.lineColor;
    this.bgColor = this.values ? this.values.bgColor : configEditor.flow.customizedBlocks.wrapBlock.blockColor;
    this.fontColor = this.values ? this.values.fontColor : configEditor.flow.customizedBlocks.wrapBlock.fontColor;
  }
  
  showModal(title) {
    this.title = title || 'Function form';
    this.overlay = document.createElement('div');
    this.overlay.setAttribute('class', 'overlay');
    this.overlay.innerHTML = this.template();
    this.body.appendChild(this.overlay);
    this.addListeners();
    this.createDndInstance();
    this.buildAndShowExpression();
    this.setActiveTab('Define');
  }
  
  template() {
    return (
      `<span class="closeOverlay" id="closeFlowSettings">×</span>
       <section class="wizardWrapFunc-container custom-gray-scroll">
         ${this.fullContentTemplate()} 
         ${this.buttonsTemplate()}    
       </section>`);
  }
  
  fullContentTemplate() {
    return (
      `${this.titleTemplate()} 
       ${this.contentMenuTemplate()}  
       ${this.contentTabTemplate()}   
      `);
  }
  
  titleTemplate() {
    return (
      `<section class="wizardWrapFunc-title">
         <h3>${this.title}</h3>
         <h3 id="functionBuilt" style="width:399px;color:#0c66a0;padding: 0.3em;"></h3>
         <p id="functionExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;width:399px;'></p>
       </section>   
      `);  
  }
  
  contentMenuTemplate() {
    return (
      `<section class="wizardWrapFunc-menu">
         ${['Define', 'Params', 'Customize'].map(item =>(
           `<div id='tab${item}' class="wizardWrapFunc-tab" data-tab="${item}">
              <span>${item}</span>
            </div>`
          )).join('')}
       </section> `);
  }
  
  contentTabTemplate() {
   return (
     `<section class="wizardWrapFunc-content">
        <section id="contentDefine" class="wizardWrapFunc-content-tab" data-tab="Define">
           ${this.defineContentTemplate()}
         </section>
         <section id="contentParams" class="wizardWrapFunc-content-tab" data-tab="Params">
           ${this.paramsContentTemplate()}
         </section>
         <section id="contentCustomize" class="wizardWrapFunc-content-tab" data-tab="Customize">
           ${this.customizeContentTemplate()}
         </section>
      </section> 
     `);
  }
  
  defineContentTemplate() { 
    return (
      `<div>
         <section id="nameContainer" class="defineWizardContainer">
           <h4>Name</h4>
           <div id="nameDropZone" class="varItemsDropZone wizard-wrapfunc-w" data-zone="nameDropZone" data-content="Drop name here" style="margin: 12px 6px;">${this.getFunctionName()}</div>
         </section>
         <section id="returnContainer" class="defineWizardContainer">
           <h4>Return</h4>
           <div id="returnDropZone" class="varItemsDropZone wizard-wrapfunc-w" data-zone="returnDropZone" data-content="Drop return type here" style="margin: 12px 6px;">${this.getReturnFuncType()}</div>
         </section>
         <section id="typeContainer" class="defineWizardContainer ${this.returnFunctionType === 'void' ? 'hide' : ''}">
           <h4>Type</h4>
           <div id="typeDropZone" class="varItemsDropZone wizard-wrapfunc-w" data-zone="typeDropZone" data-content="Drop type here" style="margin: 12px 6px;">${this.getType()}</div>
         </section>
         <section class="defineVarDragContainer custom-gray-scroll">
           <h4>Name</h4>
           <div class="defineItemsContainer">
             <div class="draggable defineItems" style="background-color:#B2EBF2;" draggable="true" data-info='${JSON.stringify({ type:"nameDropZone", val: "text"})}'>Name</div>
           </div>
           <h4>Declaration</h4>
           <div class="defineItemsContainer">
             ${this.returnTemplate()}
           </div>
           <h4>Type</h4>
           <div class="defineItemsContainer">
             ${this.typesTemplate()}
           </div>
         </section>
      </div>
      `);
  }
  
  
  returnTemplate() {
    return this.functionReturnTypes.map(declaration => (
          `<div class="draggable defineItems" style="background-color:#C8E6C9;" draggable="true" data-info='${JSON.stringify({ type:"returnDropZone", val: declaration})}'>${declaration}</div>`
        )).join(''); 
  }
  
  typesTemplate() {
    return this.functionTypes.map(type => (
         `<div class="draggable defineItems" style="background-color:#FFCC80;"  draggable="true" data-info='${JSON.stringify({ type:"typeDropZone", val: type})}'>${type}</div>`
       )).join('');    
  }
  
  getFunctionName() {
    return !Utils.isEmpty(this.functionName) ? `<h5 data-define='${JSON.stringify({ val: this.functionName , id:"nameDropZone" })}'>${this.functionName}</h5>` : '';    
  }
  
  getReturnFuncType() {
    return !Utils.isEmpty(this.returnFunctionType) ? `<h5 data-define='${JSON.stringify({ val: this.returnFunctionType , id:"returnDropZone" })}'>${this.returnFunctionType}</h5>` : '';    
  }
  
  getType() {
    return !Utils.isEmpty(this.returnType) ? `<h5 data-define='${JSON.stringify({ val: this.returnType, id:"typeDropZone" })}'>${this.returnType}</h5>` : '';    
  }
  
  paramsContentTemplate() {
    return (
      `<div>
         <section class="dropZone-container">
           <div id="dropZone" class="dropZone" data-content="Drop here...">${this.fillParamZoneTemplate()}</div>
         </section>
         <section  style="border: 2px solid #3050f3;margin: 5px;padding: 10px;border-radius: 5px;">
            <h4>Param</h4>
           <div style="display:flex;align-items:center;justify-content:space-around;">
             <div class="draggable paramDragItem" data-param='${JSON.stringify({name: "new", declarationType: "", type: ""})}' style="cursor:pointer;background-color:#ffeb3b;" draggable="true" >
               <input type="text" value="New param" style="width:120px;text-align: left;cursor:pointer;" class="wizard-box-value" disabled />
             </div>
             <div class="draggable paramDragItem"  data-param='${JSON.stringify({name: "scanner", declarationType: "java.util.Scanner", type: "Class"})}' style="cursor:pointer;background-color:#B0BEC5;" draggable="true" >
               <input type="text" value="Scanner param" style="width:120px;text-align: left;cursor:pointer;" class="wizard-box-value"  disabled />
             </div>
           </div>
         </section>
      </div>
      `);
  }
  
  fillParamZoneTemplate() {
    return (
      `${this.params.map(param => this.getParamItemTemplate(param)).join('')}`);
  }
  
  getParamItemTemplate(param) {
   param.inDropZone = true;  
   const expression = this.getParameterString(param.name, param.declarationType, param.declaration);
   const color = this.getAllColors()[param.declarationType];
   return (
     `<div class="draggable paramDragItem cloned" data-param='${JSON.stringify(param)}' style="cursor:pointer;background-color:${color};" draggable="true" >
        <input type="text" value='${expression}' style="width:100%;text-align: left;cursor:pointer;" class="wizard-box-value" disabled />
        ${param.declarationType !== 'java.util.Scanner' ?
         `<svg  viewBox="0 0 20 20" class="icon-svg h-5 w-5" style="fill:#000; justify-self: center; cursor: pointer; font-size: 1.7em;">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
          </svg>` : '' 
        }
      </div>
     `); 
  }
  
  customizeContentTemplate() {
    const bgColor = this.bgColor ? this.bgColor : configEditor.flow.customizedBlocks.wrapBlock.blockColor;
    const lineColor = this.lineColor ? this.lineColor : configEditor.flow.customizedBlocks.wrapBlock.lineColor;
    const fontColor = this.fontColor ? this.fontColor : configEditor.flow.customizedBlocks.wrapBlock.fontColor;
    return (
      `<div>
         <h3 style="font-size:1.4em; margin-top:5px;">Colors</h3>
         <div style="display: flex; justify-content: space-evenly; align-items: center;">
           <p>Background </p>
           <input type="color" id="backgroundColor" name="backgroundColor" value="${bgColor}"/>
           <p>Line </p>
           <input type="color" id="lineColor" name="lineColor" value="${lineColor}"/>
           <p>Font </p>
           <input type="color" id="fontColor" name="fontColor" value="${fontColor}"/>
         </div>
         <div style="margin: 10px; font-size: 1.3em; display: flex; align-items: center;">create and open &nbsp;<input type="checkbox" id="isOpen" name="isOpen" checked /></div>
      </div> 
      `);
  }
  
  buttonsTemplate() {
    return (
      `<section style="display:flex;justify-content:flex-end;">
         <button id="cancelBtn" style="background: red;color: #fff;padding: 10px;border-radius: 10px;margin-top:10px;margin-right:5px;border: none;font-weight: bold;width: 65px;text-align: center;cursor:pointer;">Cancel</button>
         <button id="acceptBtn" style="background:green; color:#fff;padding: 10px;border-radius: 10px;margin-top:10px;margin-left:5px;border: none; font-weight: bold; width: 65px; text-align:center;cursor:pointer;">Accept</button>
      </section>
      `);
  }
  
  handleFormTabs(ev) {
    const target = ev.target.tagName.toLowerCase() === 'div' ? ev.target : ev.target.parentElement;
    this.setActiveTab(target.dataset.tab);  
  }
  
  setActiveTab(dataTab) {
    document.querySelectorAll(`[data-tab]`)
      .forEach(element => {
        if(element.dataset.tab === dataTab) {
          element.classList.add('wizardWrapFunc-tab-active');
          if(element.id.startsWith('content') && element.id === `content${dataTab}`) {
            element.classList.remove('hide');
          }
        } else {
          element.classList.remove('wizardWrapFunc-tab-active');
          if(element.id.startsWith('content') && element.id !== `content${dataTab}`) {
            element.classList.add('hide');
          }
        }
      });
  }
  
  handleAccept(ev) {
    const { name, returnFunctionType, returnType } = this.getDefineValues();
    const { parameters } = this.getParamValues();
    const { bgColor, lineColor, fontColor, isOpen } = this.getCustomizeValues();
    const { error, message } = this.validateFunction(name, returnFunctionType, returnType, parameters)
    if(error) {
      this.displayExpressionError('functionExpressionError', message);
      return;
    }
    const tabId = !this.values ? Date.now().toString() : this.values.tabId;  
    this.updateFunctionProps({ tabId, name, returnFunctionType, returnType, parameters, bgColor, lineColor, fontColor, isOpen });
    this.managerFunctionTab({ tabId, name, returnFunctionType, returnType, parameters, bgColor, lineColor, fontColor, isOpen });
    this.handleCloseOverlay();
  }

  updateFunctionProps(props) {
    if(this.formType === 'wrap_select') return;
    const { tabId, name, returnFunctionType, returnType, parameters, bgColor, lineColor, fontColor, isOpen } = props;
    const paramsString = parameters.map(param => this.getParameterString(param.name, param.declarationType, param.declaration)).join(', ');
    const code = `${returnFunctionType} ${this.getReturnType(returnType)}${name}(${paramsString})`;
    this.canvas.program[this.index].code = code;
    this.canvas.program[this.index].wizardCode = code;
    this.canvas.program[this.index].functionName = name;
    this.canvas.program[this.index].returnFunctionType = returnFunctionType;
    this.canvas.program[this.index].returnType = returnType;
    this.canvas.program[this.index].params = parameters;
    this.canvas.program[this.index].lineColor = lineColor;
    this.canvas.program[this.index].bgColor = bgColor;
    this.canvas.program[this.index].fontColor = fontColor;
    this.canvas.program[this.index].tabId = tabId;
    this.canvas.update();
  }
  
  managerFunctionTab(props) {
    switch(this.formType) {
      case 'new_empty':
        this.createNewEmptyFunction(props);      
        break;
      case 'edit':   
        this.editFunction(props);
        break;
      case 'wrap_block':
        this.wrapBlockFunction(props);
        break;
      case 'wrap_select':
        this.wrapSelectedBlock(props);
        break;  
      default:
        this.canvas.update();
    }
  }
  
  createNewEmptyFunction(props) {
    const { name, isOpen, tabId } = props; 
    this.updateFunctionRepository(props); 
    this.canvas.loadTabByIndex(1);  
    this.canvas.createTab(tabId, name, 'f_body', '[]', isOpen);  
  }

  editFunction(props) {
    this.editedFunctionRepository(props);
    if (props.isOpen) {
      const tabIndex = this.canvas.tabs.findIndex(tab => tab.id === props.tabId);
      if(tabIndex > -1) {
        this.canvas.tabs[tabIndex].isOpened = true;
        this.canvas.tabs[this.canvas.selectedTab].selected = false;
        this.canvas.selectTab(tabIndex, true);        
      } else {
        this.canvas.loadTab();      
      }
    } else {
        this.canvas.loadTab();      
    }
  }
  
  wrapBlockFunction(formValues) {
    this.updateFunctionRepository(formValues); 
    const state = this.canvas.blockState.get(this.canvas.program[this.index].id);
    this.removeWrapBlocks();
    this.createFunctionWithBlocks({ state, formValues });  
  }
  
  wrapSelectedBlock(formValues) {
    this.updateFunctionRepository(formValues); 
    const state = this.canvas.blockState.get(this.selectedBlocks[0].id);
    this.removeWrapSelectedBlocks();
    this.createFunctionWithBlocks({ state, formValues });  
  }
  
  updateFunctionRepository(formValues) {
    const { tabId, name, returnFunctionType, returnType, parameters, bgColor, lineColor, fontColor } = formValues;
    const repoApiTab = this.canvas.tabs[1].api.program['1'].blocks;
    const id = this.formType === 'new_empty' ? this.canvas.program[this.index].id : flowChartEditor.uuid();
    const prev = this.formType === 'new_empty' ? this.canvas.blockState.get(this.canvas.program[this.index].id).lastHook : "start-id";
    const newFunction = this.getNewFunction({ id, tabId, prev, name, returnFunctionType, returnType, parameters, bgColor, lineColor, fontColor } );
    const idx = this.canvas.tabs[1].api.program['1'].blocks.findIndex(block => block.id === id);
    if(idx > 0) {
      this.canvas.tabs[1].api.program['1'].blocks[idx] = newFunction;          
    } else {
        this.canvas.tabs[1].api.program['1'].blocks.push(newFunction); 
     }
  }
  
  editedFunctionRepository(formValues) {
    const { tabId, name, returnFunctionType, returnType, parameters, bgColor, lineColor, fontColor } = formValues;
    const id = this.canvas.program[this.index].id;
    const idxTab = this.canvas.tabs[1].api.program['1'].blocks.findIndex(block => block.id === id);
    const editedFunction = this.getEditedFunction({ id, tabId, name, returnFunctionType, returnType, parameters, bgColor, lineColor, fontColor });  
    this.canvas.tabs[1].api.program['1'].blocks[idxTab] = { ...this.canvas.tabs[1].api.program['1'].blocks[idxTab], ...editedFunction };
    const indexTabBody = this.canvas.tabs.findIndex(tab => tab.id === tabId);
    if (this.canvas.tabs[indexTabBody].name !== name) {
      this.canvas.tabs[indexTabBody].name = name;
      if (this.canvas.tabs[indexTabBody].isOpened) {
        document.getElementById(`${tabId}`).title = name;
        document.querySelector(`#tabName-${tabId}`).innerText = name;
      }
    }
  }
 
  removeWrapBlocks() {
    this.canvas.eventHandler.removeBlockFromGraph(this.canvas.program[this.index], this.index);
    this.canvas.eventHandler.moveBlocksBeforeDraw();
  }
  
  removeWrapSelectedBlocks() {
    this.selectedBlocks.forEach(block => {
      const index = this.canvas.program.findIndex(b => b.id === block.id)
      if (index > 1) {
        this.canvas.eventHandler.removeBlockFromGraph(this.canvas.program[index], index);
        this.canvas.eventHandler.moveBlocksBeforeDraw();
      }
    });
  }
  
  createFunctionWithBlocks({ state, formValues }) {
    const { tabId, name, returnFunctionType, returnType, parameters, bgColor, lineColor, fontColor, isOpen } = formValues;
    const { w, h } = flowChartEditor.API.getWidthAndHeigthBlock("wrapBlock");
    flowChartEditor.API.createNewProgram(flowChartEditor.uuid(), 'wrapBlock', 0, 0, w, h, "", 'function_calling');
    const indexHook = this.canvas.program.findIndex(block => block.id === state.lastHook);
    const indexRing = this.canvas.program.length - 1;
    const hookArrowIndex = flowChartEditor.API.getIndexHook(this.canvas.program[indexHook].type, state.arrowHook);
    this.canvas.program[indexRing].x = this.canvas.eventHandler.setXOnDrop(this.canvas.program[indexRing], this.canvas.program[indexHook], state.arrowHook);
    this.canvas.program[indexRing].y = this.canvas.program[indexHook].hooks[hookArrowIndex].y;
    this.canvas.program[indexRing].setColors({ bgColor, lineColor, fontColor });
    this.canvas.program[indexRing].code = `${name}(${parameters.map(param => param.name).join(', ')})`;
    this.canvas.program[indexRing].tabId = tabId;
    this.canvas.program[indexRing].returnFunctionType = returnFunctionType;
    this.canvas.program[indexRing].returnType = returnType;
    this.canvas.program[indexRing].params = parameters;
    this.canvas.program[indexRing].functionName = name;
    this.canvas.interceptedProgram = { programRing: this.canvas.program[indexRing], programHook: this.canvas.program[indexHook], arrowType: state.arrowHook };
    this.canvas.eventHandler.dropInterceptedProgram();
    this.canvas.updateCanvas();
    this.canvas.createTab(tabId, name, 'f_body', this.wrappedBlocks, isOpen);
  }
  
  getNewFunction({ id, tabId, prev, name, returnFunctionType, returnType, parameters, bgColor, lineColor, fontColor } ) {
    const paramsString = parameters.map(param => this.getParameterString(param.name, param.declarationType, param.declaration)).join(', ');
    const code = `${returnFunctionType} ${this.getReturnType(returnType)}${name}(${paramsString})`;
    return {
      id,
      type: "wrap",
      hook: "out",
      prev,
      code,
      vars: {
        wrapType: "function_declaration",
        tabId,
        bgColor,
        lineColor,
        fontColor,
        functionName: name,
        returnFunctionType,
        returnType,
        params: parameters
      }
    }  
  }
  
  getEditedFunction({ id, tabId, name, returnFunctionType, returnType, parameters, bgColor, lineColor, fontColor }) {
    const paramsString = parameters.map(param => this.getParameterString(param.name, param.declarationType, param.declaration)).join(', ');
    const code = `${returnFunctionType} ${this.getReturnType(returnType)}${name}(${paramsString})`;
    return {
      code,
      vars: {
        wrapType: "function_declaration",
        tabId,
        bgColor,
        lineColor,
        fontColor,
        functionName: name,
        returnFunctionType,
        returnType,
        params: parameters
      }
    }
  }
  
  getDefineValues() {
    const varItemsDropZone = Array.from(document.querySelectorAll('.varItemsDropZone'));
    const obj = { name: '', returnFunctionType: '', returnType: 'Normal' };
    for(const item of varItemsDropZone) {
      if(!item.firstElementChild) return {...obj};
      const { val, id } = JSON.parse(item.firstElementChild.dataset.define);
      switch(id) {
        case 'returnDropZone':
          obj.returnFunctionType = val;
         break;
        case 'typeDropZone':
          obj.returnType = val;
          break;
        default:
          obj.name = val;
      }
    }
    return {...obj };
  }
  
  getParamValues() {
    const parameters = [];
    const dropZone = document.querySelector('#dropZone');
    const children = Array.from(dropZone.children);
    for (const child of children) {
      const dataParam = JSON.parse(child.dataset.param);
      dataParam.inDropZone = undefined;
      dataParam.expression = undefined;
      parameters.push(dataParam);
    }
    return { parameters}
  }
  
  getCustomizeValues() {
    const bgColor = document.querySelector('#backgroundColor').value;
    const lineColor = document.querySelector('#lineColor').value;
    const fontColor = document.querySelector('#fontColor').value;
    const isOpen = document.querySelector('#isOpen') ? document.querySelector('#isOpen').checked : false;
    return { bgColor, lineColor, fontColor, isOpen }
  }
  
  addListeners() {
    this.closeFlowSettings = document.querySelector('#closeFlowSettings');
    this.cancelBtn = document.querySelector('#cancelBtn');
    this.acceptBtn = document.querySelector('#acceptBtn');
    this.functionBuilt = document.querySelector('#functionBuilt'); 
    this.formTabs = document.querySelectorAll('.wizardWrapFunc-tab');
    this.formTabs
      .forEach(element => element.addEventListener('click', this.handleFormTabs.bind(this)));
    this.cancelBtn.addEventListener('click', this.handleCloseOverlay.bind(this));
    this.acceptBtn.addEventListener('click', this.handleAccept.bind(this));
    this.closeFlowSettings.addEventListener('click', this.handleCloseOverlay.bind(this));
  }
  
  createDndInstance() {
    this.dndFunctionDefine = new DragAndDropFunctionDefine(this);
    this.dndFunctionParam = new DragAndDropFunctionParam(this);
  }
  
  inDropZone(box, target, dropZone) {
    if (this.validDropZone(box, target)) {
      dropZone.classList.add('dropZone-over');
      const { top } = this.getCoords(target);
      this.scrollTo(top, dropZone);
    } else {
      dropZone.classList.remove('dropZone-over');
    }
  }
  
  validDropZone(box, target) {
    const { top, left } = this.getCoords(target);
    return (left > box.left && left < box.right) && (top > box.top && top < box.bottom);
  }
  
  getCoords(elem) {
    const box = elem.getBoundingClientRect();
    return {
      top: box.top + window.pageYOffset,
      right: box.right + window.pageXOffset,
      bottom: box.bottom + window.pageYOffset,
      left: box.left + window.pageXOffset
    };
  }
  
  scrollTo(y, dropZone) {
    dropZone.style = 'scroll-behavior: smooth;';
    if (y > dropZone.clientHeight - 20)
      dropZone.scrollBy(0, 20);
    if(y < dropZone.clientHeight + 20)
      dropZone.scrollBy(0, -20);
  }
  
  validateFunction(name, returnFunctionType, returnType, parameters) {
    if(Utils.isEmpty(name) || Utils.isEmpty(returnFunctionType) || Utils.isEmpty(returnType)) 
      return { error: true, message: `some define input is empty` };
    const currentId = this.index !== -1 ? this.canvas.program[this.index].id : this.index;
    const blocks = this.canvas.tabs[1].api.program['1'].blocks;
    for (let i = 0; i < blocks.length; i++) {
      const { functionName, params } = blocks[i].vars;
      if (blocks[i].id !== currentId) {
        if (functionName === name) {
          if (parameters.length === params.length) {
            let count = 0;
            for (let j = 0; j < params.length; j++) {
              if ((params[j].declarationType === parameters[j].declarationType) &&
                (params[j].type === parameters[j].type)) {
                count++;
              }
            }
            if (count !== 0 && count === params.length) {
              const paramsString = params.map(param => this.getParameterString(param.name, param.declarationType, param.declaration)).join(', ');
              return { error: true, message: `method ${returnFunctionType} ${this.getReturnType(returnType)}${name}(${paramsString}) is already defined` };
            }
          }
        }
      }
    }
    return { error: false, message: '' };
  }
  
  getParameterString(parameterName, parameterDeclarationType, parameterType) {
    switch (parameterType) {
      case 'MultiDimensional Array':
        return `${parameterDeclarationType} [][] ${parameterName}`;
      case 'Array':
        return `${parameterDeclarationType} [] ${parameterName}`;
      default:
        return `${parameterDeclarationType} ${parameterName}`;
    }
  }
  
  getReturnType(type = '') {
    switch (type) {
      case 'MultiDimensional Array':
        return '[][] ';
      case 'Array':
        return '[] ';
      default:
        return '';
    }
  }
  
  displayExpressionError(selector, txt) {
    const builderExpressionError = document.querySelector(`#${selector}`);
    builderExpressionError.innerText = txt;
    builderExpressionError.classList.remove('hide');
    setTimeout(() => {
      builderExpressionError.classList.add('hide');
    },2500);
  }
  
  buildAndShowExpression() {
    const { name, returnFunctionType, returnType } = this.getDefineValues();
    const { parameters } = this.getParamValues();
    const paramsString = parameters.map(param => this.getParameterString(param.name, param.declarationType, param.declaration)).join(', ');
    const code = `${returnFunctionType} ${this.getReturnType(returnType)}${name}(${paramsString})`;
    this.functionBuilt.innerHTML = code; 
  }
  
  getAllColors() {
    return {
      'String': '#90CAF9',
      'char': '#80DEEA', 
      'byte': '#F48FB1', 
      'short': '#B39DDB', 
      'int': '#A5D6A7', 
      'long': '#FFCC80', 
      'float': '#EF9A9A', 
      'double': '#FFE082', 
      'boolean': '#BCAAA4',
      'java.util.Scanner': '#B0BEC5'
    }
  }
  
  handleCloseOverlay(ev) {
    this.removeListeners();
    this.overlay.remove();
  }
  
  removeListeners() {
    this.dndFunctionDefine.listenersManager('removeEventListener');
    this.dndFunctionParam.listenersManager('removeEventListener');
    this.formTabs
      .forEach(element => element.removeEventListener('click', this.handleFormTabs.bind(this)));
    this.acceptBtn.removeEventListener('click', this.handleAccept.bind(this));
    this.cancelBtn.removeEventListener('click', this.handleCloseOverlay.bind(this));
    this.closeFlowSettings.removeEventListener('click', this.handleCloseOverlay.bind(this));
  }
}