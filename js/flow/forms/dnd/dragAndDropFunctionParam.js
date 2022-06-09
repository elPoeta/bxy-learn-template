class DragAndDropFunctionParam {
  constructor(form) {
    this.form = form;
    this.dropZone = document.querySelector('#dropZone');
    this.overlay = document.querySelector('.overlay');
    this.draggableItems = document.querySelectorAll('.paramDragItem');
    this.listenersManager('addEventListener');
    this.addDroppedElementListeners(); 
  }
  
  handleDragStart(ev) {
    this.dragSourceItem = ev.target;
    try {
      this.sourceParamItem = JSON.parse(this.dragSourceItem.dataset.param);
    } catch(e) {
       this.dragSourceItem = null;
       this.sourceParamItem = null;        
    }
  }
  
  handleDragEnter(ev) {
    ev.preventDefault();
    if(!this.dragSourceItem) return;
    this.dropZone.classList.add('dropZone-over');   
  }
  
  handleDragOver(ev) {
    ev.preventDefault();
    if(!this.dragSourceItem) return;
    const target = ev.target;
    if (target.classList.contains('dropZone')) {
      this.dropZone.classList.add('dropZone-over');        
    } else if (target.classList.contains('cloned')) {
        this.dropZone.classList.remove('dropZone-over');   
        const initialValue = [... this.dropZone.children].indexOf(target) + 1;
        this.moveSmooth(initialValue, 'add'); 
      }
  }
  
  handleDragLeave(ev) {
    ev.preventDefault();
    this.dropZone.classList.remove('dropZone-over');  
    this.moveSmooth(0, 'remove');
  }
  
  handleDragEnd(ev) {
    ev.stopPropagation();
    this.dropZone.classList.remove('dropZone-over');
    this.moveSmooth(0, 'remove');
    this.dragSourceItem = null;
    this.sourceParamItem = null;
  }
  
  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if(!this.dragSourceItem) return;
    const target = ev.target.tagName.toLowerCase() === 'input' ? ev.target.parentElement : ev.target;
    this.handleDropAction(target);
  }
  
  handleDropAction(target) {
    if (!target.classList.contains('dropZone') && !target.classList.contains('draggable')) {
      if(this.dragSourceItem.classList.contains('cloned')) {
        this.removeDndListeners();

      }
      return;
    } else if(target.classList.contains('draggable')) {
        if (this.dragSourceItem != target) {
          if(this.dragSourceItem.classList.contains('cloned')) {
            target.insertAdjacentElement("afterend", this.dragSourceItem);
          } else {
             this.dropAction('afterEnd',target);
        }
      }
      return;
    }
    if(!this.dragSourceItem.classList.contains('cloned')) {
      this.dropAction('appendChild', target);
    }   
    this.dropZone.classList.remove('dropZone-over');  
  }
  
  dropAction(appendType, target) {
    const clone = this.getCloneItem(); 
    if(this.isNotValidDropAction(clone)) return;
    if(appendType === 'appendChild') {
      this.dropZone.appendChild(clone);          
    } else {
      target.insertAdjacentElement("afterend", clone);        
    }
    this.addCloneDndListeners(clone);
    this.sourceParamItem.inDropZone = true;
    if(this.sourceParamItem.name !== 'scanner') {
      this.fillParamBox(clone);      
    } else {
        clone.dataset.param = JSON.stringify(this.sourceParamItem);
        clone.firstElementChild.value = `${this.sourceParamItem.declarationType} ${this.sourceParamItem.name}`;
        this.form.buildAndShowExpression();
    }
  }
  
  addCloneDndListeners(clone) {
    clone.addEventListener('dragstart', this.handleDragStart.bind(this));
    clone.addEventListener('dragend', this.handleDragEnd.bind(this));
    clone.addEventListener('dragenter', this.handleDragEnter.bind(this));
    clone.addEventListener('dragover', this.handleDragOver.bind(this));
    clone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    clone.addEventListener('drop', this.handleDrop.bind(this));  
  }
  
  handleTouchStart(ev) {
    if (ev.cancelable) ev.preventDefault();
    const tagName = ev.target.tagName.toLowerCase();
    if(tagName === 'svg' || tagName === 'path') {
      this.handleTouchEdit(ev);
    } else {
        this.touchStartAction(ev, tagName);
    }
  }
  
  touchStartAction(ev, tagName) {
    const target = tagName === 'div' ? ev.target : ev.target.parentElement;
    if (!this.activeEvent) {    
      const touch = ev.touches[0];
      this.lastTouch = touch;
      this.activeEvent = 'start';
      if(!target.classList.contains('cloned')) {
        this.cloneTouchItem(target);
      } else {
        target.style.opacity = '.7';
        target.style.zIndex = 200;
        this.dragSourceItem = target; 
      }
      this.sourceParamItem = JSON.parse(this.dragSourceItem.dataset.param);
      Utils.dispatchMouseEvent({ touch, type: 'mousedown', element: this.overlay });
    }
  }
  
  handleTouchEdit(ev) {
    this.handleEdition(ev);
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
    Utils.dispatchMouseEvent({ touch, type: 'mousemove', element: this.overlay });
    this.activeEvent = 'move';
  }
  
  handleTouchEnd(ev) {
    if(!this.dragSourceItem) return;
    if(!this.lastTouch) return;
    Utils.dispatchMouseEvent({ touch: this.lastTouch, type: 'mouseup', element: this.overlay });
  }
  
  handleMouseDown(ev) {
    if(!this.activeEvent) return;
    this.dragSourceItem.style.position = "absolute";
  }
  
  handleMouseMove(ev) {
    if(!this.activeEvent) return;
    const rect = document.querySelector('.wizardWrapFunc-container').getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    this.dragSourceItem.style.position = "absolute";
    this.dragSourceItem.style.left = x - 20 + "px"
    this.dragSourceItem.style.top = y  - 20 + "px"; 
    if(this.form.validDropZone(this.dropZone.getBoundingClientRect(), this.dragSourceItem)) {
      const { top } = this.form.getCoords(this.dragSourceItem);  
        this.form.scrollTo(top,this.dropZone);
      } else {
        this.dropZone.classList.remove('dropZone-over');  
       }  
    this.form.inDropZone(this.dropZone.getBoundingClientRect(), this.dragSourceItem, this.dropZone);
  }
  
  handleMouseUp(ev) {
    ev.preventDefault();
    if (this.activeEvent === 'move') {
      if (this.form.validDropZone(this.dropZone.getBoundingClientRect(), this.dragSourceItem)) {
       this.handleMouseUpAction();
      } else {
          this.removeTouchListeners(this.dragSourceItem);
          this.dragSourceItem.remove();
      }
      this.cleanTouchItems();
    }
  }
  
  cleanTouchItems() {
    this.activeEvent = null;
    this.dragSourceItem = null;
    this.sourceParamItem = null;
    this.dropZone.classList.remove('dropZone-over');
  }
  
  handleMouseUpAction() {
    const children = Array.from(this.dropZone.children);
    const index = this.getZoneElementIndex(children);
    if (index > -1) {
      if(this.isNotValidDropAction(this.dragSourceItem)) return;
      this.updateTouchSourceItem();
      this.dropZone.insertBefore(this.dragSourceItem, this.dropZone.children[index + 1]);
      this.fillTouchParamBox();
      if((index + 1) === (this.dropZone.children.length - 1)) 
        this.dropZone.scrollTop = this.dropZone.scrollHeight;    
    } else { 
        if(this.isNotValidDropAction(this.dragSourceItem)) return;
        this.updateTouchSourceItem();
        this.dropZone.appendChild(this.dragSourceItem);
        this.fillTouchParamBox();
        this.dropZone.scrollTop = this.dropZone.scrollHeight;
    }
  }
  
  getZoneElementIndex(children) {
    for (let i = 0; i < children.length; i++) {
      if (this.form.validDropZone(children[i].getBoundingClientRect(), this.dragSourceItem)) {
        return i;
      }
    }  
    return -1;
  }
  
  updateTouchSourceItem() {
    this.dragSourceItem.classList.add('cloned');
    this.dragSourceItem.style.position = "initial";
    this.dragSourceItem.style.opacity = 1;
    this.dragSourceItem.style.transform = 'scale(1,1)';
    this.dragSourceItem.style.zIndex = 0;  
    this.dragSourceItem.firstElementChild.style.textAlign = 'left';
    this.dragSourceItem.firstElementChild.style.width = '100%';
    if(this.dragSourceItem.lastChild.tagName === 'svg') return;
    if(this.sourceParamItem.name === 'scanner') return; 
    const fillColor = '#000';
    const svg = this.createSvgIcon(fillColor);
    svg.addEventListener('click', this.handleEdition.bind(this));
    this.dragSourceItem.appendChild(svg);
  }
  
  fillTouchParamBox() {
    this.sourceParamItem.inDropZone = true;
    if(this.sourceParamItem.name !== 'scanner') {
      this.fillParamBox(this.dragSourceItem.firstElementChild);
    } else {
        this.dragSourceItem.firstElementChild.value = `${this.sourceParamItem.declarationType} ${this.sourceParamItem.name}`;
        this.dragSourceItem.dataset.param = JSON.stringify(this.sourceParamItem);
        this.form.buildAndShowExpression();
    }  
  }
  
  isNotValidDropAction(clone) {
    const children = Array.from(this.dropZone.children);
    if(!children.length) return false;  
    if(this.sourceParamItem.name !== 'scanner' || this.sourceParamItem.inDropZone) return false;
    for(const child of children) {
      const n = JSON.parse(child.dataset.param).name;
      if(n === 'scanner') {
        clone.remove(); 
        return true;          
      }
    }
    return false;
  }
  
  getCloneItem() {
    const clone = this.dragSourceItem.cloneNode(true);
    clone.classList.add('cloned');
    clone.firstElementChild.style = 'text-align: left;';
    if(this.sourceParamItem.name === 'scanner') return clone;
    const fillColor = '#000';
    const svg = this.createSvgIcon(fillColor);
    svg.addEventListener('click', this.handleEdition.bind(this));
    clone.appendChild(svg);   
    return clone;
  }
  
  createSvgIcon(fillColor) {
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const iconPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    iconSvg.setAttribute('fill', 'currentColor');
    iconSvg.setAttribute('viewBox', '0 0 20 20');
    const cls = ['icon-svg', 'h-5', 'w-5'];
    iconSvg.classList.add(...cls);
    iconSvg.style = `fill:${fillColor};justify-self:center; cursor:pointer;font-size: 1.7em;`; 
    iconPath.setAttribute(
      'd',
      'M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z'
    );
    iconSvg.appendChild(iconPath);
    return iconSvg;
  }
 
  fillParamBox(clone) {
    clone.dataset.param = JSON.stringify(this.sourceParamItem);
    new WizardFunctionParamForm(clone, this.form).show();  
  }
  
  handleEdition(ev) {
    ev.preventDefault();
    const target = ev.target;
    const parent = target.tagName.toLowerCase() === 'svg' ? 
         target.parentElement : 
         target.tagName.toLowerCase() === 'path' ? target.parentElement.parentElement : null;
    if(!parent || document.querySelector('#overlayParamEdition')) return;
    new WizardFunctionParamForm(parent, this.form).show();  
  }
  
  moveSmooth(initialValue, action) {
    const children = [...this.dropZone.children];
    for (let i = initialValue; i < children.length; i++) {
      this.dropZone.children[i].classList[action]('move-smooth');
    }
  }
  
  addDroppedElementListeners() {
    const children = [...this.dropZone.children];
    children.forEach(el => {
      const data = JSON.parse(el.dataset.param);
      el.addEventListener('dragstart', this.handleDragStart.bind(this));
      el.addEventListener('dragend', this.handleDragEnd.bind(this));
      el.addEventListener('touchstart', this.handleTouchStart.bind(this));
      el.addEventListener('touchmove', this.handleTouchMove.bind(this));
      el.addEventListener('touchend', this.handleTouchEnd.bind(this));
      if(data.declaratioType !== 'java.util.Scanner') {
        el.lastElementChild.addEventListener('click', this.handleEdition.bind(this));
      }
    });
  }
  
  removeDndListeners() {
    this.dragSourceItem.removeEventListener('dragstart', this.handleDragStart.bind(this));
    this.dragSourceItem.removeEventListener('dragend', this.handleDragEnd.bind(this));
    this.dragSourceItem.removeEventListener('dragenter', this.handleDragEnter.bind(this));
    this.dragSourceItem.removeEventListener('dragover', this.handleDragOver.bind(this));
    this.dragSourceItem.removeEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dragSourceItem.removeEventListener('drop', this.handleDrop.bind(this)); 
    this.dragSourceItem.remove();
  }
  
  removeTouchListeners(target) {
    target.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    target.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    target.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
  
  listenersManager(listenType) {
    this.draggableItems.forEach(element => {
      const data = JSON.parse(element.dataset.param);
      element[listenType]('dragstart', this.handleDragStart.bind(this));
      element[listenType]('dragend', this.handleDragEnd.bind(this));
      element[listenType]('touchstart', this.handleTouchStart.bind(this));
      element[listenType]('touchmove', this.handleTouchMove.bind(this));
      element[listenType]('touchend', this.handleTouchEnd.bind(this));
      if(data.name !== 'new' && data.declarationType !== 'java.util.Scanner') {
        element.lastElementChild[listenType]('click', this.handleEdition.bind(this));
      }
    });
    this.overlay[listenType]('dragenter', this.handleDragEnter.bind(this));
    this.overlay[listenType]('dragleave', this.handleDragLeave.bind(this));
    this.overlay[listenType]('dragover', this.handleDragOver.bind(this));
    this.overlay[listenType]('drop', this.handleDrop.bind(this));
    this.overlay[listenType]('mousedown', this.handleMouseDown.bind(this));
    this.overlay[listenType]('mousemove', this.handleMouseMove.bind(this));
    this.overlay[listenType]('mouseup', this.handleMouseUp.bind(this))
  }
}