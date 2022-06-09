class CodeBlockJavascript extends CodeBlock {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
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
    const stateVariables = [...this.getAllVariableScope()]
                             .map(variable => variable[1])
                             .filter(variable => variable.isInFlow);
    const code = this.code;
    return {
      title: 'code block',
      help:
        `<p>List of variables: lists of defined varialbles</p>
         <p>(*)Expression: code expressions</p>
         <p>Examples:</p>
         <p>
           <ul style="margin-left: 25px;">
             <li>count = count - 10</li>
             <li>total = quantity * price</li>
             <li>count++</li>
           </ul>
         </p>
         <p>(*)- Required fields</p>`,
      styles: `height: 220px; top: -85px; width: max-content; padding: 15px 10px; text-align:left;`,         
      content:
        `<div style="font-size:1.4em">Variables</div>
         <select id="variables" name="variables" multiple size='5' style="font-size: 1.4em; overflow: auto; padding:8px; width: 100%;">
          ${!stateVariables.length ?
            `<option disabled selected>No variables defined yet</option>` :
            `${stateVariables.map(variable => (
              `<option value='${variable.name}' title="${variable.name} ${variable.declarationType} | ${variable.scope}">${variable.name} ${variable.declarationType} | ${variable.scope}</option>`
            )).join('')}`
          }
         </select>   
         <input type="text" id="variableValue" name="variableValue" hidden value='${this.variableValue}' required>
         <div style="font-size:1.4em; margin-top:5px;">Expression</div>
         <input type="text" id="expression" name="expression" value='${this.code}' required placeholder='count = count * 10 OR count++'  style="width: 95%; padding:8px;">
         <p id="expressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>expression is required</p>`
    }
  }

  handlerModalButtons(div) {
    document.querySelector('#ok-modal')
      .addEventListener('click', e => {
        e.preventDefault();
        const form = document.forms.namedItem("blockForm");
        const formData = new FormData(form);
        this.code = formData.get('expression');
        if(Utils.isEmpty(this.code)) {
          const expressionError = document.querySelector('#expressionError');
          expressionError.classList.remove('hide');
          return;
        }
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