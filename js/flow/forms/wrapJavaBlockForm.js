class WrapJavaBlockForm extends WrapBlockForm {
  constructor(canvas, values, formType, wrappedBlocks, index, selectedBlocks) {
    super(canvas, values, formType, wrappedBlocks, index, selectedBlocks);
    this.returnTypes = ['Normal', 'Array', 'MultiDimensional Array'];
    this.functionTypes = ['void', 'String', 'char', 'byte', 'short', 'int', 'long', 'float', 'double', 'boolean'];
    this.reservedWords = ['scanner', 'Class','String', 'char', 'byte', 'short', 'int', 'long', 'float', 'double', 'boolean', 'void'];
    this.preDefinedParams = ['Scanner'];
  }
  
  listenerByLang() {    
    this.handlerRadioOptions();
    this.returnFunctionType = document.querySelector('#returnFunctionType');
    this.returnFunctionType.addEventListener('change', this.handlerReturnFunctionType.bind(this));
  }
  
  firstTabTemplate() {
    const functionType = this.values ? this.values.returnFunctionType : 'void';
    const returnType = this.values && this.values.returnType ? this.values.returnType : 'Normal';
    return (`<div style="font-size:1.4em; margin-top:5px;">Name</div>
       <input type="text" id="name" name="name" value='${this.values ? `${this.values.functionName}` : ``}' required placeholder='function name'  style="width: 95%; padding:8px;" required >
       <div style="margin-top:10px; font-size:1.4em;">Return</div> 
       <select id="returnFunctionType" name="returnFunctionType" style="padding:8px; width: 100%;">
        ${this.functionTypes.map(funcType => (
      `<option value='${funcType}' ${funcType === functionType ? 'selected' : ''}>${funcType}</option>`)).join('')}
       </select>
       <div id="returnTypeContainer" class="${functionType === 'void' ? 'hide' : ''}">
         <div style="font-size:1.4em; margin-top:10px;">Type</div>
         <select id="returnType" name="returnType" style="padding:8px; width: 100%;">
           ${this.returnTypes.map(type => (
        `<option value='${type}' ${type === returnType ? 'selected' : ''}>${type}</option>`)).join('')}
         </select>
       </div>`);
  }

  secondTabTemplate() {
    const variableTypes = this.functionTypes.filter(type => type !== 'void');
    const radioOption = 'createParam';
    return (`<div style="font-size:1.5em; margin-top:10px; margin-bottom:5px;">Parameters options</div>
         <span style="font-size:1.3em; padding:4px;">New/Edit parameter</span><input type="radio" name="optionType" id="createParam" ${radioOption === 'createParam' ? 'checked' : ''}  value="createParam" style="margin-right: 15px; padding:4px; position: relative; top: 2px;">
         <span style="font-size:1.3em; padding:4px;">Pre-defined parameter</span><input type="radio" name="optionType" id="definedParam"  ${radioOption === 'definedParam' ? 'checked' : ''} value="definedParam" style="margin-right: 15px; padding:4px; position: relative; top: 2px;">
         <div id="createContainer" class="${radioOption === 'definedParam' ? 'hide' : ''}">
           <div style="font-size:1.4em; margin-top:10px;">Parameter name</div>
            <input type="text" id="parameterName" name="parameterName" value='' required placeholder='parameter name'  style="width: 95%; padding:8px;" >
            <div style="margin-top:10px; font-size:1.4em;">Parameter type</div> 
            <select id="parameterDeclarationType" name="parameterDeclarationType" style="padding:8px; width: 100%;">
              ${variableTypes.map(funcType => (
      `<option value='${funcType}' ${funcType === "String" ? 'selected' : ''}>${funcType}</option>`)).join('')}
            </select>
            <div style="font-size:1.4em; margin-top:10px;">Type</div>
            <select id="parameterType" name="parameterType" style="padding:8px; width: 100%;">
             ${this.returnTypes.map(type => (
        `<option value='${type}' ${type === "Normal" ? 'selected' : ''}>${type}</option>`)).join('')}
            </select>
          </div>
          <div id="definedContainer" class="${radioOption === 'createParam' ? 'hide' : ''}">
          <div style="margin-top:10px; font-size:1.4em;">Parameter type</div> 
            <select id="definedParameterName" name="definedParameterName" style="padding:8px; width: 100%;">
              ${this.preDefinedParams.map(param => (
          `<option value='${param}'>${param}</option>`)).join('')}
            </select>
          </div>
          <button id="addFuncParameter">Add</button>
          <ul id="draggableParamContainer custom-gray-scroll"></ul>`);
  }
  
  handlerRadioOptions() {
    const radios = document.querySelectorAll('input[name="optionType"]');
    radios.forEach(radio => {
      radio.addEventListener('change', e => {
        const option = e.target.value;
        const createContainer = document.querySelector('#createContainer');
        const definedContainer = document.querySelector('#definedContainer');
        switch (option) {
          case 'createParam':
            definedContainer.classList.add('hide');
            createContainer.classList.remove('hide');
            break;
          case 'definedParam':
            createContainer.classList.add('hide');
            definedContainer.classList.remove('hide');
            this.setDefaultEditParamProps();
            break;
        }
      });
    });
  }
  
  backRadioOptionToDefault() {
    const radios = document.querySelectorAll('input[name="optionType"]');
    document.querySelector('#definedContainer').classList.add('hide');
    document.querySelector('#createContainer').classList.remove('hide');
    radios[0].checked = true;
  }
  
  handlerReturnFunctionType(ev) {
    this.returnTypeContainer = document.querySelector('#returnTypeContainer');
    if (ev.target.value !== 'void') {
      this.returnTypeContainer.classList.remove('hide');
    } else {
      this.returnTypeContainer.classList.add('hide');
    }
  }
  
  getNewFunction({ id, tabId, prev, name, returnFunctionType, returnType, params, bgColor, lineColor, fontColor } ) {
    const paramsString = params.map(param => this.getParameterString(param.name, param.declarationType, param.declaration)).join(', ');
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
        params
      }
    }  
  }
  
  getEditedFunction({ id, tabId, name, returnFunctionType, returnType, params, bgColor, lineColor, fontColor }) {
    const paramsString = params.map(param => this.getParameterString(param.name, param.declarationType, param.declaration)).join(', ');
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
        params
      }
    }
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
  
  validateFunction(name, returnFunctionType, returnType, parameters) {
    const currentId = this.index !== -1 ? this.c.program[this.index].id : this.index;
    const blocks = this.c.tabs[1].api.program['1'].blocks;
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
              return { hasError: true, message: `method <span class="prj-name color-red">${returnFunctionType} ${this.getReturnType(returnType)}${name}(${paramsString})</span> is already defined` };
            }
          }
        }
      }
    }
    return { hasError: false };
  }
  
}