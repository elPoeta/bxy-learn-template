class WrapBlockForm {
  constructor(canvas, values, formType, wrappedBlocks, index, selectedBlocks) {
    this.c = canvas;
    this.values = values;
    this.formType = formType; 
    this.wrappedBlocks = wrappedBlocks || '[]';
    this.index = index || -1;
    this.selectedBlocks = selectedBlocks || [];
    this.body = document.querySelector('body');
    this.currentTab = 0;
    this.dragClass = 'draggable-param';
    this.dragSrcEl = null;
    this.swap = false;
    this.updateParam = { id: null, isEditing: false };
  }

  showModal(title) {
    const template = this.template(title);
    this.div = document.createElement('div');
    this.div.setAttribute('class', 'overlay');
    this.div.innerHTML = template;
    this.body.appendChild(this.div);
    this.addListeners();
    this.listenerByLang();
    this.showTab();
  }

  template(title) {
    return (`<span class="closeOverlay" id="closeFlowSettings">×</span>
      <div id="window-dim-code" class="window-dim-code-default">
        <div id="window-code" class="window-modal">
          <h2>${title}</h2>
          <form id="wrapForm" name="wrapForm" class="form-wrap-function">
            <div class="tab-multi-form">
              ${this.firstTabTemplate()}
            </div>
            <div class="tab-multi-form">
              ${this.secondTabTemplate()}
            </div>
            <div class="tab-multi-form">
              ${this.thirdTabTemplate()}
            </div>
            <div style="overflow:auto;">
              <div style="float:right;">
                <button type="button" id="prevBtn">Previous</button>
                <button type="button" id="nextBtn">Next</button>
              </div>
            </div>
            <div style="text-align:center;margin-top:20px;">
              <span class="step-form"></span>
              <span class="step-form"></span>
              <span class="step-form"></span>
            </div>
          </form>
        </div>
      </div>`);
  }

  thirdTabTemplate() {
    const bgColor = this.values ? this.values.bgColor : configEditor.flow.customizedBlocks.wrapBlock.blockColor;
    const lineColor = this.values ? this.values.lineColor : configEditor.flow.customizedBlocks.wrapBlock.lineColor;
    const fontColor = this.values ? this.values.fontColor : configEditor.flow.customizedBlocks.wrapBlock.fontColor;
    return (`<div style="font-size:1.4em; margin-top:5px;">Colors</div>
      <div style="display: flex; justify-content: space-evenly; align-items: center;">
        <p>Background </p>
        <input type="color" id="backgroundColor" name="backgroundColor" value="${bgColor}"/>
        <p>Line </p>
        <input type="color" id="lineColor" name="lineColor" value="${lineColor}"/>
        <p>Font </p>
        <input type="color" id="fontColor" name="fontColor" value="${fontColor}"/>
      </div>
      ${!this.values ?
        `<div style="margin: 10px; font-size: 1.3em; display: flex; align-items: center;">create and open &nbsp;<input type="checkbox" id="isOpen" name="isOpen"/></div>` : ''
      }`);
  }
  
  addListeners() {
    this.handlerModal();
    this.dragAndDropListener();
    this.listenerByLang();
    this.addParams();
    this.prevBtn = document.querySelector('#prevBtn');
    this.nextBtn = document.querySelector('#nextBtn');
    this.tabs = document.querySelectorAll(".tab-multi-form");
    this.stepForm = document.querySelectorAll(".step-form");
    this.prevBtn.addEventListener('click', this.handlerNextPrevBtn.bind(this));
    this.nextBtn.addEventListener('click', this.handlerNextPrevBtn.bind(this));
    this.addParameter = document.querySelector('#addFuncParameter');
    this.addParameter.addEventListener('click', this.handlerAddParameter.bind(this));
  }
  
  listenerByLang() {
    return false;
  }
  
  dragAndDropListener() {
    const listItems = document.querySelectorAll(`.${this.dragClass}`);
    [].forEach.call(listItems, item => {
      this.addEventsDragAndDrop(item);
    });
  }

  addParams() {
    if (this.values) {
      this.values.params.forEach(param => {
        const { name, declarationType, type } = param;
        this.addNewItem(name, declarationType, type);
      });
    }
  }
  
  handlerNextPrevBtn(ev) {
    const btnId = ev.target.getAttribute('id');
    let n = btnId === 'nextBtn' ? 1 : -1;
    if (n === 1 && !this.validateForm(btnId)) return false;
    this.tabs[this.currentTab].style.display = "none";
    this.currentTab = this.currentTab + n;
    if (this.currentTab >= this.tabs.length) {
      const isSubmitted = this.submitForm(ev);
      if (isSubmitted) {
        return false;
      }
      this.currentTab = this.tabs.length - 1;
    }
    this.showTab();
  }
  
  showTab() {
    this.tabs[this.currentTab].style.display = "block";
    if (this.currentTab === 0) {
      this.prevBtn.style.display = "none";
    } else {
      this.prevBtn.style.display = "inline";
    }
    if (this.currentTab === (this.tabs.length - 1)) {
      this.nextBtn.innerHTML = "Accept";
    } else {
      this.nextBtn.innerHTML = "Next";
    }
    this.fixStepIndicator();
  }

  fixStepIndicator() {
    const stepForm = document.querySelectorAll(".step-form");
    stepForm.forEach(step => {
      step.className = step.className.replace(" active", "");
    });
    stepForm[this.currentTab].className += " active";
  }

  validateForm(target) {
    let valid = true;
    const inputs = this.tabs[this.currentTab].querySelectorAll("input");
    if(this.currentTab === 1 && target === 'addFuncParameter' ) {
      const inputName = document.getElementById('parameterName');
      if (this.validateParams(inputName.value)) {
        inputName.className += " invalid";
        return false;
      } else {
        inputName.classList.remove("invalid");
        return true;
      } 
    } else if(this.currentTab !== 1) {
        for (let i = 0; i < inputs.length; i++) {
          if (inputs[i].getAttribute('type') === 'text' && 
              this.validateParams(inputs[i].value)) {
            inputs[i].className += " invalid";
            valid = false;
        }
      }
    }
    if (valid) {
      this.stepForm[this.currentTab].className += " finish";
    }
    return valid;
  }
  
  validateFuncName(value) {
    if (Utils.isEmpty(value) || this.hasWhiteSpace(value)) {
      return true;
    }
    if (!/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(value)) {
      return true;
    }
    if (/[A-Z]/.test(value.charAt(0))) {
      return true;
    }
    return false;
  }

  validateParams(value) {
    if (Utils.isEmpty(value) || this.hasWhiteSpace(value)) {
      return true;
    }
    if (!/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(value)) {
      return true;
    }
    if (this.reservedWords.includes(value)) {
      return true;
    }
    if (/[A-Z]/.test(value.charAt(0))) {
      return true;
    }
    const params = this.getParamsForm(true);
    for (let i = 0; i < params.length; i++) {
      if (!this.updateParam.isEditing) {
        if (params[i].name === value) return true;
      } else {
        if (params[i].name === value && this.updateParam.id !== params[i].id) return true;
      }
    }
    return false;
  }
  
  hasWhiteSpace(str) {
    return /\s/g.test(str);
  }
  
  handlerAddParameter(ev) {
    ev.preventDefault()
    const btnId = ev.target.getAttribute('id');
    const radios = [...document.querySelectorAll('input[name="optionType"]')];
    if(!radios.length) {
      radios.push({ checked: true });
    } 
    if (radios[0].checked && !this.validateForm(btnId)) return false;
    const { error, parameterName, parameterDeclarationType, parameterType } = this.getParamByRadioOption(radios);
    if (error) {
      Dialog.noticeDialog({ title: "Message", text: `parameter <span class="prj-name color-red">${parameterName}</span> is already used`, isExamSubmission: false });
      return false;
    }
    if (!this.updateParam.isEditing) {
      this.addNewItem(parameterName, parameterDeclarationType, parameterType);
    } else {
      if (this.updateParam.id) {
        const li = document.getElementById(this.updateParam.id);
        [...li.childNodes][0].nodeValue = this.getParameterString(parameterName, parameterDeclarationType, parameterType);
        li.setAttribute('data-paramname', parameterName);
        li.setAttribute('data-paramdec', parameterDeclarationType);
        li.setAttribute('data-paramtype', parameterType);
      }
      this.setDefaultEditParamProps();
    }
    document.querySelector('#parameterName').value = '';
  }

  submitForm(ev) {
    ev.preventDefault();
    const formValues = this.getFormValues();
    if (formValues.error.hasError) {
      Dialog.noticeDialog({ title: "Message", text: formValues.error.message, isExamSubmission: false });
      return false;
    }
    const tabId = !this.values ? Date.now().toString() : this.values.tabId;
    if (this.formType !== 'edit') {
      this.updateFunctionRepository(formValues, tabId);
    }
    if (this.formType === 'wrap_block') {
      this.createTabFromEdition(formValues, tabId);
    } else if (this.formType === 'wrap_select') {
      this.createTabFromSelection(formValues, tabId);
    } else if (this.formType === 'new_empty') {
      this.c.loadTab();
      //this.c.createTab(tabId, formValues.name, 'f_body', {}, '[]', formValues.isOpen);
      this.c.createTab(tabId, formValues.name, 'f_body', '[]', formValues.isOpen);
    } else if(this.formType === 'edit') {
      this.editedFunctionRepository(formValues, tabId);
      this.c.loadTab();
    }
    this.removeOverlay();
    return true;
  }
  
  getParamByRadioOption(radios) {
    const form = document.forms.namedItem("wrapForm");
    const formData = new FormData(form);
    if (radios[0].checked) {
      return { error: false, parameterName: formData.get('parameterName'), parameterDeclarationType: formData.get('parameterDeclarationType'), parameterType: formData.get('parameterType') };
    }
    let parameterName = formData.get('definedParameterName');
    parameterName = parameterName.charAt(0).toLowerCase() + parameterName.slice(1);
    const params = this.getParamsForm();
    for (let i = 0; i < params.length; i++) {
      if (parameterName === params[i].name) {
        return { error: true, parameterName, parameterDeclarationType: '', parameterType: '' }
      }
    }
    return { error: false, parameterName, parameterDeclarationType: formData.get('definedParameterName'), parameterType: 'Class' };
  }
  
  getFormValues() {
    const form = document.forms.namedItem("wrapForm");
    const formData = new FormData(form);
    const name = formData.get('name');
    const returnFunctionType = formData.get('returnFunctionType');
    const returnType = returnFunctionType !== 'void' ? formData.get('returnType') : null;
    const bgColor = formData.get('backgroundColor');
    const lineColor = formData.get('lineColor');
    const fontColor = formData.get('fontColor');
    const isOpen = formData.get('isOpen');
    const ul = document.querySelector('#draggableParamContainer')
    const params = this.getParamsForm();
    const error = this.validateFunction(name, returnFunctionType, returnType, params);
    return { error, name, returnFunctionType, returnType, params, bgColor, lineColor, fontColor, isOpen };
  }
  
  getParamsForm(isValidate=false) {
    const ul = document.querySelector('#draggableParamContainer')
    const params = [];
    Array.from(ul.children).forEach(li => {
      const name = li.getAttribute('data-paramname');
      const declarationType = li.getAttribute('data-paramdec');
      const type = li.getAttribute('data-paramtype');
      if(!isValidate) {
        params.push({ name, declarationType, type });        
      } else {
        const id = li.getAttribute('id');
        params.push({ id, name, declarationType, type })
      }
    });
    return params;
  }
  
  updateFunctionRepository(formValues, tabId) {
    const { name, returnFunctionType, returnType, params, bgColor, lineColor, fontColor } = formValues;
    const repoApiTab = this.c.tabs[1].api.program['1'].blocks;
    const id = this.formType === 'new_empty' ? this.c.program[this.index].id : flowChartEditor.uuid();
    const prev = this.formType === 'new_empty' ? this.c.blockState.get(this.c.program[this.index].id).lastHook : "start-id";
    const newFunction = this.getNewFunction({ id, tabId, prev, name, returnFunctionType, returnType, params, bgColor, lineColor, fontColor } );
    if (!repoApiTab.length) {
      this.c.tabs[1].api.program['1'].blocks.push(newFunction);
    } else {
      if (this.formType === 'new_empty') {
        const idx = this.c.tabs[1].api.program['1'].blocks.findIndex(block => block.id === id);
        this.c.tabs[1].api.program['1'].blocks[idx] = newFunction;
      } else {
        this.c.tabs[1].api.program['1'].blocks[0].prev = id;
        this.c.tabs[1].api.program['1'].blocks.unshift(newFunction);
      }
    }
  }
  
  editedFunctionRepository(formValues, tabId) {
    const { name, returnFunctionType, returnType, params, bgColor, lineColor, fontColor } = formValues;
    const id = this.c.program[this.index].id;
    const idxTab = this.c.tabs[1].api.program['1'].blocks.findIndex(block => block.id === id);
    const editedFunction = this.getEditedFunction({ id, tabId, name, returnFunctionType, returnType, params, bgColor, lineColor, fontColor });  
    this.c.tabs[1].api.program['1'].blocks[idxTab] = { ...this.c.tabs[1].api.program['1'].blocks[idxTab], ...editedFunction };
    const indexTabBody = this.c.tabs.findIndex(tab => tab.id === tabId);
    if (this.c.tabs[indexTabBody].name !== name) {
      this.c.tabs[indexTabBody].name = name;
      if (this.c.tabs[indexTabBody].isOpened) {
        document.getElementById(`${tabId}`).title = name;
        document.querySelector(`#tabName-${tabId}`).innerText = name;
      }
    }
  }
  
  createTabFromEdition(formValues, tabId) {
    if (!formValues) return false;
    const state = this.c.blockState.get(this.c.program[this.index].id);
    this.removeBlockEdition();
    this.createFunctionBlock({ state, formValues, tabId });
  }
  
  createTabFromSelection(formValues, tabId) {
    if (!formValues) return false;
    const state = this.c.blockState.get(this.selectedBlocks[0].id);
    this.removeBlockSelection();
    this.createFunctionBlock({ state, formValues, tabId });
  }
  
  removeBlockEdition() {
    this.c.eventHandler.removeBlockFromGraph(this.c.program[this.index], this.index);
    this.c.eventHandler.moveBlocksBeforeDraw();
  }
  
  removeBlockSelection() {
    this.selectedBlocks.forEach(block => {
      const index = this.c.program.findIndex(b => b.id === block.id)
      if (index > 1) {
        this.c.eventHandler.removeBlockFromGraph(this.c.program[index], index);
        this.c.eventHandler.moveBlocksBeforeDraw();
      }
    });
  }
  
  createFunctionBlock({ state, formValues, tabId }) {
    const { name, returnFunctionType, returnType, params, bgColor, lineColor, fontColor, isOpen } = formValues;
    const { w, h } = flowChartEditor.API.getWidthAndHeigthBlock("wrapBlock");
    flowChartEditor.API.createNewProgram(flowChartEditor.uuid(), 'wrapBlock', 0, 0, w, h, "", 'function_calling');
    const indexHook = this.c.program.findIndex(block => block.id === state.lastHook);
    const indexRing = this.c.program.length - 1;
    const hookArrowIndex = flowChartEditor.API.getIndexHook(this.c.program[indexHook].type, state.arrowHook);
    this.c.program[indexRing].x = this.c.eventHandler.setXOnDrop(this.c.program[indexRing], this.c.program[indexHook], state.arrowHook);
    this.c.program[indexRing].y = this.c.program[indexHook].hooks[hookArrowIndex].y;
    this.c.program[indexRing].setColors({ bgColor, lineColor, fontColor });
    this.c.program[indexRing].code = `${name}(${params.map(param => param.name).join(', ')})`;
    this.c.program[indexRing].tabId = tabId;
    this.c.program[indexRing].returnFunctionType = returnFunctionType;
    this.c.program[indexRing].returnType = returnType;
    this.c.program[indexRing].params = params;
    this.c.program[indexRing].functionName = name;
    this.c.interceptedProgram = { programRing: this.c.program[indexRing], programHook: this.c.program[indexHook], arrowType: state.arrowHook };
    this.c.eventHandler.dropInterceptedProgram();
    this.c.updateCanvas();
    //this.c.createTab(tabId, name, 'f_body', {}, this.wrappedBlocks, isOpen);
    this.c.createTab(tabId, name, 'f_body', this.wrappedBlocks, isOpen);
  }
  
  handlerModal() {
    document.querySelector('#closeFlowSettings')
      .addEventListener('click', e => {
        this.removeOverlay();
      });
  }

  removeOverlay() {
    this.div.remove();
    this.c.updateCanvas();
  }
  
  addEventsDragAndDrop(el) {
    el.addEventListener('dragstart', this.dragStart.bind(this), false);
    el.addEventListener('dragenter', this.dragEnter.bind(this), false);
    el.addEventListener('dragover', this.dragOver.bind(this), false);
    el.addEventListener('dragleave', this.dragLeave.bind(this), false);
    el.addEventListener('drop', this.dragDrop.bind(this), false);
    el.addEventListener('dragend', this.dragEnd.bind(this), false);
  }

  dragStart(ev) {
    this.setDefaultEditParamProps();
    const li = ev.target;
    if (li.tagName &&  li.tagName.toLowerCase() === 'li') {
      this.dragSrcEl = li;
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('text/html', li.innerHTML);
      ev.dataTransfer.setData('text/plain', ev.target.id);
    }
  }

  dragEnter(ev) {
    ev.preventDefault();
    const li = ev.target;
    if (li.tagName && li.tagName.toLowerCase() === 'li') {
      li.classList.add('over-drag');
    }
  }

  dragLeave(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const li = ev.target;
    if (li.tagName && li.tagName.toLowerCase() === 'li') {
      li.classList.remove('over-drag');
    }
  }

  dragOver(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    return false;
  }

  dragDrop(ev) {
    ev.preventDefault();
    const li = ev.target;
    if (this.dragSrcEl != li && (li.tagName && li.tagName.toLowerCase() === 'li')) {
      const id = li.id;
      const paramNameLi = li.getAttribute('data-paramname');
      const paramNameSrc = this.dragSrcEl.getAttribute('data-paramname');
      const paramDecLi= li.getAttribute('data-paramdec');
      const paramDecSrc = this.dragSrcEl.getAttribute('data-paramdec');
      const paramTypeLi = li.getAttribute('data-paramtype');
      const paramTypeSrc = this.dragSrcEl.getAttribute('data-paramtype');
      this.dragSrcEl.innerHTML = li.innerHTML;
      li.innerHTML = ev.dataTransfer.getData('text/html');
      li.setAttribute('id', ev.dataTransfer.getData('text/plain'));
      li.setAttribute('data-paramname', paramNameSrc);
      li.setAttribute('data-paramdec', paramDecSrc);
      li.setAttribute('data-paramtype', paramTypeSrc);
      this.dragSrcEl.setAttribute('id', id);
      this.dragSrcEl.setAttribute('data-paramname', paramNameLi);
      this.dragSrcEl.setAttribute('data-paramdec', paramDecLi);
      this.dragSrcEl.setAttribute('data-paramtype', paramTypeLi);
      this.swap = true;
    }
    return false;
  }

  dragEnd(ev) {
    ev.preventDefault();
    const listItems = document.querySelectorAll(`.${this.dragClass}`);
    listItems.forEach(item => {
      item.classList.remove('over-drag');
    });
    const li = ev.target;
    li.style.opacity = '1';
    if (this.swap) {
      const actions = document.querySelectorAll(`.${this.dragClass} i`);
      actions.forEach(action => {
        action.addEventListener('click', this.handlerParameter.bind(this), true);
      });
      this.swap = false;
    }
  }

  addNewItem(parameterName, parameterDeclarationType, parameterType) {
    const id = Date.now().toString();
    const idAttr = document.createAttribute('id');
    idAttr.value = id;
    const li = document.createElement('li');
    const attr = document.createAttribute('draggable');
    const editIcon = document.createElement('i');
    const trashIcon = document.createElement('i');
    editIcon.innerHTML = parameterType !== 'Class' ? `<svg class="icon-svg edit-param" style="fill:#2c3141" data-actionparam="${id}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <path class="edit-param" data-actionparam="${id}"  d="M17.561 2.439c-1.442-1.443-2.525-1.227-2.525-1.227l-12.826 12.825-1.010 4.762 4.763-1.010 12.826-12.823c-0.001 0 0.216-1.083-1.228-2.527zM5.68 17.217l-1.624 0.35c-0.156-0.293-0.345-0.586-0.69-0.932s-0.639-0.533-0.932-0.691l0.35-1.623 0.47-0.469c0 0 0.883 0.018 1.881 1.016 0.997 0.996 1.016 1.881 1.016 1.881l-0.471 0.468z"></path>
    </svg>` : '';
    trashIcon.innerHTML = `<svg class="icon-svg delete-param" style="fill:red" data-actionparam="${id}"  version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <path class="delete-param" data-actionparam="${id}" d="M3.389 7.113l1.101 10.908c0.061 0.461 2.287 1.977 5.51 1.979 3.225-0.002 5.451-1.518 5.511-1.979l1.102-10.908c-1.684 0.942-4.201 1.387-6.613 1.387-2.41 0-4.928-0.445-6.611-1.387zM13.168 1.51l-0.859-0.951c-0.332-0.473-0.692-0.559-1.393-0.559h-1.831c-0.7 0-1.061 0.086-1.392 0.559l-0.859 0.951c-2.57 0.449-4.434 1.64-4.434 2.519v0.17c0 1.547 3.403 2.801 7.6 2.801 4.198 0 7.601-1.254 7.601-2.801v-0.17c0-0.879-1.863-2.070-4.433-2.519zM12.070 4.34l-1.070-1.34h-2l-1.068 1.34h-1.7c0 0 1.862-2.221 2.111-2.522 0.19-0.23 0.384-0.318 0.636-0.318h2.043c0.253 0 0.447 0.088 0.637 0.318 0.248 0.301 2.111 2.522 2.111 2.522h-1.7z"></path>
    </svg>`;
    if (parameterType !== 'Class') {
      editIcon.setAttribute('data-actionparam', id);
      editIcon.className = 'edit-param';
    }
    trashIcon.setAttribute('data-actionparam', id);
    trashIcon.className = 'delete-param';
    const ul = document.querySelector('#draggableParamContainer');
    li.className = this.dragClass;
    attr.value = 'true';
    li.setAttributeNode(attr);
    li.setAttributeNode(idAttr);
    li.setAttribute('data-paramname', parameterName);
    li.setAttribute('data-paramdec', parameterDeclarationType);
    li.setAttribute('data-paramtype', parameterType);
    li.appendChild(document.createTextNode(`${this.getParameterString(parameterName, parameterDeclarationType, parameterType)}`));
    li.appendChild(editIcon);
    li.appendChild(trashIcon);
    ul.appendChild(li);
    this.addEventsDragAndDrop(li);
    this.addEditAndRemoveParameterListener(editIcon, trashIcon, parameterType);
  }

  addEditAndRemoveParameterListener(editIcon, trashIcon, parameterType) {
    if (parameterType !== 'Class') {
      editIcon.addEventListener('click', this.handlerParameter.bind(this), true);
    }
    trashIcon.addEventListener('click', this.handlerParameter.bind(this), true);
  }

  handlerParameter(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const target = ev.target
    if (target.classList.contains('edit-param')) {
      this.backRadioOptionToDefault();
      const id = target.getAttribute('data-actionparam');
      const li = document.getElementById(id);
      const paramName = li.getAttribute('data-paramname');
      const paramDec = li.getAttribute('data-paramdec');
      const paramType = li.getAttribute('data-paramtype');
      this.updateParam = { id, isEditing: true };
      this.addParameter.innerText = 'update';
      document.querySelector('#parameterName').value = paramName;
      if(document.querySelector('#parameterDeclarationType'))
        document.querySelector('#parameterDeclarationType').value = paramDec;
      document.querySelector('#parameterType').value = paramType;
    } else if (target.classList.contains('delete-param')) {
      const id = target.getAttribute('data-actionparam');
      const li = document.getElementById(id);
      Dialog.confirmDialog("Delete parameter",
        `Are you sure that you want to delete param: <span class="prj-name color-red">${li.innerText}</span> ?`,
        "Yes",
        "confirmProjectDeletionButton",
        () => {
          li.firstElementChild.removeEventListener('click', this.handlerParameter.bind(this), true);
          li.lastElementChild.removeEventListener('click', this.handlerParameter.bind(this), true);
          li.remove();
          this.setDefaultEditParamProps();
        },
        () => { });
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
  
  setDefaultEditParamProps() {
    this.addParameter.innerText = 'add';
    this.updateParam = { id: null, isEditing: false };
    document.querySelector('#parameterName').value = '';
  }
  
}