class DragAndDropFunctionDefine {
    constructor(form) {
      this.form = form;
      this.dropZones = document.querySelectorAll('[data-zone]');
      this.draggableItems = document.querySelectorAll('.defineItems');
      this.nameDropZone = document.querySelector('#nameDropZone');
      this.dragSourceItem = null;
      this.sourceInfoItem = null;
      this.formIds = ['returnDropZone', 'typeDropZone', 'nameDropZone'];
      this.overlay = document.querySelector('.overlay');
      this.listenersManager('addEventListener');
    }
    
    handleDragStart(ev) {
      Utils.selecting(false);
      this.dragSourceItem = ev.target;
      try {   
        this.sourceInfoItem = JSON.parse(this.dragSourceItem.getAttribute('data-info'));        
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
      Utils.selecting(true);
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
        Utils.dispatchMouseEvent({ touch, type: 'mousedown', element: this.overlay });
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
      Utils.selecting(false);
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
      this.checkTouchDropZone();
    }
   
    handleMouseUp(ev) {
      ev.preventDefault();
      if (this.activeEvent === 'move') {    
        this.formIds.forEach(id => {
            const dropZone = document.querySelector(`#${id}`);
            if (this.form.validDropZone(dropZone.getBoundingClientRect(), this.dragSourceItem)) {
              this.handleDropAction(dropZone);
            }  
          });
        this.dragSourceItem.remove();
        this.activeEvent = null;
        this.dragSourceItem = null;
        this.sourceInfoItem = null;
      }
      this.removeDropOverClass();
      Utils.selecting(true);
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
        this.form.inDropZone(dropZone.getBoundingClientRect(), this.dragSourceItem, dropZone);
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
        case 'returnDropZone':
        case 'typeDropZone': 
          if(id === this.sourceInfoItem.type) {
            target.innerHTML = `<h5 data-define='${JSON.stringify({ val: this.sourceInfoItem.val, id })}'>${this.sourceInfoItem.val}</h5>`;           
            this.checkReturnType(); 
          }
          break;
        default:
          if(id === this.sourceInfoItem.type) 
            this.showTextForm(target);
      }
    }
    
    checkReturnType() {
      if(this.sourceInfoItem.type === 'returnDropZone') {
        const typeContainer = document.querySelector('#typeContainer');
        if(this.sourceInfoItem.val === 'void') {
          typeContainer.classList.add('hide');
          document.querySelector('#typeDropZone').innerHTML = `<h5 data-define='${JSON.stringify({ val: "Normal", id:"typeDropZone" })}'>Normal</h5>`
        } else {
            typeContainer.classList.remove('hide');
        }
      }  
      this.form.buildAndShowExpression();
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
      if(!this.validName(value)) return;
      element.innerHTML = `<h5 data-define='${JSON.stringify({ val: value, id: element.id })}'>${value}</h5>`; 
      this.textBtn.removeEventListener('click', this.handleTextForm.bind(this, element)); 
      document.querySelector('#overlayTextform').remove();
      this.form.buildAndShowExpression();
    }
    
    templateTextForm(id) {
      const title = 'Function name';
      return (
        `<div class="wizard-box-edit-dialog" style="border:3px solid #f3610a;">
           <h4>${title}</h4>
           <input type="text" id="customInput" name="customInput" value='' />
           <p id="functionExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
           <button id="textBtn">add</button> 
         </div>`);
    }
    
    validName(value) {
      if(Utils.isEmpty(value)) {
        this.form.displayExpressionError('functionExpressionError', 'Expression is empty');
        return false;
      }
      if(isNaN(value[0]) && value[0] === value[0].toUpperCase()) {
        this.form.displayExpressionError('functionExpressionError', `function name "${value}" start with uppercase character`);
        return false;
      }
      if (!/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(value)) {
        this.form.displayExpressionError('functionExpressionError', `function name "${value}" contains ilegal characters`);
        return false;
      }
      if (this.form.reservedWords.includes(value)) {
        this.form.displayExpressionError('functionExpressionError', `function name "${value}" is a reserved word`);
        return false;
      }
      return true;
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
      this.overlay[listenType]('mousedown', this.handleMouseDown.bind(this));
      this.overlay[listenType]('mousemove', this.handleMouseMove.bind(this));
      this.overlay[listenType]('mouseup', this.handleMouseUp.bind(this));
      this.nameDropZone[listenType]('click', this.handleClickNameZone.bind(this));
    }
}