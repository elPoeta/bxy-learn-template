class ForBlockJava extends ForBlock {
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
    this.variableName = "";
    this.initialValue = "";
    this.radioOption = "<";
    this.radioVar = "defineVar";
    this.variableCompareValue = "";
    this.operation = "";
    this.reservedWords = ["scanner"];
    this.declaration = "int";
    this.declarationType = "Normal";
    this.variableValue = "";
  }

  modal() {
    const stateVariables = [...this.getAllVariableScope()]
      .map((variable) => variable[1])
      .filter((variable) => variable.isInFlow);
    const template = this.genericTemplate(this.templateContent(stateVariables));
    const div = document.createElement("div");
    div.setAttribute("class", "overlay");
    div.innerHTML = template;
    document.querySelector("body").appendChild(div);
    //this.edit();
    this.c.updateCanvas();
    //document.getElementById("text-box").style.display = "none";
    //document.getElementById("text").value = "";
    this.handlerRadioVarOption(stateVariables);
    this.handlerModalButtons(div);
    this.handlerSelectCombo(stateVariables);
    this.renderWizardBuilder(div);
    this.okBuilderBtn.addEventListener(
      "click",
      this.handlerWizardOk.bind(this, div)
    );
  }

  templateContent(stateVariables) {
    return {
      title: "for loop",
      help: `<p>Options:</p> 
           <p>
             <ul style="margin-left: 25px;">
               <li>Define new: define new variable from scratch</li>
               <li>Select variable: select variable previously defined</li>
             </ul>
           </p>    
           <p>(*) Variable name: variable index</p>
            <p>(*) Initial value: initial value of index</p> 
            <p>(*) Evaluation symbol: compare symbols</p> 
            <p>(*) Compare field: value or variable to compare with index</p> 
            <p>(*) Operation: increment or decrement index</p> 
            <p>Operation example:</p>
            <p>
              <ul style="margin-left: 25px;">
                <li>i = i + 2</li>
                <li>i--</li>
                <li>i++</li>
               </ul>
            </p>
            <p>(*)- Required fields</p>`,
      styles: `height: 430px; top: -170px; width: max-content; padding: 15px 10px; text-align:left;`,
      content: `<div style="font-size:1.4em; margin-top:10px; margin-bottom:5px;">Variable option</div>
         <span style="font-size:1.5em; padding:4px;">Define new</span><input type="radio" name="optionVarType" id="defineVar"  ${
           this.radioVar === "defineVar" ? "checked" : ""
         } value="defineVar" style="margin-right: 15px; padding:4px; position: relative; top: 0px;">
         <span style="font-size:1.5em; padding:4px;">Select variable</span><input type="radio" name="optionVarType" id="selectVar" ${
           this.radioVar === "selectVar" ? "checked" : ""
         }  value="selectVar" style="margin-right: 15px; padding:4px; position: relative; top: 0px;">     
         <div id="selectContainer" class="${
           this.radioVar === "defineVar" ? "hide" : ""
         }">
           <div style="font-size:1.4em; margin-top:10px;">List of variables</div>
           <select id="variables" name="variables" style="padding:8px; width: 100%;">
             ${
               !stateVariables.length
                 ? `<option disabled selected>Define Variable first</option>`
                 : `${stateVariables
                     .map(
                       (variable) =>
                         `<option value='${variable.name}' ${
                           this.variableName === variable.name ? "selected" : ""
                         }>${variable.declaration} ${variable.name} ${
                           variable.declarationType
                         } | ${variable.scope}</option>`
                     )
                     .join("")}`
             }
           </select>
           <p id="selVarError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>variable is required</p>
         </div>
         <div id="defineContainer" class="${
           this.radioVar === "selectVar" ? "hide" : ""
         }">
         <div style="font-size:1.4em; margin-top:10px;">Variable name</div>
           <input type="text" id="variableName" name="variableName" required value="${
             this.variableName
           }" placeholder='myVarName'  style="width: 95%; padding:8px;">
           <p id="varNameError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
         </div>
         <input type="text" id="expression" name="expression" value='${
           this.variableName
         }' required hidden>
         <div style="font-size:1.4em; margin-top:10px;">Initial Value</div>
         <input type="text" id="varValue" name="varValue" value="${
           this.initialValue
         }" placeholder="10" style="padding:8px; width: 95%;">
         <p id="initValError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>intial value is required</p>     
         <div style="font-size:1.4em; margin-top:10px; margin-bottom:5px;">Evaluation</div>
         <span style="font-size:1.6em; padding:4px;">&lt;</span><input type="radio" name="evaluationType" ${
           this.radioOption === "<" ? "checked" : ""
         } id="less" value="<" style="margin-right: 15px; padding:4px;">
         <span style="font-size:1.6em; padding:4px;">&lt;=</span><input type="radio" name="evaluationType" id="lessEqual"  ${
           this.radioOption === "<=" ? "checked" : ""
         } value="<=" style="margin-right: 15px; padding:4px;">
         <span style="font-size:1.6em; padding:4px;">&gt;</span><input type="radio" name="evaluationType" id="greather" ${
           this.radioOption === ">" ? "checked" : ""
         } value=">" style="margin-right: 15px; padding:4px;">
         <span style="font-size:1.6em; padding:4px;">&gt;=</span><input type="radio" name="evaluationType" id="greatherEqual" ${
           this.radioOption === ">=" ? "checked" : ""
         } value=">=" style=" margin-right: 15px;padding:4px;">
         <input type="text" id="radioOption" name="radioOption" value='${
           this.radioOption
         }' required hidden/>
         <div style="font-size:1.4em; margin-top:5px;">Compare variable or value </div>
         <input type="text" id="varCompareValue" name="varCompareValue" value='${
           this.variableCompareValue
         }' placeholder="10" style="padding:8px; width: 95%;" required>
         <p id="compValError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>compare value is required</p>
         <div style="font-size:1.4em; margin-top:5px;">Operation</div>
         <input type="text" id="operation" name="operation" value='${
           this.operation
         }' placeholder="i++" style="padding:8px; width: 95%;" required>
         <p id="operationError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>operation is required</p>
         <p id="finalExpression" style="font-size: 1.4em; margin-top: 10px; font-weight: bold; text-align: center; margin-bottom: 5px;"></p>`,
    };
  }

  handlerSelectCombo(stateVariables) {
    let selectVarCombo;
    let varSelected = "";
    selectVarCombo = document.querySelector("#variables");
    if (this.radioVar === "selectVar") {
      varSelected = this.setInputsBySelectedCombo(
        selectVarCombo,
        stateVariables,
        varSelected
      );
    } else {
      if (!Utils.isEmpty(this.variableName)) {
        this.setNewExpression();
      }
    }
    selectVarCombo.addEventListener("change", (e) => {
      varSelected = e.target.value;
      const stateVar = [...this.getAllVariableScope()]
        .map((vs) => vs[1])
        .filter((vs) => vs.name === varSelected)[0];
      document.querySelector("#expression").value = varSelected;
      document.querySelector("#varValue").value = stateVar.value;
      document.querySelector("#operation").value = varSelected;
      this.setNewExpression();
    });
    const radios = document.querySelectorAll('input[name="evaluationType"]');
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        document.querySelector("#radioOption").value = e.target.value;
      });
    });
    document.querySelectorAll("input").forEach((el) => {
      el.addEventListener("input", (e) => {
        if (e.target.getAttribute("id") == "console-prompt") return;
        if (e.target.getAttribute("id") == "variableName") {
          document.querySelector("#expression").value = e.target.value;
        }
        this.setNewExpression();
      });
    });
  }

  setInputsBySelectedCombo(selectVarCombo, stateVariables, varSelected) {
    if (stateVariables.length > 0) {
      varSelected = selectVarCombo.options[selectVarCombo.selectedIndex].value;
      const stateVar = [...this.getAllVariableScope()]
        .map((vs) => vs[1])
        .filter((vs) => vs.name === varSelected)[0];
      document.querySelector("#expression").value = varSelected;
      document.querySelector("#varValue").value = Utils.isEmpty(
        document.querySelector("#varValue").value
      )
        ? stateVar.value
        : document.querySelector("#varValue").value;
      document.querySelector("#operation").value = Utils.isEmpty(
        document.querySelector("#operation").value
      )
        ? varSelected
        : document.querySelector("#operation").value;
      const oprtionType = document.querySelector("#radioOption").value;
      const operation = document.querySelector("#operation").value;
      const varCompareValue = document.querySelector("#varCompareValue").value;
      document.querySelector(
        "#finalExpression"
      ).innerHTML = `${varSelected} = ${stateVar.value}; ${varSelected} ${oprtionType} ${varCompareValue}; ${operation}`;
    }
    return varSelected;
  }

  setNewExpression() {
    if (!document.querySelector("#expression")) return;
    const varName = document.querySelector("#expression").value;
    const varValue = document.querySelector("#varValue").value;
    const optionType = document.querySelector(
      "input[name=evaluationType]:checked"
    ).value;
    const operation = document.querySelector("#operation").value;
    const varCompareValue = document.querySelector("#varCompareValue").value;
    const declaration = document.querySelector("#defineVar").checked
      ? "int "
      : "";
    document.querySelector(
      "#finalExpression"
    ).innerHTML = `${declaration}${varName} = ${varValue}; ${varName} ${optionType} ${varCompareValue}; ${operation}`;
  }

  handlerModalButtons(div) {
    document.querySelector("#ok-modal").addEventListener("click", (e) => {
      e.preventDefault();
      const form = document.forms.namedItem("blockForm");
      const formData = new FormData(form);
      this.radioOption = formData.get("evaluationType");
      this.radioVar = formData.get("optionVarType");
      this.variableName = formData.get("expression");
      this.initialValue = formData.get("varValue");
      this.variableCompareValue = formData.get("varCompareValue");
      this.operation = formData.get("operation");
      this.code = document.querySelector("#finalExpression").textContent;
      if (this.isErrorForm()) return;
      if (this.radioVar === "defineVar") {
        const varState = [...this.getAllVariableScope()]
          .map((vs) => vs[1])
          .filter((vs) => vs.id === this.id);
        this.variableValue = this.initialValue;
        this.setScope(varState);
      }
      this.cleanAndUpdateBlockForm(div);
    });
    document.querySelector("#cancel-modal").addEventListener("click", (e) => {
      this.cleanAndUpdateBlockForm(div);
    });
  }

  handlerRadioVarOption(stateVariables) {
    const radios = document.querySelectorAll('input[name="optionVarType"]');
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const option = e.target.value;
        const selectContainer = document.querySelector("#selectContainer");
        const defineContainer = document.querySelector("#defineContainer");
        this.clearForm();
        switch (option) {
          case "selectVar":
            defineContainer.classList.add("hide");
            selectContainer.classList.remove("hide");
            const selectVarCombo = document.querySelector("#variables");
            this.setInputsBySelectedCombo(selectVarCombo, stateVariables, "");
            break;
          case "defineVar":
            selectContainer.classList.add("hide");
            defineContainer.classList.remove("hide");
            break;
        }
      });
    });
  }

  isErrorForm() {
    if (this.radioVar === "selectVar" && !this.variableName) {
      const selVarError = document.querySelector("#selVarError");
      selVarError.classList.remove("hide");
      return true;
    }
    const varNameError = document.querySelector("#varNameError");
    if (
      this.radioVar === "defineVar" &&
      (Utils.isEmpty(this.variableName) ||
        this.hasWhiteSpace(this.variableName))
    ) {
      varNameError.classList.remove("hide");
      varNameError.innerText = "variable name is required and without spaces";
      return true;
    }
    if (
      this.radioVar === "defineVar" &&
      isNaN(this.variableName[0]) &&
      this.variableName[0] === this.variableName[0].toUpperCase()
    ) {
      varNameError.classList.remove("hide");
      varNameError.innerText = `variable name "${this.variableName}" start with uppercase character`;
      return true;
    }
    if (
      this.radioVar === "defineVar" &&
      !/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(this.variableName)
    ) {
      varNameError.classList.remove("hide");
      varNameError.innerText = `variable name "${this.variableName}" contains ilegal characters`;
      return true;
    }
    if (
      this.radioVar === "defineVar" &&
      this.reservedWords.includes(this.variableName)
    ) {
      varNameError.classList.remove("hide");
      varNameError.innerText = `variable name "${this.variableName}" is a reserved word`;
      return true;
    }
    if (
      Utils.isEmpty(this.initialValue) ||
      this.hasWhiteSpace(this.initialValue)
    ) {
      const initValError = document.querySelector("#initValError");
      initValError.classList.remove("hide");
      return true;
    }
    if (Utils.isEmpty(this.variableCompareValue)) {
      const compValError = document.querySelector("#compValError");
      compValError.classList.remove("hide");
      return true;
    }
    if (Utils.isEmpty(this.operation)) {
      const operationError = document.querySelector("#operationError");
      operationError.classList.remove("hide");
      return true;
    }
    if (this.radioVar === "defineVar" && this.isInvalidNameInScope()) {
      varNameError.classList.remove("hide");
      varNameError.innerText = `variable name "${this.variableName}" is alrready used`;
      return true;
    }
    return false;
  }

  clearForm() {
    document.querySelector("#variableName").value = "";
    document.querySelector("#expression").value = "";
    document.querySelector("#varValue").value = "";
    document.querySelector("#operation").value = "";
    document.querySelector("#varCompareValue").value = "";
    document.querySelector("#finalExpression").innerHTML = "";
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
    const evaluatedExpression = this.evalForExpression();
    if (!evaluatedExpression.succsess) {
      this.wizardForm.dnd.expressionContainerBorder("error");
      this.wizardForm.dnd.displayExpressionError(
        "builderExpressionError",
        evaluatedExpression.message
      );
      return;
    }
    const assignExp = this.wizardForm.dnd.getDroppedForItems(0);
    const testExp = this.wizardForm.dnd.getDroppedForItems(1);
    const updateExp = this.wizardForm.dnd.getDroppedForItems(2);
    const {
      variableName,
      initialValue,
      operator,
      compareValue,
      updateOperation,
    } = evaluatedExpression.payload;
    const varState = [...this.getAllVariableScope()]
      .map((vs) => vs[1])
      .filter((vs) => vs.id === this.id);
    this.initialValue = initialValue;
    this.variableValue = this.initialValue;
    this.variableName = variableName;
    this.radioOption = operator;
    this.radioVar = "defineVar";
    this.variableCompareValue = compareValue;
    this.operation = updateOperation;
    this.declaration = "int";
    this.declarationType = "Normal";
    this.code = `int ${hiddenValue}`;
    this.setScope(varState);
    this.droppedElements = [assignExp, testExp, updateExp];
    this.cleanAndUpdateBlockForm(div);
  }

  evalForExpression() {
    const assignExp = this.getDroppedExpression(0);
    const testExp = this.getDroppedExpression(1);
    const updateExp = this.getDroppedExpression(2);
    if (this.isEmptyExpression(assignExp, testExp, updateExp))
      return { succsess: false, message: "Syntax error: has empty drop zone" };
    return this.evalIndividualForExpression({ assignExp, testExp, updateExp });
  }

  evalIndividualForExpression({ assignExp, testExp, updateExp }) {
    try {
      const code = `function main(){
        for(var ${assignExp}; ${testExp}; ${updateExp}){}
       }`;
      const jsInterpreter = new ParseJsInterpreter(new AstJsVisitor());
      const body = acorn.parse(code, {
        ecmaVersion: 5,
        preserveParens: true,
      }).body;
      jsInterpreter.interpret(body);
      jsInterpreter.visitor.setWrapTabId();
      const codeParsed = jsInterpreter.visitor.codeParsed;
      if (
        !codeParsed.length &&
        codeParsed.length > 0 &&
        codeParsed[0].length < 1
      ) {
        return { succsess: false, message: `Unknown error` };
      }
      const props = codeParsed[0][1];
      if (![">", ">=", "<", "<="].includes(props.radioOption)) {
        return {
          succsess: false,
          message: `Syntax error: test operator should be > >= < <=`,
        };
      }
      const payload = {
        variableName: props.variableName,
        initialValue: props.initialValue,
        operator: props.radioOption,
        compareValue: props.variableCompareValue,
        updateOperation: updateExp,
      };
      return { succsess: true, payload };
    } catch (error) {
      if (!this.wizardForm.dnd.validateForm)
        return this.notEvalForExpression({ assignExp, testExp, updateExp });
      return { succsess: false, message: `Unknown error: ${error.message}` };
    }
  }

  notEvalForExpression({ assignExp, testExp, updateExp }) {
    const variableName = assignExp.length > 0 ? assignExp[0] : "";
    let initialValue = assignExp.length >= 2 ? assignExp[2] : 0;
    let operator = testExp.length >= 1 ? testExp[1] : "<";
    let compareValue = testExp.length >= 2 ? testExp[2] : 0;
    if (![">", ">=", "<", "<="].includes(operator)) operator = "<";
    if (isNaN(initialValue)) initialValue = 0;
    if (isNaN(compareValue)) compareValue = 0;
    const payload = {
      variableName,
      initialValue,
      operator,
      compareValue,
      updateOperation: updateExp,
    };
    return { succsess: true, payload };
  }

  getDroppedExpression(index) {
    return this.wizardForm.dnd
      .getDroppedForItems(index)
      .reduce((acc, curr) => acc + curr.userValue, "");
  }

  isEmptyExpression(assignExp, testExp, updateExp) {
    if (!this.wizardForm.dnd.validateForm) return false;
    return (
      Utils.isEmpty(assignExp) ||
      Utils.isEmpty(testExp) ||
      Utils.isEmpty(updateExp)
    );
  }
}
