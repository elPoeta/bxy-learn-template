class OutputBlockJava extends OutputBlock {
  constructor(
    id,
    canvas,
    x,
    y,
    w,
    h,
    type,
    code,
    scaleFactor,
    isProgram,
    languageOutput
  ) {
    super(
      id,
      canvas,
      x,
      y,
      w,
      h,
      type,
      code,
      scaleFactor,
      isProgram,
      languageOutput
    );
    this.expression = "";
    this.radioOption = "println";
  }

  modal() {
    const template = this.genericTemplate(this.templateContent());
    const div = document.createElement("div");
    div.setAttribute("class", "overlay");
    div.innerHTML = template;
    document.querySelector("body").appendChild(div);
    //this.edit();
    this.c.updateCanvas();
    //document.getElementById("text-box").style.display = "none";
    //document.getElementById("text").value = "";
    this.handlerModalButtons(div);
    this.renderWizardBuilder(div);
    this.okBuilderBtn.addEventListener(
      "click",
      this.handlerWizardOk.bind(this, div)
    );
  }

  templateContent() {
    const stateVariables = [...this.getAllVariableScope()]
      .map((variable) => variable[1])
      .filter((variable) => variable.isInFlow);
    return {
      title: "output",
      help: `<p>Options:</p> 
           <p>
             <ul style="margin-left: 25px;">
               <li>Print line: > System.out.println()</li>
               <li>Print: > System.out.print()</li>
             </ul>
           </p>    
        <p>List of variables: lists of defined varialbles</p>
          <p>(*) Expression: info to show</p> 
          <p>Expression example:</p> 
          <p>
            <ul style="margin-left: 25px;">
              <li>"Your name is: "+myVarName+"!"</li>
              <li>"Total: "+myVar</li>
            </ul>
          </p>
         <p>(*)- Required fields</p>`,
      styles: `height: 280px; top: -108px; width: max-content; padding: 15px 10px; text-align:left;`,
      content: `<div style="font-size:1.4em; margin-top:10px; margin-bottom:5px;">Print option</div>
         <span style="font-size:1.5em; padding:4px;">print line</span><input type="radio" name="optionType" id="println" ${
           this.radioOption === "println" ? "checked" : ""
         }  value="println" style="margin-right: 15px; padding:4px; position: relative; top: 0px;">
         <span style="font-size:1.5em; padding:4px;">print</span><input type="radio" name="optionType" id="print"  ${
           this.radioOption === "print" ? "checked" : ""
         } value="print" style="margin-right: 15px; padding:4px; position: relative; top: 0px;">
         <div style="font-size:1.4em; margin-top:10px;">Variables</div>
         <select id="variables" name="variables" multiple size='5' style="font-size: 1.4em; overflow: auto; padding:8px; width: 100%;">
           ${
             !stateVariables.length
               ? `<option disabled selected>No variables defined yet</option>`
               : `${stateVariables
                   .map(
                     (variable) =>
                       `<option value='${variable.name}' title="${variable.declaration} ${variable.name} ${variable.declarationType} | ${variable.scope}">${variable.declaration} ${variable.name} ${variable.declarationType} | ${variable.scope}</option>`
                   )
                   .join("")}`
           }
         </select>  
         <div style="font-size:1.4em; margin-top:5px;">Expression</div>
         <input type="text" id="expression" name="expression" value='${this.expression.replace(
           /'/g,
           "&apos;"
         )}' required placeholder='Ex: "Your name is: "+myVarName+"!"'  style="width: 95%; padding:8px;" required >
         <p id="expressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>expression is required</p>`,
    };
  }

  handlerModalButtons(div) {
    document.querySelector("#ok-modal").addEventListener("click", (e) => {
      e.preventDefault();
      const form = document.forms.namedItem("blockForm");
      const formData = new FormData(form);
      if (Utils.isEmpty(formData.get("expression"))) {
        const expressionError = document.querySelector("#expressionError");
        expressionError.classList.remove("hide");
        return;
      }
      this.radioOption = formData.get("optionType");
      this.expression = formData.get("expression");
      const printTemplate =
        this.radioOption === "println"
          ? "System.out.println("
          : "System.out.print(";
      this.code = `${printTemplate}${this.expression})`;
      this.cleanAndUpdateBlockForm(div);
    });
    document.querySelector("#cancel-modal").addEventListener("click", (e) => {
      this.cleanAndUpdateBlockForm(div);
    });
  }

  handlerCombo() {
    const combo = document.querySelector("#chooseList");
    const varList = document.querySelector("#varList");
    const importList = document.querySelector("#importList");
    combo.addEventListener("change", (e) => {
      if (e.target.value === "1") {
        varList.classList.remove("hide");
        importList.classList.add("hide");
        document.querySelector("#expression").value = "";
        this.isImport = false;
      } else {
        importList.classList.remove("hide");
        varList.classList.add("hide");
        document.querySelector("#expression").value =
          this.imports[this.importValue].value;
        this.isImport = true;
      }
    });
    const importCombo = document.querySelector("#imports");
    importCombo.addEventListener("change", (e) => {
      document.querySelector("#expression").value = "";
      document.querySelector("#expression").value =
        this.imports[e.target.value].value;
      this.importValue = parseInt(e.target.value);
    });
  }

  handlerWizardOk(div, ev) {
    ev.preventDefault();
    const hiddenValue = this.wizardForm.dnd.getWizardExpression();
    const hasError = this.wizardForm.dnd.hasError;
    if (Utils.isEmpty(hiddenValue) || hasError) {
      this.wizardForm.dnd.expressionContainerBorder("error");
      const txt = Utils.isEmpty(hiddenValue)
        ? "The expression is empty"
        : "Syntax error: expression contains errors";
      this.wizardForm.dnd.displayExpressionError("builderExpressionError", txt);
      return;
    }
    this.expression = hiddenValue;
    this.radioOption = document.querySelector(
      'input[name="optionTypeWizard"]:checked'
    ).value;
    const printTemplate =
      this.radioOption === "println"
        ? "System.out.println("
        : "System.out.print(";
    this.code = `${printTemplate}${hiddenValue})`;
    this.wizardCode = `${printTemplate}${hiddenValue})`;
    this.droppedElements = this.wizardForm.dnd.getDroppedElements();
    this.cleanAndUpdateBlockForm(div);
  }
}
