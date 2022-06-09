class InputBlockJavascript extends InputBlock {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.reservedWords = ['Class', 'args', 'function', 'var', 'let', 'const', 'GET', 'prompt', 'readLine', 'PRINTLN', 'PRINT', 'print', 'alert', 'doNotUseThisName', 'yield', 'highlightBlock'];
    this.variableDeclaration = ['String', 'int', 'float'];
    this.declaration = 'String';
    this.expression = '';
    this.variableName = '';
    this.radioOption = 'selectVar';
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
    this.handlerRadioOption();
    this.handlerModalButtons(div);
  }

  templateContent() {
    const stateVariables = [...this.getAllVariableScope()]
                            .map(variable => variable[1])
                            .filter(variable => variable.isInFlow)
                            .filter(variable => variable.declarationType === "Normal");
    return {
      title: 'input',
      help:
        `<p>Options:</p> 
           <p>
             <ul style="margin-left: 25px;">
               <li>Select variable: select variable previously defined</li>
               <li>Define new: define new variable from scratch</li>
             </ul>
           </p>    
         <p>(*) Variable name: variable to assign a user input</p>
         <p>Variable Value input: set initial value</p>
         <p>Expression: info to show</p> 
         <p>(*) use double quotes in the expression field</p> 
         <p>Expression example:</p>
         <p>
           <ul style="margin-left: 25px;">
             <li>"Enter your name: "</li>
           </ul>
         </p>
         <p>(*)- Required fields</p>`,
      styles: `height: 335px; top: -130px; width: max-content; padding: 15px 10px; text-align:left;`,                            
      content:
         `<div style="font-size:1.4em; margin-top:10px; margin-bottom:5px;">Option</div>
         <span style="font-size:1.5em; padding:4px; margin-top:10px;">Select variable</span><input type="radio" name="optionType" id="selectVar" ${this.radioOption === 'selectVar' ? 'checked' : ''}  value="selectVar" style="margin-right: 15px; padding:4px; position: relative; top: 0px;">
         <span style="font-size:1.5em; padding:4px; margin-top:10px;">Define new</span><input type="radio" name="optionType" id="defineMVar"  ${this.radioOption === 'defineVar' ? 'checked' : ''} value="defineVar" style="margin-right: 15px; padding:4px; position: relative; top: 0px;">
         <div id="selectContainer" class="${this.radioOption === 'defineVar' ? 'hide' : ''}">
           <div style="font-size:1.4em; margin-top: 10px;">List of variables</div>
           <select id="variables" name="variables" style="padding:8px; width: 100%;">
             ${!stateVariables.length ?
               `<option disabled selected value='-1'>Define Variable first</option>` :
               `${stateVariables.map(variable => (
                `<option value='${variable.name}'>${variable.declaration} ${variable.name} ${variable.declarationType} | ${variable.scope}</option>`
              )).join('')}`
             }
           </select>
           <p id="selVarError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>variable is required</p>
         </div>
         <div id="defineContainer" class="${this.radioOption === 'selectVar' ? 'hide' : ''}">
          <div style="font-size:1.4em; margin-top: 10px;">Declaration</div> 
          <select id="variableDeclaration" name="variableDeclaration" style="padding:8px; width: 100%;">
            ${this.variableDeclaration.map(variable => (
            `<option value='${variable}' ${variable === this.declaration ? 'selected' : ''}>${variable}</option>`)).join('')}
          </select>
          <div style="font-size:1.4em; margin-top:10px;">Variable name</div>
           <input type="text" id="variableName" name="variableName" required value="${this.variableName}" placeholder='myVarName'  style="width: 95%; padding:8px;">
           <p id="varNameError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>variable name is required and without spaces</p>
          </div>
         <div style="font-size:1.4em; margin-top:5px;">Expression</div>
         <input type="text" id="expression" name="expression" value='${this.expression}' placeholder='Ex: Please enter your name' style="width: 95%; padding:8px;">
         <p id="expressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>expression is required</p>`
    }
  }

  handlerModalButtons(div) {
    document.querySelector('#ok-modal')
      .addEventListener('click', e => {
        e.preventDefault();
        const form = document.forms.namedItem("blockForm");
        const formData = new FormData(form);
        this.radioOption = formData.get('optionType');
        this.declaration = formData.get('variableDeclaration');
        this.variableName = this.radioOption === 'selectVar' ? formData.get('variables') : formData.get('variableName');
        this.expression = formData.get('expression');
        if (this.isFormError()) return;
        const definition = this.radioOption === 'selectVar' ? '' : 'var ';
        this.inputDefineState();
        const getFuncCode = `GET(${this.expression})`;
        const inputCode = this.declaration === 'int' ? `parseInt(${getFuncCode})` : this.declaration === 'float' ? `parseFloat(${getFuncCode})` : getFuncCode;
        this.code = `${definition}${this.variableName} = ${inputCode}`;
        div.remove();
        this.c.updateCanvas();
      });
    document.querySelector('#cancel-modal')
      .addEventListener('click', e => {
        div.remove();
        this.c.updateCanvas();
      });
  }

  inputDefineState() {
    if (this.radioOption === 'defineVar') {
      const varState = [...this.getAllVariableScope()]
                         .map(vs => vs[1])
                         .filter(vs => vs.id === this.id);
      this.declarationType = 'Normal';
      this.setScope(varState);
    } else {
       const comboSelVar = document.querySelector('#variables');
       this.declaration = comboSelVar[comboSelVar.selectedIndex].text.split(' ')[0];
    }
  }

  isFormError() {
    if (this.radioOption === 'selectVar') {
      if (!this.variableName) {
        const selVarError = document.querySelector('#selVarError');
        selVarError.classList.remove('hide');
        return true;
      }
    } else {
      const varNameError = document.querySelector('#varNameError');
      if (Utils.isEmpty(this.variableName) || this.hasWhiteSpace(this.variableName)) {
        varNameError.innerText = 'variable name is required and without spaces';
        varNameError.classList.remove('hide');
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
    }
    if (Utils.isEmpty(this.expression)) {
      const expressionError = document.querySelector('#expressionError');
      expressionError.classList.remove('hide');
      return true;
    }
    return false
  }
}