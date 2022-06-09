class WizardEditVarFuncBase {
  constructor(dnd, element, data) {
    this.data = data;
    this.element = element;
    this.dnd = dnd;
    this.variables = [];
  }
  
  show() {
    this.overlayEdition = document.createElement('div');
    this.overlayEdition.classList.add('overlay');
    this.overlayEdition.id = 'overlayEdition';
    this.overlayEdition.innerHTML = this.template(this.data);
    document.querySelector('body').appendChild(this.overlayEdition);
    this.setDataVariables();
    this.addListeners(this.element);
    return this;
  }
  
  setDataVariables() {
    	this.variables.forEach(variable => this.setVariableJsonData(variable));
  }
  
  setVariableJsonData(variable) {
    const element = document.getElementById(variable.uuid);
    delete variable.uuid;
    element.setAttribute('data-variable', JSON.stringify(variable));
  }
  
  handleDragStart(ev) {
    this.dragSourceItem = ev.target;
  }
  
  handleDragEnter(ev) {
    ev.preventDefault();
    this.dropZone.classList.add('dropZone-over');    
  }
  
  handleDragLeave(ev) {
    ev.preventDefault();
    this.dropZone.classList.remove('dropZone-over');   
  }
  
  handleDragOver(ev) {
    ev.preventDefault();
  }
  
  handleDragEnd(ev) {
    ev.stopPropagation();
    this.dragSourceItem = null;
    this.dropZone.classList.remove('dropZone-over');  
    return false;
  }

  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const dataVar = JSON.parse(this.dragSourceItem.getAttribute('data-variable'));
    this.dropZone.innerHTML = `<h5 id="dropedDataVar" data-varname='${dataVar.name}'>${dataVar.name}</h5>`;
    document.querySelector('#dropedDataVar').setAttribute('data-varprops', JSON.stringify(dataVar));
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
    if(this.dragSourceItem.classList.contains('function-item') || this.dragSourceItem.classList.contains('variable-item')) {
      this.dnd.inDropZone(this.dropZone.getBoundingClientRect(), this.dragSourceItem, this.dropZone);        
    } else {
      this.dnd.inDropZone(this.dropParamZone.getBoundingClientRect(), this.dragSourceItem, this.dropParamZone);   
    }
  }
 
  handleMouseUp(ev) {
    ev.preventDefault();
    if (this.activeEvent === 'move') {
      const droppedZoneBox = this.dropZone.getBoundingClientRect();
      if (this.dnd.validDropZone(droppedZoneBox, this.dragSourceItem)) {
        const dataVar = JSON.parse(this.dragSourceItem.getAttribute('data-variable'));
        this.dropZone.innerHTML = `<h5 id="dropedDataVar" data-varname='${dataVar.name}'>${dataVar.name}</h5>`;
        document.querySelector('#dropedDataVar').setAttribute('data-varprops', JSON.stringify(dataVar));
      } 
      this.dragSourceItem.remove();
      this.activeEvent = null;
      this.dragSourceItem = null;
      this.dropZone.classList.remove('dropZone-over');
    }
  }
  
}