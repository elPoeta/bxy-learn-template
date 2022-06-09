class WizardEditBoolItem {
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
  
  template() {
    return (
      `<div class="wizard-box-edit-dialog" style="grid-template-rows: 30px auto;">
         <h4>Boolean</h4>
         <section id="boolContainer" class="defineWizardContainer">
           <h4>Value</h4>
           <div id="boolDropZone" class="varItemsDropZone" data-zone="boolDropZone" data-content="Drop value here">${this.setBoolValue()}</div>
         </section>
         <section  style="border: 2px solid #3050f3;margin: 5px;padding: 10px;border-radius: 5px;">
           <h4>Values</h4>
           <div style="display:flex;align-items:center;justify-content:space-around;">
             <div class="draggable boolDragItem" style="cursor:pointer;background-color:#A5D6A7;padding:1px;" draggable="true" data-boolinfo="true">
               <input type="text" value="true" style="width:80px;text-align: center;cursor:pointer;color:#000;" class="wizard-box-value" disabled />
             </div>
             <div class="draggable boolDragItem"  style="cursor:pointer;background-color:#E57373;padding:1px;" draggable="true" data-boolinfo="false">
               <input type="text" value="false" style="width:80px;text-align: center;cursor:pointer;color:#000;" class="wizard-box-value"  disabled />
             </div>
           </div>
         </section>
         <p id="booleanExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
         <button id="boolUpdateBtn">update</button> 
       </div>`);
  }
  
  setBoolValue() {
    return `<h5 data-bool="${this.data.userValue}">${this.data.userValue}</h5>`; 
  }
  
  addListeners() {
    this.btn = document.querySelector('#boolUpdateBtn');
    this.dropZone = document.querySelector('#boolDropZone');
    this.draggableItems = document.querySelectorAll('.boolDragItem');
    this.listenersManager('addEventListener');
  }
  
  handleDragStart(ev) {
  	Utils.selecting(false);
  	const target = ev.target.tagName.toLowerCase() === 'div' ? ev.target : ev.target.parentElement;
  	this.dragSourceItem = target;
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
    Utils.selecting(true);
    return false;
  }

  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();  
    this.dropAction(ev.target);
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
    target.style.transform = 'scale(1.5,1.5)';
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
    this.isInTouchDropZone();
  }
 
  handleMouseUp(ev) {
    ev.preventDefault();
    if (this.activeEvent === 'move') {    
      if (this.dnd.validDropZone(this.dropZone.getBoundingClientRect(), this.dragSourceItem)) {
       this.dropAction(ev);
      }  
      this.activeEvent = null;
      this.dragSourceItem.remove();
      this.dragSourceItem = null;
    }
    this.removeDropOverClass();
  }
  
  
  isInTouchDropZone() {
    this.dnd.inDropZone(this.dropZone.getBoundingClientRect(), this.dragSourceItem, this.dropZone);
  }
  
  removeDropOverClass(id) {
    this.dropZone.classList.remove('dropZone-over');       
  }
  
  dropAction(ev) {
  	if(!this.dragSourceItem) return;
  	const infoBool = JSON.parse(this.dragSourceItem.dataset.boolinfo);
  	this.dropZone.innerHTML = `<h5 data-bool="${infoBool}">${infoBool}</h5>`; 
  }
  
  updateWizardBool(ev) {
  	const dataElement = document.querySelector('[data-bool]');
  	if(!dataElement) {
      this.dnd.displayExpressionError('booleanExpressionError', 'Expression is empty');
      return;
  	}
  	this.element.value = dataElement.dataset.bool;
    const data = JSON.parse(this.element.parentElement.getAttribute('data-we'));
    data.userValue = this.element.value;
    this.element.parentElement.setAttribute('data-we', JSON.stringify(data));
    this.listenersManager('removeEventListener');
  	this.overlayEdition.remove();
    this.dnd.buildWizardExpression();
  }
  
  listenersManager(listenType) {
    this.draggableItems.forEach(element => {
      element[listenType]('dragstart', this.handleDragStart.bind(this));
      element[listenType]('dragend', this.handleDragEnd.bind(this));
      element[listenType]('touchstart', this.handleTouchStart.bind(this));
      element[listenType]('touchmove', this.handleTouchMove.bind(this));
      element[listenType]('touchend', this.handleTouchEnd.bind(this));
    });
    this.dropZone[listenType]('dragenter', this.handleDragEnter.bind(this));
    this.dropZone[listenType]('dragleave', this.handleDragLeave.bind(this));
    this.dropZone[listenType]('dragover', this.handleDragOver.bind(this));
    this.dropZone[listenType]('drop', this.handleDrop.bind(this));
    this.overlayEdition[listenType]('mousedown', this.handleMouseDown.bind(this));
    this.overlayEdition[listenType]('mousemove', this.handleMouseMove.bind(this));
    this.overlayEdition[listenType]('mouseup', this.handleMouseUp.bind(this))
    this.btn[listenType]('click', this.updateWizardBool.bind(this));
  }
}