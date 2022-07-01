class WizardForm {
  constructor(props) {
    this.builderItems = props.builderItems;
    this.block = props.block;
    this.droppedElements = props.block.droppedElements;
    this.dnd = null;
  }

  show() {
    document.querySelector("#wizardBuilderContent").innerHTML = this.template();
    this.setDataToDroppedElements();
    this.dnd = new DragAndDrop(this.getOptions());
    this.dnd.buildWizardExpression();
    this.dnd.addListenersToDroppedItemsOnLoad();
    if (
      this.block.type === "inputBlock" &&
      this.block.radioOption === "selectVar"
    )
      this.dnd.currentDropZone = document.querySelector("#dropZone");
    if (this.block.type === "wrapBlock") this.addWrapListeners();
  }

  setDataToDroppedElements() {
    this.droppedElements.forEach((droppedElement) => {
      if (["forBlock", "defineBlock", "inputBlock"].includes(this.block.type)) {
        droppedElement.forEach((subDroppedElement) =>
          this.setWizardJsonData(subDroppedElement)
        );
      } else {
        this.setWizardJsonData(droppedElement);
      }
    });
  }

  setWizardJsonData(droppedElement) {
    const element = document.getElementById(droppedElement.uuid);
    delete droppedElement.uuid;
    element.setAttribute("data-we", JSON.stringify(droppedElement));
  }

  getOptions() {
    return {
      draggableSelector: ".draggable",
      dropZoneSelector: "#dropZone",
      specialDropZones: this.getSpecialDropZones(),
      currentDropZoneSelector: this.getDropSelector(),
      expressionSelectorVisible: "#expressionBuildedVisible",
      expressionSelectorHidden: "#expressionBuildedHidden",
      expressionContainer: ".expressionBuildedContainer",
      block: this.block,
    };
  }

  getDropSelector() {
    switch (this.block.type) {
      case "forBlock":
        return "#forAssign";
      case "defineBlock":
      case "inputBlock":
        return "#defineVar";
      default:
        return "#dropZone";
    }
  }

  getSpecialDropZones() {
    switch (this.block.type) {
      case "forBlock":
        return ["forAssign", "forTest", "forUpdate"];
      case "defineBlock":
      case "inputBlock":
        return ["defineVar", "assignVar", "valueVar"];
      default:
        return [];
    }
  }

  template() {
    return `
      ${this.getCustomTemplate()}
      <section class="wizard-all-zones">
        <section class="dropZone-container">
          <div id="dropZone" class="dropZone custom-gray-scroll" data-content="Drop here...">${this.renderDroppedItems()}</div>
        </section>
        <section class="dragZone-builderItems custom-gray-scroll">
          ${this.renderBuilderItems()}
        </section>
        <section class="wizard-expressions-container">
          <div style="display:flex;flex-direction:column;">
            <p style="color:#726f6f;font-weight:bold;">Wizard expression</p>
            <div class="expressionBuildedContainer">
              <input type="text" id="expressionBuildedVisible" name="expressionBuildedVisible" value="" disabled />
            </div>
          </div>
          <div id="realBuildedExpression" class="realBuildedExpression hide">
            <p style="color:#726f6f;font-weight:bold;">Code expression</p>
            <div class="expressionBuildedContainer">
              <input type="text" id="expressionBuildedHidden" name="expressionBuildedHidden" value="" disabled /> 
            </div>
          </div>  
        </section>  
        <p id="builderExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
        <div class="hide">
          <input type="text" id="expressionBuildedHiddenToParse" name="expressionBuildedHiddenToParse" value="" disabled />
        </div>
      </section>`;
  }

  renderDroppedItems() {
    this.setUuidToDroppedItems();
    switch (this.block.type) {
      case "forBlock":
        return this.renderForBlockDroppedItems();
      case "defineBlock":
        return this.renderDefineBlockDroppedItems();
      case "inputBlock":
        return this.renderInputBlockDroppedItems();
      default:
        return this.renderDefaultDroppedItems(this.droppedElements);
    }
  }

  setUuidToDroppedItems() {
    this.droppedElements = this.droppedElements.map((element) => {
      if (["forBlock", "defineBlock", "inputBlock"].includes(this.block.type)) {
        return element.map((subElement) => this.setUuid(subElement));
      }
      return this.setUuid(element);
    });
  }

  setUuid(element) {
    element.uuid = Utils.uuid();
    return element;
  }

  renderDefaultDroppedItems(droppedElements) {
    return droppedElements
      .map(
        (el) =>
          `<div id="${el.uuid}" class="draggable ${
            el.name
          }-wizard-box cloned }" draggable="true" style="background-color:${
            el.color.bg
          }; color:${el.color.font}">
         <input type="text" value='${
           el.type !== "logical"
             ? el.name !== "assign"
               ? el.userValue
               : el.value
             : el.value
         }'  data-values='${
            el.name !== "variable" && el.name !== "function"
              ? el.userValue
              : JSON.stringify(el.extraProps)
          }' style="width:auto;text-align: left;color:${
            el.color.font
          }" class="wizard-box-value" disabled />
         ${
           el.type === "input" ||
           (el.type === "helper" && el.name === "wildcard")
             ? `<svg  viewBox="0 0 20 20" class="icon-svg h-5 w-5" style="fill:${el.color.font}; justify-self: center; cursor: pointer; font-size: 1.7em;">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
            </svg>`
             : ""
         }
       </div>`
      )
      .join("");
  }

  renderForBlockDroppedItems() {
    return `<h2 class="wizardForDropTitle hide">Assign</h2>
        <div id="forAssign" class="wizardForDrop for-assign custom-gray-scroll" data-content="Assign drop zone">${this.renderDefaultDroppedItems(
          this.droppedElements.length > 0 ? this.droppedElements[0] : []
        )}</div>
        <h2 class="wizardForDropTitle hide">Test</h2>
        <div id="forTest" class="wizardForDrop for-test custom-gray-scroll" data-content="Test drop zone">${this.renderDefaultDroppedItems(
          this.droppedElements.length > 2 ? this.droppedElements[1] : []
        )}</div>
        <h2 class="wizardForDropTitle hide">Update</h2>
        <div id="forUpdate" class="wizardForDrop custom-gray-scroll for-update" data-content="Update drop zone">${this.renderDefaultDroppedItems(
          this.droppedElements.length >= 2 ? this.droppedElements[2] : []
        )}</div>`;
  }

  renderDefineBlockDroppedItems() {
    return `<h2 class="wizardForDropTitle hide">Define</h2>
       <div id="defineVar" class="wizardForDrop define-var custom-gray-scroll" data-content="define drop zone">${this.renderDefaultDroppedItems(
         this.droppedElements.length > 0 ? this.droppedElements[0] : []
       )}</div>
       <h2 class="wizardForDropTitle hide">Assign</h2>
       <div id="assignVar" class="wizardForDrop define-assign custom-gray-scroll" data-content="assign drop zone">${this.renderDefaultDroppedItems(
         this.droppedElements.length > 2 ? this.droppedElements[1] : []
       )}</div>
       <h2 class="wizardForDropTitle hide">Value</h2>
       <div id="valueVar" class="wizardForDrop define-value custom-gray-scroll" data-content="value drop zone">${this.renderDefaultDroppedItems(
         this.droppedElements.length >= 2 ? this.droppedElements[2] : []
       )}</div>`;
  }

  renderInputBlockDroppedItems() {
    return `<h2 class="wizardForDropTitle hide">Define</h2>
       <div id="defineVar" class="wizardForDrop define-var custom-gray-scroll" data-content="${
         this.block.radioOption === "selectVar"
           ? "select drop zone"
           : "define drop zone"
       }">${this.renderDefaultDroppedItems(
      this.droppedElements.length > 0 ? this.droppedElements[0] : []
    )}</div>
       <h2 class="wizardForDropTitle hide">Assign</h2>
       <div id="assignVar" class="wizardForDrop custom-gray-scroll define-assign ${
         this.block.radioOption === "selectVar" ? "input-wizard" : ""
       }" data-content="${
      this.block.radioOption === "selectVar" ? "disabled" : "assign drop zone"
    }">${this.renderDefaultDroppedItems(
      this.droppedElements.length > 2 ? this.droppedElements[1] : []
    )}</div>
       <h2 class="wizardForDropTitle hide">Value</h2>
       <div id="valueVar" class="wizardForDrop custom-gray-scroll define-value ${
         this.block.radioOption === "selectVar" ? "input-wizard" : ""
       }" data-content="${
      this.block.radioOption === "selectVar" ? "disabled" : "value drop zone"
    }">${this.renderDefaultDroppedItems(
      this.droppedElements.length >= 2 ? this.droppedElements[2] : []
    )}</div>`;
  }

  renderBuilderItems() {
    return this.builderItems
      .map(
        (items) =>
          `${
            this.renderGroup(items.items)
              ? `<div class="wizzard-items"><span>${
                  items.group
                }</span><div class="wizzard-box">
            ${this.renderSubItemsTemplate(items.items)}
          </div></div>`
              : ""
          }`
      )
      .join("");
  }

  renderSubItemsTemplate(items) {
    return items
      .map(
        (item) =>
          `${
            item.enable
              ? `<div>
            <div class="draggable ${item.name}-wizard-box ${
                  item.isNew ? "new-wizard-box" : ""
                }" data-we='${JSON.stringify(
                  item
                )}' draggable="true" style="background-color:${
                  item.color.bg
                }; color:${item.color.font}">
              <input type="text" value="${item.displayValue}" style="width:${
                  item.displayValue.length + 1
                }ch;text-align: center; color:${
                  item.color.font
                }" class="wizard-box-value" disabled />
            </div>
          ${
            item.isNew ? '<h6 class="new-wizard-box-title">new!</h6>' : ""
          }</div>`
              : ""
          }`
      )
      .join("");
  }

  getCustomTemplate() {
    const {
      labelFirstOption,
      labelSecondOption,
      firstOptionVal,
      secondOptionVal,
      firstOptionId,
      secondOptionId,
      titleFirstOption,
      titleSecondOption,
    } = this.getCustomTemplateProps();
    switch (this.block.type) {
      case "outputBlock":
      case "inputBlock":
        return `<section class="wizard-radio-grid">
             <div class="containerRadio"  title='${titleFirstOption}'>
               <label for='${firstOptionId}'>${labelFirstOption}
                 <input type="radio" id='${firstOptionId}' name="optionTypeWizard" value='${firstOptionVal}' ${
          this.block.radioOption === firstOptionVal ? "checked" : ""
        } > 
                 <span class="checkmarkRadio" style="border: 0.5px solid #ababab;"></span>
               </label>
            </div>
            <div class="containerRadio" title='${titleSecondOption}'>
              <label for='${secondOptionId}'>${labelSecondOption}
                <input type="radio" id='${secondOptionId}' name="optionTypeWizard" value='${secondOptionVal}' ${
          this.block.radioOption === secondOptionVal ? "checked" : ""
        } > 
                <span class="checkmarkRadio" style="border: 0.5px solid #ababab;"></span>
              </label>
            </div>
          </section>`;
      case "wrapBlock":
        return `<div id="defineNewBtnWizard" style="display:flex;justify-content:left;align-items:center;margin-bottom:5px; font-size:1.4em;">
             <span style="padding:5px;border:2px solid #237874;border-radius:20px;color:#237874;font-weight:bold;cursor:pointer;">Declare New Function</span>
           </div>
          `;
      default:
        return "";
    }
  }

  addWrapListeners() {
    this.declareWizardBtn = document.querySelector("#defineNewBtnWizard");
    const message = ` <p>Do you want to declare a new function?.</p> 
           <p>Define new function form will open.</p>
           <p>If you accept, you will lose the changes to this form.</p>`;
    this.declareWizardBtn.addEventListener(
      "click",
      this.block.handleDeclareNew.bind(this.block, "Wizard", message)
    );
  }

  getCustomTemplateProps() {
    if (this.block.type === "outputBlock") {
      return {
        labelFirstOption: "print line",
        labelSecondOption: "print",
        firstOptionVal: "println",
        secondOptionVal: "print",
        firstOptionId: "printlnWizard",
        secondOptionId: "printWizard",
        titleFirstOption: "create a print line output",
        titleSecondOption: "create a print output",
      };
    } else if (this.block.type === "inputBlock") {
      return {
        labelFirstOption: "Select variable",
        labelSecondOption: "Define new",
        firstOptionVal: "selectVar",
        secondOptionVal: "defineVar",
        firstOptionId: "selectVarWizard",
        secondOptionId: "defineVarWizard",
        titleFirstOption: "select variable",
        titleSecondOption: "create new variable",
      };
    } else {
      return {
        labelFirstOption: "",
        labelSecondOption: "",
        firstOptionVal: "",
        secondOptionVal: "",
        firstOptionId: "",
        secondOptionId: "",
        titleFirstOption: "",
        titleSecondOption: "",
      };
    }
  }

  renderGroup(items) {
    return items.some((item) => item.enable);
  }
}
