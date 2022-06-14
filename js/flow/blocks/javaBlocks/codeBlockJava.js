class CodeBlockJava extends CodeBlock {
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
    this.imports = [
      { id: 1, value: "import java.util.*;" },
      { id: 2, value: "import static java.lang.Math.*;" },
      { id: 3, value: "import java.util.Random;" },
    ];
    this.importValue = 1;
    this.isImport = false;
  }

  modal() {
    const template = this.genericTemplate(this.templateContent());
    const div = document.createElement("div");
    div.setAttribute("class", "overlay");
    div.innerHTML = template;
    document.querySelector("body").appendChild(div);
    this.edit();
    this.c.updateCanvas();
    //  document.getElementById("text-box").style.display = "none";
    //  document.getElementById("text").value = "";
    this.handlerModalButtons(div);
    this.handlerCombo();
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
      title: "code block",
      help: `<p>Choose Variables or Imports: change Variable list to imports list</p>
           <p>List of variables: lists of defined varialbles</p>
           <p>List of imports: lists of default imports</p>
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
      styles: `height: 295px; top: -115px; width: max-content; padding: 15px 10px; text-align:left;`,
      content: `<div style="font-size:1.4em">Choose Variables or Imports</div>
        <select id="chooseList" name="chooseList" style="padding:8px; width: 100%;">
          <option value="1" ${
            this.isImport ? "" : "selected"
          }>List of Variables</option>
          <option value="2" ${
            this.isImport ? "selected" : ""
          }>List of Imports</option>
        </select>
        <div id="varList" class="${this.isImport ? "hide" : ""}">
        <div style="font-size:1.4em; margin-top: 10px;">Variables</div>
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
        </div> 
        <div id="importList" class="${this.isImport ? "" : "hide"}">
        <div style="font-size:1.4em; margin-top: 10px;">Imports</div>
        <select id="imports" name="imports" style="padding:8px; width: 100%;">
          ${this.imports
            .map(
              (imp) =>
                `<option value='${imp.id}' ${
                  this.importValue === imp.id ? "selected" : ""
                }>${imp.value}</option>`
            )
            .join("")}
        </select>   
        </div>
        <input type="text" id="variableValue" name="variableValue" hidden value='${
          this.variableValue
        }' required>
        <div style="font-size:1.4em; margin-top:5px;">Expression</div>
        <input type="text" id="expression" name="expression" value='${
          this.code
        }' required placeholder='count = count * 10 OR count++'  style="width: 95%; padding:8px;">
        <p id="expressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>expression is required</p>`,
    };
  }

  handlerModalButtons(div) {
    document.querySelector("#ok-modal").addEventListener("click", (e) => {
      e.preventDefault();
      const form = document.forms.namedItem("blockForm");
      const formData = new FormData(form);
      this.code = formData.get("expression");
      if (Utils.isEmpty(this.code)) {
        const expressionError = document.querySelector("#expressionError");
        expressionError.classList.remove("hide");
        return;
      }
      if (this.isImport) {
        this.setImportStatement(`${this.code}\n`);
      }
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
          this.imports[this.importValue - 1].value;
        this.isImport = true;
      }
    });
    const importCombo = document.querySelector("#imports");
    importCombo.addEventListener("change", (e) => {
      document.querySelector("#expression").value = "";
      document.querySelector("#expression").value =
        this.imports[e.target.value - 1].value;
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
    this.wizardForm.dnd.evalEqualStringExpression();
    const hiddenUpdateValue = this.wizardForm.dnd.getWizardExpression();
    this.code = hiddenUpdateValue;
    this.wizardCode = hiddenUpdateValue;
    this.droppedElements = this.wizardForm.dnd.getDroppedElements();
    this.cleanAndUpdateBlockForm(div);
  }
}
