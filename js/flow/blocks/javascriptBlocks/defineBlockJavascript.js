class DefineBlockJavascript extends DefineBlock {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.reservedWords = ['Class', 'args', 'function', 'var', 'let', 'const', 'GET', 'prompt', 'readLine', 'PRINTLN', 'PRINT', 'print', 'alert', 'doNotUseThisName', 'yield', 'highlightBlock'];
    this.variableDeclaration = ['String', 'int', 'float', 'boolean'];
    this.declaration = 'String';
    this.variableType = ['Normal', 'Array', 'MultiDimensional Array'];
    this.declarationType = 'Normal';
    this.variableName = '';
    this.variableValue = '';
  }

  modal() {
    const template = this.genericTemplate(this.templateContent());
    const div = document.createElement('div');
    div.setAttribute('class', 'overlay');
    div.innerHTML = template;
    document.querySelector('body').appendChild(div);
    this.edit();
    this.c.updateCanvas();
    document.getElementById("text-box").style.display = "none";
    document.getElementById("text").value = "";
    this.handlerModalButtons(div);
  }

  templateContent() {
    return {
      title: 'define',
      help:
         `<p>Declaration: declaration type variable (only Normal type)</p>
          <p>Type: type of variable</p>   
          <p>(*) Variable name input: define var name</p>
           <p>Variable Value input: set initial value</p>
           <p>-For string or char value use "", ex: "myVar"</p>  
           <p>Value examples:</p> 
           <p>
             <ul style="margin-left: 25px;">
               <li>100</li>
               <li>"browxy"</li>
               <li>true</li>
               <li>Array: 10,20,30</li>
               <li>Multidemensional Array: [10,20,30],[40,50,60],[70,80,90]</li>
              </ul>
           </p>
           <p>(*)- Required fields</p>`,
      styles: `height: 375px; top: -145px; width: max-content; padding: 15px 10px; text-align:left;`,                           
      content:
        `<div style="font-size:1.4em;">Declaration</div> 
        <select id="variableDeclaration" name="variableDeclaration" style="padding:8px; width: 100%;">
          ${this.variableDeclaration.map(variable => (
          `<option value='${variable}' ${variable === this.declaration ? 'selected' : ''}>${variable}</option>`)).join('')}
        </select>   
        <div style="font-size:1.4em; margin-top:10px;">Type</div>
          <select id="declarationType" name="declarationType" style="padding:8px; width: 100%;">
             ${this.variableType.map(type => (
          `<option value='${type}' ${type === this.declarationType ? 'selected' : ''}>${type}</option>`)).join('')}
          </select>
          <div style="font-size:1.4em; margin-top:10px;">Variable name</div>
          <input type="text" id="variableName" name="variableName" required value='${this.variableName}' placeholder='myVarName'  style="width: 95%; padding:8px;">
          <p id="varNameError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>variable name is required and without spaces</p>
          <div style="font-size:1.4em; margin-top:10px;">Variable Value/s</div>
          <input type="text" id="variableValue"  name="variableValue" value='${this.variableValue.replace(/^\[/, "").replace(/\]$/, "").replace(/'/g, "&apos;")}' placeholder="10" style="width: 95%;padding:8px;">`
    }
  }

  handlerModalButtons(div) {
    document.querySelector('#ok-modal')
      .addEventListener('click', e => {
        e.preventDefault();
        const varState = [...this.getAllVariableScope()].map(vs => vs[1]).filter(vs => vs.id === this.id);
        const form = document.forms.namedItem("blockForm");
        const formData = new FormData(form);
        this.declaration = formData.get('variableDeclaration');
        this.declarationType = formData.get('declarationType');
        this.variableName = formData.get('variableName');
        this.variableValue = formData.get('variableValue');
        if (this.isErrorForm()) return;
        this.code = this.getCode();
        this.setScope(varState);
        div.remove();
        this.c.updateCanvas();
      });
    document.querySelector('#cancel-modal')
      .addEventListener('click', e => {
        div.remove();
        this.c.updateCanvas();
      });
  }
  
  getCode() {
    let code = '';
    switch (this.declarationType) {
      case 'Normal':
        code = Utils.isEmpty(this.variableValue) ?
          `var ${this.variableName}` :
          `var ${this.variableName} = ${this.variableValue}`;
        break;
      case 'Array':
        code = Utils.isEmpty(this.variableValue) ?
          `var ${this.variableName} = []` :
          `var ${this.variableName} = [${this.variableValue}]`;
        break;
      default:
        code = Utils.isEmpty(this.variableValue) ?
          `var ${this.variableName} = []` :
          `var ${this.variableName} = [${this.variableValue}]`;
        break;
    }
    return code;
  }
  
  isErrorForm() {
    const varNameError = document.querySelector('#varNameError');
    if (Utils.isEmpty(this.variableName) || this.hasWhiteSpace(this.variableName)) {
      varNameError.classList.remove('hide');
      varNameError.innerText = 'variable name is required and without spaces';
      return true;
    }
    if(isNaN(this.variableName[0]) && this.variableName[0] === this.variableName[0].toUpperCase()) {
      varNameError.classList.remove('hide');
      varNameError.innerText = `variable name "${this.variableName}" start with uppercase character`;
      return true;   
    }
    if (!/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(this.variableName)) {
      varNameError.classList.remove('hide');
      varNameError.innerText = `variable name "${this.variableName}" contains ilegal characters`;
      return true;
    }
    if (this.reservedWords.includes(this.variableName)) {
      varNameError.classList.remove('hide');
      varNameError.innerText = `variable name "${this.variableName}" is a reserved word`;
      return true;
    }
    if (this.isInvalidNameInScope()) {
      varNameError.classList.remove('hide');
      varNameError.innerText = `variable name "${this.variableName}" is alrready used`;
      return true;
    }
    return false;
  }
}