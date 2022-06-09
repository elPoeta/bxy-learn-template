class WizardFunctionParamForm {
  constructor(element, form) {
    this.parentForm  = form;
    this.element = element.classList.contains('draggable')  ? element : element.parentElement;
    this.declarations = ['String', 'char', 'byte', 'short', 'int', 'long', 'float', 'double', 'boolean'];
    this.variableTypes = ['Normal', 'Array', 'MultiDimensional Array'];
    this.dragSourceItem = null;
    this.sourceInfoItem = null;
    this.formIds = ['declarationParamDropZone', 'typeParamDropZone', 'nameParamDropZone']; 
    this.colors = form.getAllColors();
  }
  
  show() {
    this.overlayParamEdition = document.createElement('div');
    this.overlayParamEdition.classList.add('overlay');
    this.overlayParamEdition.id = 'overlayParamEdition';
    this.overlayParamEdition.style = Utils.hasCssBackdrop() ? 
      `background: rgba(255, 255, 255, 0.05);backdrop-filter: blur(5px);-webkit-backdrop-filter: blur(5px);` : `background: #263d5a73;`; 
    this.overlayParamEdition.innerHTML = this.template();
    document.querySelector('body').appendChild(this.overlayParamEdition);
    this.addListeners();
    return this;
  }
  
  addListeners() {
    this.btn = document.querySelector('#newParamBtn');  
    this.dropZones = document.querySelectorAll('.paramItemsDropZone');
    this.draggableItems = document.querySelectorAll('.paramDefineItems');
    this.nameParamDropZoneToClick = document.querySelector('#nameParamDropZone');
    this.listenersManager('addEventListener');
  }
  
  template() {
    const dataValues = this.element.dataset.param;
    const values = JSON.parse(dataValues);
    const { name, declarationType, declaration } = values;
    return (
      `<div class="wizard-box-edit-dialog" style="grid-template-rows: 30px auto;">
         <h4>Define parameter</h4>
         <section id="declarationParamContainer" class="defineWizardContainer">
           <h4>Declaration</h4>
           <div id="declarationParamDropZone" class="paramItemsDropZone" data-zone="declarationParamDropZone" data-content="Drop declaration here">${this.getDeclaration(declarationType)}</div>
         </section>
         <section id="typeParamContainer" class="defineWizardContainer">
           <h4>Type</h4>
           <div id="typeParamDropZone" class="paramItemsDropZone" data-zone="typeParamDropZone" data-content="Drop type here">${this.getDeclarationType(declaration, declarationType)}</div>
         </section>
         <section id="nameParamContainer" class="defineWizardContainer">
           <h4>Name</h4>
           <div id="nameParamDropZone" class="paramItemsDropZone" data-zone="nameParamDropZone" data-content="Drop name here">${this.getParamName(name, declarationType)}</div>
         </section>
         <section class="defineVarDragContainer custom-gray-scroll">
           <h4>Declaration</h4>
           <div class="defineItemsContainer">
             ${this.declarationTemplate()}
           </div>
           <h4>Type</h4>
           <div class="defineItemsContainer">
             ${this.typesTemplate()}
           </div>
            <h4>Values</h4>
           <div class="defineItemsContainer">
             <div class="draggable paramDefineItems" style="background-color:#B2EBF2;" draggable="true" data-infoparam='${JSON.stringify({ type:"nameParamDropZone", val: "text"})}'>Name</div>
           </div>
         </section>
         <p id="paramsExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
         <button id="newParamBtn">update</button> 
       </div>
       `);
   }
  
  declarationTemplate() {
    return this.declarations.map(declaration => (
          `<div class="draggable paramDefineItems" style="background-color:#C8E6C9;" draggable="true" data-infoparam='${JSON.stringify({ type:"declarationParamDropZone", val: declaration})}'>${declaration}</div>`
        )).join(''); 
  }
  
  typesTemplate() {
    return this.variableTypes.map(type => (
         `<div class="draggable paramDefineItems" style="background-color:#FFCC80;"  draggable="true" data-infoparam='${JSON.stringify({ type:"typeParamDropZone", val: type})}'>${type}</div>`
       )).join('');    
  }

  getDeclaration(declaration) {
    return !Utils.isEmpty(declaration) ? `<h5 data-paramdef='${JSON.stringify({ val: declaration , id:"declarationParamDropZone" })}'>${declaration}</h5>` : '';    
  }
  
  getDeclarationType(declarationType, emptyValue) {
    return !Utils.isEmpty(emptyValue) ? `<h5 data-paramdef='${JSON.stringify({ val: declarationType, id:"typeParamDropZone" })}'>${declarationType}</h5>` : '';    
  }
  
  getParamName(paramName, emptyValue) {
    return !Utils.isEmpty(emptyValue)  ? `<h5 data-paramdef='${JSON.stringify({ val: paramName , id:"nameParamDropZone" })}'>${paramName}</h5>` : '';    
  }
  
  handleDragStart(ev) {
    const target = ev.target;
    this.dragSourceItem = target;
    try {
      this.sourceInfoItem = JSON.parse(this.dragSourceItem.dataset.infoparam);      
    } catch(e) {
       this.dragSourceItem = null;
       this.sourceInfoItem = null;        
    }
  }
  
  handleDragEnter(ev) {
    ev.preventDefault();
    const target = ev.target;
    if(!this.sourceInfoItem) return;
    if(target.dataset.zone === this.sourceInfoItem.type)
      ev.target.classList.add('dropZone-over');   
  }
  
  handleDragOver(ev) {
    ev.preventDefault();
  }
  
  handleDragLeave(ev) {
    ev.preventDefault();
    ev.target.classList.remove('dropZone-over');   
  }
  
  handleDragEnd(ev) {
    ev.stopPropagation();
    this.dropZones.forEach(element => element.classList.remove('dropZone-over'));
    this.dragSourceItem = null;
    this.sourceInfoItem = null;
  }
  
  handleDrop(ev) { 
    ev.preventDefault();
    ev.stopPropagation();
    if(!this.sourceInfoItem) return;
    this.handleDropAction(ev.target);
  }
  
  handleTouchStart(ev) {
    if (ev.cancelable) ev.preventDefault();
    const tagName = ev.target.tagName.toLowerCase();
    this.touchStartAction(ev, tagName);
  }
  
  touchStartAction(ev, tagName) {
    const target = tagName === 'div' ? ev.target : ev.target.parentElement;
    if (!this.activeEvent) {    
      const touch = ev.touches[0];
      this.lastTouch = touch;
      this.activeEvent = 'start';
      this.cloneTouchItem(target);
      Utils.dispatchMouseEvent({ touch, type: 'mousedown', element: this.overlayParamEdition });
    }
  }
   
  cloneTouchItem(target) {
    const clone = target.cloneNode(true);
    target.after(clone);
    target.style.opacity = '.7';
    this.dragSourceItem = target; 
    this.sourceInfoItem = JSON.parse(this.dragSourceItem.getAttribute('data-infoparam'));
    clone.addEventListener('touchstart', this.handleTouchStart.bind(this));
    clone.addEventListener('touchmove', this.handleTouchMove.bind(this));
    clone.addEventListener('touchend', this.handleTouchEnd.bind(this));    
  }
  
  handleTouchMove(ev) {
    const target = ev.target.tagName.toLowerCase() === 'div' ? ev.target : ev.target.parentElement;
    const touch = ev.touches[0];
    this.lastTouch = touch;
    Utils.dispatchMouseEvent({ touch, type: 'mousemove', element: this.overlayParamEdition });
    this.activeEvent = 'move';
  }

  handleTouchEnd(ev) {
    if(!this.dragSourceItem) return;
    if(!this.lastTouch) return;
    Utils.dispatchMouseEvent({ touch: this.lastTouch, type: 'mouseup', element: this.overlayParamEdition });
  }

  handleMouseDown(ev) {
    if(!this.activeEvent) return;
    this.dragSourceItem.style.position = "absolute";
  }
  
  handleMouseMove(ev) {
    if(!this.activeEvent) return;
    const rect = document.querySelector('.wizard-box-edit-dialog').getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    this.dragSourceItem.style.position = "absolute";
    this.dragSourceItem.style.left = x - 20 + "px"
    this.dragSourceItem.style.top = y  - 20 + "px"; 
    this.checkTouchDropZone();
  }
 
  handleMouseUp(ev) {
    ev.preventDefault();
    if (this.activeEvent === 'move') {    
      this.formIds.forEach(id => {
          const dropZone = document.querySelector(`#${id}`);
          if (this.parentForm.validDropZone(dropZone.getBoundingClientRect(), this.dragSourceItem)) {
            this.handleDropAction(dropZone);
          }  
        });
      this.dragSourceItem.remove();
      this.activeEvent = null;
      this.dragSourceItem = null;
      this.sourceInfoItem = null;
    }
    this.removeDropOverClass();
  }
  
  checkTouchDropZone() {
    this.formIds.forEach(id => {
      const dropZone = document.querySelector(`#${id}`);
      this.isInTouchDropZone(dropZone); 
    });
  }
  
  isInTouchDropZone(dropZone) {
    const id = dropZone.id;
    if(id === this.sourceInfoItem.type) {
      this.parentForm.inDropZone(dropZone.getBoundingClientRect(), this.dragSourceItem, dropZone);
    } else {
        this.removeDropOverClass(dropZone.id);
    }
  }
  
  removeDropOverClass(id) {
    if(id) {
      document.querySelector(`#${id}`).classList.remove('dropZone-over');      
    } else {
      this.formIds.forEach(id => document.querySelector(`#${id}`).classList.remove('dropZone-over'));  
    }
  }
  
  handleDropAction(target) {
    const id = target.dataset.zone;
    switch(id) {
      case 'declarationParamDropZone':
      case 'typeParamDropZone': 
        if(id === this.sourceInfoItem.type)
          target.innerHTML = `<h5 data-paramdef='${JSON.stringify({ val: this.sourceInfoItem.val, id })}'>${this.sourceInfoItem.val}</h5>`;          
        break;
      default:
        if(id === this.sourceInfoItem.type) 
          this.showTextForm(target);
    }
  }
  
  
  showTextForm(element) {
    const div = document.createElement('div');
    div.classList.add('overlay');
    div.id = 'overlayTextform';
    div.style =Utils.hasCssBackdrop() ? 
      `background: rgba(255, 255, 255, 0.05);backdrop-filter: blur(5px);-webkit-backdrop-filter: blur(5px);` : `background: #263d5a73;`; 
    div.innerHTML = this.templateTextForm(element.id);
    document.querySelector('body').appendChild(div);
    this.textBtn = document.querySelector('#textBtn');
    this.textBtn.addEventListener('click', this.handleTextForm.bind(this, element));
  }
  
  handleTextForm(element, ev) {
    const value = document.querySelector('#customInput').value;
    const { error, message }  = this.validateParamName(value);
    if(error) {
      this.parentForm.displayExpressionError('newParamNameExpressionError', message);
      return;
    }
    element.innerHTML = `<h5 data-paramdef='${JSON.stringify({ val: value, id: element.id })}'>${value}</h5>`; 
    this.textBtn.removeEventListener('click', this.handleTextForm.bind(this, element)); 
    document.querySelector('#overlayTextform').remove();
  }
  
  validateParamName(value) {
    if(Utils.isEmpty(value)) return { error: true, message: 'Expression is empty' };
    if(isNaN(value[0]) && value[0] === value[0].toUpperCase()) 
      return  { error: true, message: `param name "${value}" start with uppercase character` };

    if (!/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(value)) 
      return { error: true, message: `param name "${value}" contains ilegal characters` };

    if (this.parentForm.reservedWords.includes(value)) 
      return { error: true, message: `param name "${value}" is a reserved word` };
      
    if (this.isParamExist(value)) 
      return { error: true, message: `param name "${value}" is alrready used` };
   
    return { error: false, message: '' };  
  }
  
  isParamExist(value) {
    const dropZone = this.parentForm.dndFunctionParam.dropZone;
    const children = Array.from(dropZone.children);
    for (const child of children) {
      const dataParam = JSON.parse(child.dataset.param);
      if(value === dataParam.name) return true;
    }
    return false;
  }
  
  templateTextForm(id) {
    const title = 'Parameter Name';
    return (
      `<div class="wizard-box-edit-dialog" style="border:3px solid #f3610a;">
         <h4>${title}</h4>
         <input type="text" id="customInput" name="customInput" value='' />
         <p id="newParamNameExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
         <button id="textBtn">add</button> 
       </div>`);
  }
  
  updateParamBox(ev) {
    const items = Array.from(this.dropZones);
    const  param = { name: "", declarationType: "", declaration: "Normal" };
    for(const item of items) {
      if(!item.hasChildNodes()) {
        this.parentForm.displayExpressionError('paramsExpressionError', 'Expression is empty');
        return;
      }
      const { val, id } = JSON.parse(item.firstElementChild.dataset.paramdef);
      switch(id) {
        case 'declarationParamDropZone':
          param.declarationType = val;
          break;
        case 'typeParamDropZone':
          param.declaration = val;
          break;
        default:
          param.name = val;
      }
    }
    const expression = this.parentForm.getParameterString(param.name, param.declarationType, param.declaration);
    this.element.style.background = this.colors[param.declarationType];
    this.element.firstElementChild.value = expression;
    let dataParam = JSON.parse(this.element.dataset.param);
    dataParam = {...dataParam, ...param, expression };
    this.element.dataset.param = JSON.stringify(dataParam);
    this.overlayParamEdition.remove();
    this.parentForm.buildAndShowExpression();
  }
  
  handleClickNameZone(ev) {
    ev.preventDefault();
    const target = ev.target.tagName.toLowerCase() === 'h5' ? ev.target.parentElement : ev.target; 
    this.showTextForm(target);
  }
  
  listenersManager(listenType) {
    this.draggableItems.forEach(element => {
      element[listenType]('dragstart', this.handleDragStart.bind(this));
      element[listenType]('dragend', this.handleDragEnd.bind(this));
      element[listenType]('touchstart', this.handleTouchStart.bind(this));
      element[listenType]('touchmove', this.handleTouchMove.bind(this));
      element[listenType]('touchend', this.handleTouchEnd.bind(this));
    });
    this.dropZones.forEach(element => {
      element[listenType]('dragenter', this.handleDragEnter.bind(this));
      element[listenType]('dragleave', this.handleDragLeave.bind(this));
      element[listenType]('dragover', this.handleDragOver.bind(this));
      element[listenType]('drop', this.handleDrop.bind(this));
    });
    this.overlayParamEdition[listenType]('mousedown', this.handleMouseDown.bind(this));
    this.overlayParamEdition[listenType]('mousemove', this.handleMouseMove.bind(this));
    this.overlayParamEdition[listenType]('mouseup', this.handleMouseUp.bind(this))
    this.btn[listenType]('click', this.updateParamBox.bind(this));
    this.nameParamDropZoneToClick[listenType]('click', this.handleClickNameZone.bind(this));
  }
}