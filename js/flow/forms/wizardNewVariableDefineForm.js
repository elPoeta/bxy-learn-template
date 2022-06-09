class WizardNewVariableDefineForm extends WizardNewVariableForm {
  constructor(dnd, element, data) {
    super(dnd, element, data);
    this.declarations = this.dnd.block.variableDeclaration;
    this.variableTypes = this.dnd.block.variableType;
    this.dragSourceItem = null;
    this.sourceInfoItem = null;
    this.formIds = this.dnd.block.type !== 'inputBlock' ?  ['declarationDropZone', 'typeDropZone', 'typeSizeOneDropZone', 'typeSizeTwoDropZone', 'nameDropZone'] :
      ['declarationDropZone', 'nameDropZone']; 
  }
 
  template() {
    const dataValues = this.element.dataset.values;
    const values = dataValues ? JSON.parse(dataValues) : null;
    const { declaration, declarationType, variableName, arraySizeOne = '', arraySizeTwo = '' } = values ? values : this.dnd.block;
    return (
      `<div class="wizard-box-edit-dialog" style="grid-template-rows: 30px auto;">
         <h4>Define variable</h4>
         <section id="declarationContainer" class="defineWizardContainer">
           <h4>Declaration</h4>
           <div id="declarationDropZone" class="varItemsDropZone" data-zone="declarationDropZone" data-content="Drop declaration here">${this.getDeclaration(declaration)}</div>
         </section>
         ${this.dnd.block.type !== 'inputBlock' ? 
           `<section id="typeContainer" class="defineWizardContainer">
              <h4>Type</h4>
              <div id="typeDropZone" class="varItemsDropZone" data-zone="typeDropZone" data-content="Drop type here">${this.getDeclarationType(declarationType)}</div>
            </section>` : ''
         }
         ${this.dnd.block.type !== 'inputBlock' ? 
           `<section id="typeSizeContainer" class="defineWizardContainer ${declarationType === 'Normal' ? 'hide' : '' }">
              <div>
                <h4>Size One</h4>
                <div id="typeSizeOneDropZone" class="handleTextClick varItemsDropZone defineSizeContainer" data-zone="sizeDropZone"  data-content="Drop size one here">${this.getSizeOne(arraySizeOne, declarationType)}</div>
              </div>
              <div id="typeSizeTwoZone" class="${declarationType !== 'MultiDimensional Array' ? 'hide' : '' }">
                <h4>Size Two</h4>
               <div id="typeSizeTwoDropZone" class="handleTextClick varItemsDropZone defineSizeContainer" data-zone="sizeDropZone" data-content="Drop size two here">${this.getSizeTwo(arraySizeTwo, declarationType)}</div>
              </div>  
           </section>` : ''
         }
         <section id="nameContainer" class="defineWizardContainer">
           <h4>Name</h4>
           <div id="nameDropZone" class="handleTextClick varItemsDropZone" data-zone="nameDropZone" data-content="Drop name here">${this.getVarName(variableName)}</div>
         </section>
         <section class="defineVarDragContainer custom-gray-scroll">
           <h4>Declaration</h4>
           <div class="defineItemsContainer">
             ${this.declarationTemplate()}
           </div>
           <h4 class="${this.dnd.block.type === 'inputBlock' ? 'hide' : ''}">Type</h4>
           <div class="defineItemsContainer ${this.dnd.block.type === 'inputBlock' ? 'hide' : ''}">
             ${this.typesTemplate()}
           </div>
            <h4>Values</h4>
           <div class="defineItemsContainer">
             <div class="draggable defineItems" style="background-color:#B2EBF2;" draggable="true" data-info='${JSON.stringify({ type:"nameDropZone", val: "text"})}'>Name</div>
             <div class="draggable defineItems ${this.dnd.block.type === 'inputBlock' ? 'hide' : ''}" style="background-color:#B2EBF2;" draggable="true" data-info='${JSON.stringify({ type:"sizeDropZone", val: "size"})}' >Size</div>
           </div>
         </section>
         <p id="defineExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
         <button id="newVarBtn">update</button> 
       </div>
       `);
   }
  
  declarationTemplate() {
    return this.declarations.map(declaration => (
          `<div class="draggable defineItems" style="background-color:#C8E6C9;" draggable="true" data-info='${JSON.stringify({ type:"declarationDropZone", val: declaration})}'>${declaration}</div>`
        )).join(''); 
  }
  
  typesTemplate() {
    return this.variableTypes.map(type => (
         `<div class="draggable defineItems" style="background-color:#FFCC80;"  draggable="true" data-info='${JSON.stringify({ type:"typeDropZone", val: type})}'>${type}</div>`
       )).join('');    
  }

  getDeclaration(declaration) {
    return !Utils.isEmpty(declaration) ? `<h5 data-define='${JSON.stringify({ val: declaration , id:"declarationDropZone" })}'>${declaration}</h5>` : '';    
  }
  
  getDeclarationType(declarationType) {
    return !Utils.isEmpty(declarationType) ? `<h5 data-define='${JSON.stringify({ val: declarationType, id:"typeDropZone" })}'>${declarationType}</h5>` : '';    
  }
  
  getSizeOne(arraySizeOne, declarationType) {
    return declarationType === 'Array' || declarationType === 'MultiDimensional Array' ? 
            `<h5 data-define='${JSON.stringify({ val: arraySizeOne , id: "typeSizeOneDropZone" })}'>${arraySizeOne}</h5>` : '';    
  }
  
  getSizeTwo(arraySizeTwo, declarationType) {
    return declarationType === 'MultiDimensional Array' ?
            `<h5 data-define='${JSON.stringify({ val: arraySizeTwo, id:"typeSizeTwoDropZone" })}'>${arraySizeTwo}</h5>` : '';    
  }
  
  getVarName(variableName) {
    return !Utils.isEmpty(variableName) ? `<h5 data-define='${JSON.stringify({ val: variableName , id:"nameDropZone" })}'>${variableName}</h5>` : '';    
  }
   
  addListeners(){
    this.btn = document.querySelector('#newVarBtn');
    this.dropZones = document.querySelectorAll('.varItemsDropZone');
    this.draggableItems = document.querySelectorAll('.defineItems');
    this.nameArraySizeDropZone = document.querySelectorAll('.handleTextClick');
    this.listenersManager('addEventListener');
  }
  
  handleDragStart(ev) {
    this.dragSourceItem = ev.target;
    try {   
      this.sourceInfoItem = JSON.parse(this.dragSourceItem.dataset.info);
    } catch(e) {
       this.dragSourceItem = null;
       this.sourceInfoItem = null;        
    }
  }
  
  handleDragEnter(ev) {
    ev.preventDefault();
    if(!this.dragSourceItem) return;
    const target = ev.target;
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
    if(!this.dragSourceItem) return;
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
      Utils.dispatchMouseEvent({ touch, type: 'mousedown', element: this.overlayEdition });
    }
  }
   
  cloneTouchItem(target) {
    const clone = target.cloneNode(true);
    target.after(clone);
    target.style.opacity = '.7';
    this.dragSourceItem = target; 
    this.sourceInfoItem = JSON.parse(this.dragSourceItem.getAttribute('data-info'));
    clone.addEventListener('touchstart', this.handleTouchStart.bind(this));
    clone.addEventListener('touchmove', this.handleTouchMove.bind(this));
    clone.addEventListener('touchend', this.handleTouchEnd.bind(this));    
  }
  
  handleTouchMove(ev) {
    const target = ev.target.tagName.toLowerCase() === 'div' ? ev.target : ev.target.parentElement;
    const touch = ev.touches[0];
    this.lastTouch = touch;
    Utils.dispatchMouseEvent({ touch, type: 'mousemove', element: this.overlayEdition });
    this.activeEvent = 'move';
  }

  handleTouchEnd(ev) {
    if(!this.dragSourceItem) return;
    if(!this.lastTouch) return;
    Utils.dispatchMouseEvent({ touch: this.lastTouch, type: 'mouseup', element: this.overlayEdition });
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
          if (this.dnd.validDropZone(dropZone.getBoundingClientRect(), this.dragSourceItem)) {
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
    const id = dropZone.dataset.zone !== 'sizeDropZone' ? dropZone.id : dropZone.dataset.zone;
    if(id === this.sourceInfoItem.type) {
      this.dnd.inDropZone(dropZone.getBoundingClientRect(), this.dragSourceItem, dropZone);
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
      case 'declarationDropZone':
      case 'typeDropZone': 
        if(id === this.sourceInfoItem.type) {
          target.innerHTML = `<h5 data-define='${JSON.stringify({ val: this.sourceInfoItem.val, id })}'>${this.sourceInfoItem.val}</h5>`; 
          this.checkType(id);          
        }
        break;
      default:
        if(id === this.sourceInfoItem.type) 
          this.showTextForm(target);
    }
  }
  
  checkType(id) {
    const sizeContainer = document.querySelector('#typeSizeContainer');
    const sizeOne = document.querySelector('#typeSizeOneDropZone');
    const sizeTwo = document.querySelector('#typeSizeTwoDropZone');
    if(this.sourceInfoItem.val === 'Normal') {
      sizeContainer.classList.add('hide');
      sizeOne.innerHtml = '';
      sizeTwo.innerHtml = '';
      sizeTwo.parentElement.classList.add('hide');
    } else if(this.sourceInfoItem.val === 'Array') {
       sizeContainer.classList.remove('hide');
       sizeTwo.parentElement.classList.add('hide');
    } else if(this.sourceInfoItem.val === 'MultiDimensional Array') {
        sizeContainer.classList.remove('hide');
        sizeTwo.parentElement.classList.remove('hide');
    }
  }
  
  showTextForm(element) {
    const div = document.createElement('div');
    div.classList.add('overlay');
    div.id = 'overlayTextform';
    div.style = Utils.hasCssBackdrop() ? 
      `background: rgba(255, 255, 255, 0.05);backdrop-filter: blur(5px);-webkit-backdrop-filter: blur(5px);` : `background: #263d5a73;`; 
    div.innerHTML = this.templateTextForm(element.id);
    document.querySelector('body').appendChild(div);
    this.textBtn = document.querySelector('#textBtn');
    this.textBtn.addEventListener('click', this.handleTextForm.bind(this, element));
  }
  
  handleTextForm(element, ev) {
    const value = document.querySelector('#customInput').value;
    if(Utils.isEmpty(value)) {
      this.dnd.displayExpressionError('newVarExpressionError', 'Expression is empty');
      return;
    }
    const tempVarName = this.dnd.block.variableName;
    if((element.id === 'nameDropZone' ) && !this.validVarName(value)) {
      this.dnd.block.variableName = tempVarName;
      return;
    }
    this.dnd.block.variableName = tempVarName;
    element.innerHTML = `<h5 data-define='${JSON.stringify({ val: value, id: element.id })}'>${value}</h5>`; 
    this.textBtn.removeEventListener('click', this.handleTextForm.bind(this, element));
    document.querySelector('#overlayTextform').remove();
  }
  
  templateTextForm(id) {
    const title = id === 'nameDropZone' ? 'Name' : id === 'typeSizeOneDropZone' ? 'Size One' : 'Size Two';
    return (
      `<div class="wizard-box-edit-dialog" style="border:3px solid #f3610a;">
         <h4>${title}</h4>
         <input type="text" id="customInput" name="customInput" value='' />
         <p id="newVarExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
         <button id="textBtn">add</button> 
       </div>`);
  }
  
  updateWizardBox() {
    const dataDefineItems = this.getDataFromDndItems();
    if(!dataDefineItems.length) return;
    const dataDefine = this.getDefineDataDefault();
    this.element.value = this.getExpression(this.getDataDefineObject(dataDefineItems, dataDefine));
    dataDefine.userValue = this.element.value ;
    this.element.dataset.values = JSON.stringify(dataDefine);
    const dataWe = JSON.parse(this.element.parentElement.dataset.we);
    dataWe.userValue = this.element.value;
    dataWe.extraProps = dataDefine;
    this.element.parentElement.dataset.we = JSON.stringify(dataWe);
    this.listenersManager('removeEventListener');
    document.querySelector('#overlayEdition').remove(); 
    this.dnd.buildWizardExpression();
  }
  
  getDefineDataDefault() {
    return {
      id: this.dnd.block.id,      
      declaration: '', 
      declarationType: this.dnd.block.type === 'defineBlock' ? '' : 'Normal', 
      variableName: '', 
      arraySizeOne: this.dnd.block.type === 'defineBlock' ? '1' : undefined, 
      arraySizeTwo: this.dnd.block.type === 'defineBlock' ? '1' : undefined,
    } 
  } 
  
  getDataFromDndItems() {
    const items = Array.from(this.dropZones);
    const dataDefine = [];
    for(const item of items) {
      const zone = item.id; 
      const children = item.firstElementChild;
      if(['declarationDropZone', 'typeDropZone', 'nameDropZone'].includes(zone)) {
        if(!children) {
          this.dnd.displayExpressionError('defineExpressionError', 'Some Expression is empty');
          return [];
        }    
      }
        if(['typeSizeOneDropZone', 'typeSizeTwoDropZone'].includes(zone)) {
          const index = items.findIndex(el => el.dataset.zone === 'typeDropZone')
          const firstChild = items[index].firstElementChild;
          if(!firstChild) {
            this.dnd.displayExpressionError('defineExpressionError', 'Some Expression is empty');
            return [];
          }
          const typeDropZoneVal = JSON.parse(firstChild.dataset.define).val;
          if((('Array' === typeDropZoneVal) && 'typeSizeOneDropZone' === zone) || 
               ('MultiDimensional Array' === typeDropZoneVal)) {
            if(!children) {
              this.dnd.displayExpressionError('defineExpressionError', 'Some Expression is empty');
              return [];
            }
          }
        }
        if(children)
          dataDefine.push(JSON.parse(children.dataset.define));
      }  
     return dataDefine;
  }
  
  getDataDefineObject(dataDefineItems, dataDefine) {
    dataDefineItems.forEach(item => {
      switch(item.id) {
        case 'declarationDropZone':
          dataDefine.declaration = item.val;
        break;
        case 'typeDropZone':
          dataDefine.declarationType = item.val;
          break;
        case 'nameDropZone':
          dataDefine.variableName = item.val;
          break;
        case 'typeSizeOneDropZone':
          dataDefine.arraySizeOne = item.val;
          break;
        case 'typeSizeTwoDropZone':
          dataDefine.arraySizeTwo = item.val;
          break;
      }
    });  
    return dataDefine;
  }
  
  getExpression({ declaration, declarationType, variableName, arraySizeOne, arraySizeTwo }) {
    switch (declarationType) {
      case 'Normal':
        return `${declaration} ${variableName}`;
      case 'Array':
       return `${declaration}[] ${variableName} = new ${declaration}[${arraySizeOne}]`;
      default:
       return `${declaration}[][] ${variableName} = new ${declaration}[${arraySizeOne}][${arraySizeTwo}]`;
    }
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
    this.overlayEdition[listenType]('mousedown', this.handleMouseDown.bind(this));
    this.overlayEdition[listenType]('mousemove', this.handleMouseMove.bind(this));
    this.overlayEdition[listenType]('mouseup', this.handleMouseUp.bind(this))
    this.btn[listenType]('click', this.updateWizardBox.bind(this));
    this.nameArraySizeDropZone
      .forEach(element => element[listenType]('click', this.handleClickNameZone.bind(this)));
  }
  
}