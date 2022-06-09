class WrapJavascriptBlockForm extends WrapBlockForm {
  constructor(canvas, values, formType, wrappedBlocks, index, selectedBlocks) {
    super(canvas, values, formType, wrappedBlocks, index, selectedBlocks);
    this.returnTypes = ['Normal', 'Array', 'MultiDimensional Array'];
    this.reservedWords = ['Class', 'args', 'function', 'var', 'let', 'const', 'GET', 'prompt', 'readLine', 'PRINTLN', 'PRINT', 'print', 'alert', 'doNotUseThisName', 'yield', 'highlightBlock'];
  }

  firstTabTemplate() {
    return (`<div style="font-size:1.4em; margin-top:5px;">Name</div>
            <input type="text" id="name" name="name" value='${this.values ? `${this.values.functionName}` : ``}' required placeholder='function name'  style="width: 95%; padding:8px;" required >
          `);
  }

  secondTabTemplate() {
    return (`<div style="font-size:1.4em; margin-top:10px;">Parameter name</div>
            <input type="text" id="parameterName" name="parameterName" value='' required placeholder='parameter name'  style="width: 95%; padding:8px;" >
            <div style="font-size:1.4em; margin-top:10px;">Type</div>
            <select id="parameterType" name="parameterType" style="padding:8px; width: 100%;">
             ${this.returnTypes.map(type => (
        `<option value='${type}' ${type === "Normal" ? 'selected' : ''}>${type}</option>`)).join('')}
            </select>
          <button id="addFuncParameter">Add</button>
          <ul id="draggableParamContainer custom-gray-scroll"></ul>`);
  }
  
  getNewFunction({ id, tabId, prev, name, returnFunctionType, returnType, params, bgColor, lineColor, fontColor } ) {
    const paramsString = params.map(param => this.getParameterString(param.name, param.declarationType, '')).join(', ');
    const code = `${name}(${paramsString})`;
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
        params
      }
    }  
  }
  
  getEditedFunction({ id, tabId, name, returnFunctionType, returnType, params, bgColor, lineColor, fontColor }) {
    const paramsString = params.map(param => this.getParameterString(param.name, param.declarationType, '')).join(', ');
    const code = `${name}(${paramsString})`;
    return {
      code,
      vars: {
        wrapType: "function_declaration",
        tabId,
        bgColor,
        lineColor,
        fontColor,
        functionName: name,
        params
      }
    }
  }

  getParameterString(parameterName, parameterDeclarationType, parameterType) {
    switch (parameterType) {
      case 'MultiDimensional Array':
        return `${parameterName} [][]`;
      case 'Array':
        return `${parameterName} []`;
      default:
        return `${parameterName}`;
    }
  }
  
  validateFunction(name, returnFunctionType, returnType, parameters) {
    const currentId = this.index !== -1 ? this.c.program[this.index].id : this.index;
    const blocks = this.c.tabs[1].api.program['1'].blocks;
    for (let i = 0; i < blocks.length; i++) {
      const { functionName, params } = blocks[i].vars;
      if (blocks[i].id !== currentId) {
        if (functionName === name) {
          const paramsString = params.map(param => this.getParameterString(param.name, param.declarationType, '')).join(', ');
          return { hasError: true, message: `method <span class="prj-name color-red">${name}(${paramsString})</span> is already defined` };
        }
      }
    }
    return { hasError: false };
  }
  
  backRadioOptionToDefault() {
    return false;
  }
}