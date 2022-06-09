class WrapFunctionCallJavascript extends WrapFunctionCall {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.returnType = null;
  }

  modal() {
    const template = this.genericTemplate(this.templateContent('function'));
    const div = document.createElement('div');
    div.setAttribute('class', 'overlay');
    div.innerHTML = template;
    document.querySelector('body').appendChild(div);
    this.c.updateCanvas();
    this.addListeners();
    this.handlerModalButtons(div);
  }

  templateContent(title) {
    const funcRepo = this.c.tabs[1].api.program['1'].blocks.map(block => { return { id: block.id, code: block.code } }).filter(block => block.code !== '');
    const stateVariables = [...this.getAllVariableScope()]
      .map(variable => variable[1])
      .filter(variable => variable.isInFlow);
    const { blockColor, fontColor, lineColor } = configEditor.flow.customizedBlocks.wrapBlock;
    this.lineColor = !this.lineColor ? lineColor : this.lineColor;
    this.bgColor = !this.bgColor ? blockColor : this.bgColor;
    this.fontColor = !this.fontColor ? fontColor : this.fontColor;
    return {
      title,
      help:
        `<p>Wrap help</p> `,
      styles: `height: 280px; top: -108px; width: max-content; padding: 15px 10px; text-align:left;`,
      content:
        `<div style="font-size:1.4em; margin-top: 10px;">Variables</div>
         <select id="variables" name="variables" multiple size='5' style="font-size: 1.4em; overflow: auto; padding:8px; width: 100%;">
          ${!stateVariables.length ?
          `<option disabled selected>No variables defined yet</option>` :
          `${stateVariables.map(variable => (
            `<option value='${variable.name}' title="${variable.name} ${variable.declarationType} | ${variable.scope}">${variable.name} ${variable.declarationType} | ${variable.scope}</option>`
          )).join('')}`
        }
        </select> 
        <div style="margin-top:10px; font-size:1.4em;">Functions</div> 
        <select id="repository" name="repository" multiple size='5' style="font-size: 1.4em; overflow: auto; padding:8px; width: 100%;">
          ${!funcRepo.length ?
          `<option disabled selected>No functions defined yet</option>` :
          `${funcRepo.map(f => (
            `<option value='${f.id}' title="${f.code}">${f.code}</option>`
          )).join('')}`
        }
         </select>  
         <div style="font-size:1.4em; margin-top:5px;">Name</div>
         <input type="text" id="funcCode" name="funcCode" value='${this.code}' required placeholder='call function'  style="width: 95%; padding:8px;" required >
         <p id="nameError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>function code is required</p>
         <div style="font-size:1.4em; margin-top:5px;">Colors</div>
         <div style="display: flex; justify-content: space-evenly; align-items: center;">
             <p>Background </p>
             <input type="color" id="backgroundColor" name="backgroundColor" value="${this.bgColor}"/>
             <p>Line </p>
             <input type="color" id="lineColor" name="lineColor" value="${this.lineColor}"/>
             <p>Font </p>
             <input type="color" id="fontColor" name="fontColor" value="${this.fontColor}"/>
         </div>
         <input type="text" id="tabId" name="tabId" value='${this.tabId}' hidden>`
    }
  }

  getWrapFormValues() {
    const form = document.forms.namedItem("blockForm");
    const formData = new FormData(form);
    const funcCode = formData.get('funcCode');
    if (Utils.isEmpty(funcCode)) {
      const nameError = document.querySelector('#nameError');
      nameError.classList.remove('hide');
      return null;
    }
    const bgColor = formData.get('backgroundColor');
    const lineColor = formData.get('lineColor');
    const fontColor = formData.get('fontColor');
    const tabId = formData.get('tabId');
    return { funcCode, bgColor, lineColor, fontColor, tabId };
  }

  addListeners() {
    this.comboRepo = document.querySelector('#repository');
    this.comboRepo.addEventListener('change', this.handlerSelction.bind(this));
  }

  handlerSelction(ev) {
    for (let i = 0; i < this.comboRepo.length; i++) {
      if (this.comboRepo.options[i].selected) {
        const id = this.comboRepo.options[i].value;
        const idx = this.c.tabs[1].api.program['1'].blocks.findIndex(block => block.id == id);
        const name = this.c.tabs[1].api.program['1'].blocks[idx].vars.functionName;
        const params = this.c.tabs[1].api.program['1'].blocks[idx].vars.params.map(param => param.name).join(', ');
        document.querySelector('#tabId').value = this.c.tabs[1].api.program['1'].blocks[idx].vars.tabId;
        document.querySelector('#funcCode').value = `${name}(${params})`;
      }
    }
  }

  handlerModalButtons(div) {
    document.querySelector('#ok-modal')
      .addEventListener('click', e => {
        e.preventDefault();
        const formValues = this.getWrapFormValues();
        if (!formValues) return;
        const { funcCode, bgColor, lineColor, fontColor, tabId } = formValues;
        this.code = funcCode;
        this.bgColor = bgColor;
        this.lineColor = lineColor;
        this.fontColor = fontColor;
        this.tabId = tabId;
        div.remove();
        this.c.updateCanvas();
      });
    document.querySelector('#cancel-modal')
      .addEventListener('click', e => {
        div.remove();
        this.c.updateCanvas();
      });
  }
}