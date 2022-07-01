class DefineBlockJava extends DefineBlock {
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
    this.reservedWords = [
      "scanner",
      "Class",
      "String",
      "char",
      "byte",
      "short",
      "int",
      "float",
      "double",
      "boolean",
    ];
    this.variableDeclaration = [
      "String",
      "char",
      "byte",
      "short",
      "int",
      "long",
      "float",
      "double",
      "boolean",
    ];
    this.variableType = ["Normal", "Array", "MultiDimensional Array"];
    this.declaration = "String";
    this.declarationType = "Normal";
    this.arraySizeOne = "1";
    this.arraySizeTwo = "1";
    this.variableName = "";
    this.variableValue = "";
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
    this.handlerSelectCombo();
    this.handlerModalButtons(div);
    this.renderWizardBuilder(div);
    this.okBuilderBtn.addEventListener(
      "click",
      this.handlerWizardOk.bind(this, div)
    );
  }

  templateContent() {
    return {
      title: "define",
      help: ` <p>Declaration: declaration type variable</p>
          <p>Type: type of variable</p>    
          <p>Array index: length of arrays</p>
          <p>(*) Variable name input: define var name</p>
           <p>Variable Value input: set initial value</p>
           <p>-For string or char value use " ", ex: "myVarName"</p>  
           <p>Value examples:</p> 
           <p>
             <ul style="margin-left: 25px;">
               <li>Numbers: 100</li>
               <li>String: "browxy"</li>
               <li>Boolean: true</li>
               <li>Array: 10,20,30</li>
               <li>Multidemensional Array: {10,20,30},{40,50,60},{70,80,90}</li>
              </ul>
           </p>
           <p>(*)- Required fields</p>`,
      styles: `height: 410px; top: -160px; width: max-content; padding: 15px 10px; text-align:left;`,
      content: `<div style="font-size:1.4em;">Declaration</div> 
           <select id="variableDeclaration" name="variableDeclaration" style="padding:8px; width: 100%;">
             ${this.variableDeclaration
               .map(
                 (variable) =>
                   `<option value='${variable}' ${
                     variable === this.declaration ? "selected" : ""
                   }>${variable}</option>`
               )
               .join("")}
           </select>
           <div style="font-size:1.4em; margin-top:10px;">Type</div>
          <select id="declarationType" name="declarationType" style="padding:8px; width: 100%;">
             ${this.variableType
               .map(
                 (type) =>
                   `<option value='${type}' ${
                     type === this.declarationType ? "selected" : ""
                   }>${type}</option>`
               )
               .join("")}
          </select>
          <div id="sizeContent" style="display:flex; width: 98%; ${
            this.declarationType === "Array"
              ? "justify-content: flex-start;"
              : "justify-content: space-around;"
          }">
          <div style="width: 45%;" class="size1 ${
            this.declarationType === "Normal" ? "hide" : ""
          }">
            <div style="display:block; font-size:1.4em; margin-top:10px;">Array Size 1</div> 
            <input type="text" id='sizeSingle' name='sizeSingle' value='${
              this.arraySizeOne
            }' style="padding:8px; width: 95%;"/>
          </div>
          <div style="margin-left:10px; width: 45%;" class="size2 ${
            this.declarationType !== "MultiDimensional Array" ? "hide" : ""
          }">
            <div style="display:block; font-size:1.4em; margin-top:10px;">Array Size 2</div> 
            <input type="text" id='sizeMulti' name='sizeMulti' value='${
              this.arraySizeTwo
            }'  style="padding:8px; width: 95%;"/>
          </div>
          </div>
          <div style="font-size:1.4em; margin-top:10px;">Variable name</div>
          <input type="text" id="variableName" name="variableName" required value="${
            this.variableName
          }" placeholder='myVarName'  style="width: 95%; padding:8px;">
          <p id="varNameError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
          <div style="font-size:1.4em; margin-top:10px;">Variable Value/s</div>
          <input type="text" id="variableValue"  name="variableValue" value='${this.variableValue
            .replace(/^{/, "")
            .replace(/}$/, "")
            .replace(
              /'/g,
              "&apos;"
            )}' placeholder="10" style="width: 95%;padding:8px;">`,
    };
  }

  handlerSelectCombo() {
    const selectCombo = document.querySelector("#declarationType");
    selectCombo.addEventListener("change", (e) => {
      if (e.target.value === "Normal") {
        document.querySelector(".size1").classList.add("hide");
        document.querySelector(".size2").classList.add("hide");
      }
      if (e.target.value === "Array") {
        document.querySelector(".size1").classList.remove("hide");
        document.querySelector("#sizeContent").style =
          "width: 98%; display: flex; justify-content: flex-start;";
        if (!document.querySelector(".size2").classList.contains("hide")) {
          document.querySelector(".size2").classList.add("hide");
        }
      }
      if (e.target.value === "MultiDimensional Array") {
        document.querySelector(".size1").classList.remove("hide");
        document.querySelector(".size2").classList.remove("hide");
        document.querySelector("#sizeContent").style =
          "width: 98%; display: flex; justify-content: space-around;";
      }
    });
  }

  handlerModalButtons(div) {
    document.querySelector("#ok-modal").addEventListener("click", (e) => {
      e.preventDefault();
      const varState = [...this.getAllVariableScope()]
        .map((vs) => vs[1])
        .filter((vs) => vs.id === this.id);
      const form = document.forms.namedItem("blockForm");
      const formData = new FormData(form);
      this.declaration = formData.get("variableDeclaration");
      this.declarationType = formData.get("declarationType");
      this.arraySizeOne = formData.get("sizeSingle");
      this.arraySizeTwo = formData.get("sizeMulti");
      this.variableName = formData.get("variableName");
      this.variableValue = formData.get("variableValue");
      if (this.isErrorForm()) return;
      this.code = this.getCode();
      this.setScope(varState);
      this.findAndUpdateInputsBlocks();
      this.cleanAndUpdateBlockForm(div);
    });
    document.querySelector("#cancel-modal").addEventListener("click", (e) => {
      this.cleanAndUpdateBlockForm(div);
    });
  }

  getCode() {
    let code = "";
    switch (this.declarationType) {
      case "Normal":
        code = Utils.isEmpty(this.variableValue)
          ? `${this.declaration} ${this.variableName}`
          : `${this.declaration} ${this.variableName} = ${this.variableValue}`;
        break;
      case "Array":
        code = Utils.isEmpty(this.variableValue)
          ? `${this.declaration}[] ${this.variableName} = new ${this.declaration}[${this.arraySizeOne}]`
          : `${this.declaration}[] ${this.variableName} = {${this.variableValue}}`;
        break;
      default:
        code = Utils.isEmpty(this.variableValue)
          ? `${this.declaration}[][] ${this.variableName} = new ${this.declaration}[${this.arraySizeOne}][${this.arraySizeTwo}]`
          : `${this.declaration}[][] ${this.variableName} = {${this.variableValue}}`;
        break;
    }
    return code;
  }

  findAndUpdateInputsBlocks() {
    const varState = [...this.getAllVariableScope()]
      .map((vs) => vs[1])
      .filter((vs) => vs.id === this.id);
    const inputBlocks = this.c.program.filter(
      (block) => block.type === "inputBlock"
    );
    if (!inputBlocks.length) return;
    inputBlocks.forEach((inputBlock) => {
      if (inputBlock.radioOption === "selectVar") {
        const varStateObj = varState.length > 0 ? varState[0] : null;
        if (varStateObj && varStateObj.id === inputBlock.externalVariableId) {
          if (
            varStateObj.declarationType === "Normal" &&
            varStateObj.declaration !== inputBlock.declaration
          ) {
            const index = this.c.program.findIndex(
              (blk) => blk.id === inputBlock.id
            );
            this.c.program[index].declaration = varStateObj.declaration;
            this.c.program[index].code = this.c.program[index].getInputCode(
              varStateObj.declaration
            );
            this.updateWizardState(index, varStateObj.declaration);
          }
        }
      }
    });
  }

  updateWizardState(index, declaration) {
    if (!this.c.program[index].droppedElements.length) return;
    if (!this.c.program[index].droppedElements[0].length) return;
    this.c.program[index].droppedElements[0][0].extraProps.declaration =
      declaration;
  }

  isErrorForm() {
    const varNameError = document.querySelector("#varNameError");
    if (
      Utils.isEmpty(this.variableName) ||
      this.hasWhiteSpace(this.variableName)
    ) {
      varNameError.classList.remove("hide");
      varNameError.innerText = "variable name is required and without spaces";
      return true;
    }
    if (
      isNaN(this.variableName[0]) &&
      this.variableName[0] === this.variableName[0].toUpperCase()
    ) {
      varNameError.classList.remove("hide");
      varNameError.innerText = `variable name "${this.variableName}" start with uppercase character`;
      return true;
    }
    if (!/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(this.variableName)) {
      varNameError.classList.remove("hide");
      varNameError.innerText = `variable name "${this.variableName}" contains ilegal characters`;
      return true;
    }
    if (this.reservedWords.includes(this.variableName)) {
      varNameError.classList.remove("hide");
      varNameError.innerText = `variable name "${this.variableName}" is a reserved word`;
      return true;
    }
    if (this.isInvalidNameInScope()) {
      varNameError.classList.remove("hide");
      varNameError.innerText = `variable name "${this.variableName}" is alrready used`;
      return true;
    }

    return false;
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
    const evaluatedExpression = this.evalDefineExpression();
    if (!evaluatedExpression.succsess) {
      this.wizardForm.dnd.expressionContainerBorder("error");
      this.wizardForm.dnd.displayExpressionError(
        "builderExpressionError",
        evaluatedExpression.message
      );
      return;
    }
    const defineExp = this.wizardForm.dnd.getDroppedForItems(0);
    const assignExp = this.wizardForm.dnd.getDroppedForItems(1);
    const valueExp = this.wizardForm.dnd.getDroppedForItems(2);
    const varState = [...this.getAllVariableScope()]
      .map((vs) => vs[1])
      .filter((vs) => vs.id === this.id);
    const {
      variableName = "",
      declaration = "String",
      declarationType = "Normal",
      arraySizeOne = 1,
      arraySizeTwo = 1,
    } = defineExp.length > 0 ? defineExp[0].extraProps : {};
    this.variableName = variableName;
    this.declaration = declaration;
    this.declarationType = declarationType;
    this.arraySizeOne = arraySizeOne;
    this.arraySizeTwo = arraySizeTwo;
    this.variableValue = evaluatedExpression.valueExp;
    this.code = hiddenValue;
    this.setScope(varState);
    this.findAndUpdateInputsBlocks();
    this.droppedElements = [defineExp, assignExp, valueExp];
    this.cleanAndUpdateBlockForm(div);
  }

  evalDefineExpression() {
    const defineExp = this.getDroppedExpression(0);
    const assignExp = this.getDroppedExpression(1);
    const valueExp = this.getDroppedExpression(2);
    if (this.isEmptyExpression(defineExp, assignExp, valueExp))
      return { succsess: false, message: "Syntax error: has empty drop zone" };
    return { succsess: true, defineExp, assignExp, valueExp };
  }

  getDroppedExpression(index) {
    return this.wizardForm.dnd
      .getDroppedForItems(index)
      .reduce((acc, curr) => acc + curr.userValue, "");
  }

  isEmptyExpression(defineExp, assignExp, valueExp) {
    if (!this.wizardForm.dnd.validateForm) return false;
    if (Utils.isEmpty(defineExp)) return true;
    if (!Utils.isEmpty(valueExp) && Utils.isEmpty(assignExp)) return true;
    if (!Utils.isEmpty(assignExp) && Utils.isEmpty(valueExp)) return true;
    return false;
  }
}
