class InputBlockJava extends InputBlock {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.radioOption = 'selectVar';
    this.reservedWords = ['scanner', 'Class', 'String', 'char', 'byte', 'short', 'int', 'long', 'float', 'double', 'boolean'];
    this.variableDeclaration = ['String', 'char', 'byte', 'short', 'int', 'long', 'float', 'double', 'boolean'];
    this.variableType = ['Normal'];
    this.declaration = 'String';
    this.variableName = '';
    this.variableValue = '';
    this.declarationType = '';
    this.externalVariableId = '';
    this.userInputEnabled = true;
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
    this.renderWizardBuilder(div);
    this.okBuilderBtn.addEventListener('click', this.handlerWizardOk.bind(this, div));
  }

  templateContent() {
    const stateVariables = [...this.getAllVariableScope()]
      .map(variable => variable[1])
      .filter(variable => variable.isInFlow);
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
         <p>(*) Variables: select variable to assign a user input</p>
         <p>(*) Variable name input: define var name</p>
         <p>Variable Value input: set initial value</p>
         <p>(*)- Required fields</p>`,
      styles: `height: 240px; top: -93px; width: max-content; padding: 15px 10px; text-align:left;`,
      content:
        `<div style="font-size:1.4em; margin-top:10px; margin-bottom:5px;">Option</div>
         <span style="font-size:1.5em; padding:4px;">Select variable</span><input type="radio" name="optionType" id="selectVar" ${this.radioOption === 'selectVar' ? 'checked' : ''}  value="selectVar" style="margin-right: 15px; padding:4px; position: relative; top: 0px;">
         <span style="font-size:1.5em; padding:4px;">Define new</span><input type="radio" name="optionType" id="defineMVar"  ${this.radioOption === 'defineVar' ? 'checked' : ''} value="defineVar" style="margin-right: 15px; padding:4px; position: relative; top: 0px;">
         <div id="selectContainer" class="${this.radioOption === 'defineVar' ? 'hide' : ''}">
           <div style="font-size:1.4em; margin-top: 10px;">Variables</div>
           <select id="variables" name="variables" style="padding:8px; width: 100%;">
             ${!stateVariables.length ?
          `<option disabled selected>Define Variable first</option>` :
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
            <p id="varNameError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
            <div style="font-size:1.4em; margin-top:10px;">Variable Value</div>
            <input type="text" id="variableValue"  name="variableValue" value='${this.variableValue.replace(/^{/, "").replace(/}$/, "").replace(/'/g, "&apos;")}' placeholder="10" style="width: 95%;padding:8px;">
          </div>`
    }
  }

  handlerModalButtons(div) {
    document.querySelector('#ok-modal')
      .addEventListener('click', e => {
        e.preventDefault();
        const form = document.forms.namedItem("blockForm");
        const formData = new FormData(form);
        this.radioOption = formData.get('optionType');
        this.variableName = this.radioOption === 'selectVar' ? formData.get('variables') : formData.get('variableName');
        this.variableValue = formData.get('variableValue');
        this.declaration = formData.get('variableDeclaration');
        if (this.isErrorForm()) return;
        if (this.radioOption === 'selectVar') {
          const varState = [...this.getAllVariableScope()].map(vs => vs[1]).filter(vs => vs.name === this.variableName);
          const declaration = varState.length > 0 ? varState[0].declaration : 'String';
          const varStateId = varState.length > 0 ? varState[0].id : '';
          this.setInputCode(declaration, varStateId);
        } else {
          this.setInputDefineCode();
        }
        this.cleanAndUpdateBlockForm(div);
      });
    document.querySelector('#cancel-modal')
      .addEventListener('click', e => {
        this.cleanAndUpdateBlockForm(div);
      });
  }

  setInputCode(declaration, varStateId) {
    this.code = this.getInputCode(declaration);
    this.userInputEnabled = true;
    this.externalVariableId = varStateId;
    this.setInstanceStatement({ name: 'scanner', value: 'new Scanner(System.in)', declaration: 'Scanner', declarationType: 'Class', used: false });
  }

  getInputCode(declaration) {
    switch (declaration) {
      case 'int':
        return `${this.variableName} = Integer.parseInt(scanner.nextLine())`;
      case 'long':
        return `${this.variableName} = Long.parseLong(scanner.nextLine())`;
      case 'float':
        return `${this.variableName} = Float.parseFloat(scanner.nextLine())`;
      case 'double':
        return `${this.variableName} = Double.parseDouble(scanner.nextLine())`;
      case 'short':
        return `${this.variableName} = Short.parseShort(scanner.nextLine())`;
      case 'byte':
        return `${this.variableName} = scanner.nextByte()`;
      case 'boolean':
        return `${this.variableName} = Boolean.parseBoolean(scanner.nextLine())`;
      case 'char':
        return `${this.variableName} = scanner.next().charAt(0)`;
      default:
        return `${this.variableName} = scanner.nextLine()`;
    }
  }

  setInputDefineCode() {
  	const varState = [...this.getAllVariableScope()].map(vs => vs[1]).filter(vs => vs.name === this.variableName);
    if (Utils.isEmpty(this.variableValue)) {
      const varStateId = varState.length > 0 ? varState[0].id : '';
      this.setInputCode(this.declaration, varStateId);
      this.code = `${this.declaration} ${this.code}`;
    } else {
      this.userInputEnabled = false;
      this.externalVariableId = '';
      this.code = `${this.declaration} ${this.variableName} = ${this.variableValue}`;
    }
    this.declarationType = 'Normal';
    if(!this.wizardForm.dnd.validateForm) return;  
    this.setScope(varState);
  }

  isErrorForm() {
    if (this.radioOption === 'selectVar') {
      if (!this.variableName) {
        const selVarError = document.querySelector('#selVarError');
        selVarError.classList.remove('hide');
        return true;
      }
    } else {
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
    }
    return false;
  }

  handlerWizardOk(div, ev) {
    ev.preventDefault();
    const hiddenValue = this.wizardForm.dnd.getWizardExpression();
    const hasError = this.wizardForm.dnd.hasError;
    if (Utils.isEmpty(hiddenValue) || hasError) {
      this.wizardForm.dnd.expressionContainerBorder('error');
      const txt = Utils.isEmpty(hiddenValue) ? 'The expression is empty' : 'Syntax error: expression contains errors';
      this.wizardForm.dnd.displayExpressionError('builderExpressionError', txt);
      return;
    }
    const isSelectVar = this.wizardForm.dnd.isInputSelectVar();
    if (isSelectVar) {
      this.dndSelectVarAction(div, hiddenValue);
    } else {
      this.dndDefineVarAction(div, hiddenValue);
    }

  }

  dndSelectVarAction(div, hiddenValue) {
    const defineExp = this.wizardForm.dnd.getDroppedForItems(0);
    if (Utils.isEmpty(defineExp)) {
      this.wizardForm.dnd.expressionContainerBorder('error');
      this.wizardForm.dnd.displayExpressionError('builderExpressionError', 'The expression is empty');
      return;
    }
    const props = defineExp[0].extraProps;
    this.radioOption = 'selectVar';
    this.variableName = props.name;
    this.variableValue = '';
    this.declaration = props.declaration;
    const varState = [...this.getAllVariableScope()].map(vs => vs[1]).filter(vs => vs.name === this.variableName);
    const varStateId = varState.length > 0 ? varState[0].id : '';
    this.setInputCode(this.declaration, varStateId);
    this.wizardCode = hiddenValue;
    this.droppedElements = [defineExp, [], []];
    this.cleanAndUpdateBlockForm(div);
  }

  dndDefineVarAction(div, hiddenValue) {
    const evaluatedExpression = this.evalDefineExpression();
    if (!evaluatedExpression.succsess) {
      this.wizardForm.dnd.expressionContainerBorder('error');
      this.wizardForm.dnd.displayExpressionError('builderExpressionError', evaluatedExpression.message);
      return;
    }
    const defineExp = this.wizardForm.dnd.getDroppedForItems(0);
    const assignExp = this.wizardForm.dnd.getDroppedForItems(1);
    const valueExp = this.wizardForm.dnd.getDroppedForItems(2);
    const { variableName = '', declaration = 'String' } = defineExp.length > 0 ? defineExp[0].extraProps : {};
    this.variableName = variableName;
    this.declaration = declaration;
    this.variableValue = evaluatedExpression.valueExp;
    this.radioOption = 'defineVar';
    this.externalVariableId = '';
    this.wizardCode = hiddenValue;
    this.setInputDefineCode();
    this.droppedElements = [defineExp, assignExp, valueExp];
    this.cleanAndUpdateBlockForm(div);
  }

  evalDefineExpression() {
    const defineExp = this.getDroppedExpression(0);
    const assignExp = this.getDroppedExpression(1);
    const valueExp = this.getDroppedExpression(2);
    if (this.isEmptyExpression(defineExp, assignExp, valueExp)) return { succsess: false, message: 'Syntax error: has empty drop zone' };
    return { succsess: true, defineExp, assignExp, valueExp };
  }

  getDroppedExpression(index) {
    return this.wizardForm.dnd.getDroppedForItems(index).reduce((acc, curr) => acc + curr.userValue, '');
  }

  isEmptyExpression(defineExp, assignExp, valueExp) {
	  if(!this.wizardForm.dnd.validateForm) return false;   
    if (Utils.isEmpty(defineExp)) return true;
    if (!Utils.isEmpty(valueExp) && Utils.isEmpty(assignExp)) return true;
    if (!Utils.isEmpty(assignExp) && Utils.isEmpty(valueExp)) return true;
    return false;
  }
  
  setExternalVariableId() {
    if(this.radioOption !== 'selectVar') return;
    const varState = [...this.getAllVariableScope()].map(vs => vs[1]).filter(vs => vs.name === this.variableName);
    const varStateId = varState.length > 0 ? varState[0].id : '';
    this.externalVariableId = varStateId;
  }
}
