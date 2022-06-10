class Block {
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
    this.id = id;
    this.c = canvas;
    this.type = type;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.minw = w;
    this.accumulativeHeight = 0;
    this.selected = false;
    this.isIntercepted = false;
    this.grabed = false;
    this.lastGoodPosition = { x: x, y: y };
    this.lastDimension = { w, h };
    this.widthBeforeExpand = w;
    this.error = false;
    this.grabPosition = { x: w / 2, y: h / 2 };
    this.code = code;
    this.wizardCode = "";
    this.editing = false;
    this.scaleFactor = scaleFactor || 1;
    this.incrementWidthLeftLine = 0;
    this.incrementWidthRightLine = 0;
    this.parentId = null;
    this.isProgram = isProgram;
    this.fontSize = 20;
    this.fontSizeCode = 20;
    this.textProps = { startText: 10, verticalAlignText: 1.5, substring: 10 };
    this.fontName = "Roboto";
    this.languageOutput = languageOutput;
    this.isLocked = false;
    this.compileError = { hasError: false, errorMessages: [] };
    this.parentsScope = [];
    this.allParentScope = [];
    this.colors = null;
    this.highlighted = false;
    this.breakpoint = null;
    this.cogwheel = null;
    this.droppedElements = [];
  }

  renderDependencies(lineColor) {
    this.renderHooks(lineColor);
    this.renderCogwheel();
    this.renderBreakpoint();
  }

  remove() {
    if (this.breakpoint) this.breakpoint.removeFromGlobalBreakpoint();

    this.c.program.splice(this.c.program.indexOf(this), 1);
  }

  renderCogwheel() {
    if (this.cogwheel !== null && this.c.renderCogwheel) {
      this.cogwheel.render();
    }
  }

  renderBreakpoint() {
    if (this.breakpoint !== null) {
      this.breakpoint.render();
    }
  }

  updateCogwheelMove(x, y) {
    if (this.cogwheel && this.c.renderCogwheel) {
      this.cogwheel.move(x, y, this.w, this.h);
    }
  }

  updateBreakpointMove(x, y) {
    if (this.breakpoint) {
      this.breakpoint.x = x;
      this.breakpoint.y = y;
    }
  }

  clearCompileError() {
    this.compileError = { hasError: false, errorMessages: [] };
  }

  addBreakpoint() {
    if (this.breakpoint) return;
    this.breakpoint = new Breakpoint(
      this.c,
      this.x + this.w / 2,
      this.y + this.h,
      this.id
    );
    this.breakpoint.addToGlobalBreakpoint();
  }

  removeBreakpoint() {
    if (!this.breakpoint) return;
    this.breakpoint.removeFromGlobalBreakpoint();
    this.c.processBreakpointFromTo(this.id, "removeBreakpointFromFlowToEditor");
    this.breakpoint = null;
  }

  isTouching(x, y) {
    if (
      this.x < x &&
      x < this.x + this.w &&
      this.y < y &&
      y < this.y + this.h
    ) {
      let ok = true;
      if (ok) return true;
      else return false;
    } else {
      return false;
    }
  }

  isColliding(o) {
    if (this.x < o.x + o.w && o.x < this.x + this.w) {
      if (this.y < o.y + o.h && o.y < this.y + this.h) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  setRenderColor({ blockColor, lineColor }) {
    if (this.c.expanded && !this.isProgram) {
      const strokeColor =
        this.type !== "startBlock" && this.type !== "endBlock"
          ? "#858585"
          : configEditor.flow.customizedBlocks[this.type].lineColor;
      const fillColor =
        this.type !== "startBlock" && this.type !== "endBlock"
          ? "#dddddd"
          : configEditor.flow.customizedBlocks[this.type].blockColor;
      this.c.ctx.strokeStyle = strokeColor;
      this.c.ctx.fillStyle = fillColor;
    } else {
      this.c.ctx.strokeStyle = this.isIntercepted
        ? "#46ea4b"
        : this.error
        ? "red"
        : this.selected || this.highlighted
        ? "blue"
        : lineColor;
      this.c.ctx.fillStyle = blockColor;
    }
  }

  renderTextCode({ horizontalText, maxWidth }) {
    let textW = "";
    if (this.type === "ifBlock") {
      textW = this.isProgram ? this.x - this.w / 2 - horizontalText : this.x;
    } else {
      textW = this.isProgram
        ? this.x + this.textProps.startText
        : this.x + this.w / 2;
    }
    if (
      !this.isProgram ||
      Utils.isEmpty(this.code) ||
      typeof this.code !== "string"
    )
      return { code: this.code, textW };
    let code = "";
    const codeSplit = [...this.code];
    for (let i = 0; i < codeSplit.length; i++) {
      const width = this.c.ctx.measureText(code).width;
      if (width < maxWidth) {
        code += codeSplit[i];
      } else {
        code = this.replaceLastThreeCharacters(code);
        break;
      }
    }
    return { code, textW };
  }

  replaceLastThreeCharacters(code) {
    const length = code.length;
    if (length < 3) return code;
    return `${code.substring(0, length - 3)}...`;
  }

  drawErrorText(text, font, x, y) {
    this.c.ctx.restore();
    this.c.ctx.save();
    this.c.ctx.font = `${font}px ${this.fontName}`;
    this.c.ctx.textBaseline = "top";
    this.c.ctx.fillStyle = "#ffffff";
    this.c.ctx.lineWidth = 1;
    const width = this.c.ctx.measureText(text).width;
    this.c.ctx.strokeStyle = "#f50";
    this.c.ctx.strokeText(text, x, y, width);
    this.c.ctx.restore();
    this.c.ctx.save();
  }

  genericTemplate(props) {
    const style =
      "height: 335px; top: -130px; width: max-content; padding: 15px 10px; text-align:left;";
    return `<div id="window-dim-code" class="window-dim-code-default">
          <div id="window-code" class="window-modal custom-gray-scroll">
            <h2 style="width:125px;font-size:1.4rem;position:absolute;top:20px;right:20px;color:#777;text-shadow: 2px 2px #bbbbbb;text-align:end;">${
              props.title
            }</h2> 
            <div class="builder-tabs">
              <div id="manualBuilderTab" class="builder-tabs-tab builder-tab-active">Manual</div>
              <div id="wizardBuilderTab" class="builder-tabs-tab builder-tab-inactive">Wizard</div>
              <span id="borderBuilder" class="border-builder-clear border-builder-clear-m"></span>      
            </div>
            <section id="manualBuilder"> 
              <div id="title" style="font-weight: bold; display: flex; justify-content:end; align-items: flex-end;">
                <div class="filter-tooltip"><i style="font-size: 1.1em; color: #fff; background: #1B3F91; width: 1em; display: block; border-radius: 50%; text-align: center;">?</i>
                  <span class="filter-tooltiptext filter-tooltip-left" style='${
                    props.styles ? props.styles : style
                  }'>
                    ${props.help}
                  </span>
                </div>  
              </div>
              <form id="blockForm" name="blockForm">
                ${props.content}
                ${this.templateButtons("buttons", "ok-modal", "cancel-modal")}
              </form>
            </section>
            <section id="wizardBuilder" class="hide" style="width:inherit;max-height:100vh;">
              <div id="wizardBuilderContent"></div>
              <div style="display: flex;align-items: end;width: inherit;">
                ${this.templateSwitch()}
                ${this.templateButtons(
                  "buttonsWizard",
                  "ok-modal-wizard",
                  "cancel-modal-wizard"
                )}
              </div>
            </section>
          </div>
       </div>`;
  }

  renderWizardBuilder(div) {
    if (this.c.languageOutput !== "java") return;
    const items = !this.c.wizardItems.length
      ? WizardItems.getAllItems()
      : this.c.wizardItems;
    const builderItems = WizardItems.getItemsByTypeBlock(items, this.type);
    this.wizardForm = new WizardForm({ builderItems, block: this });
    this.wizardForm.show();
    this.addBuilderFormListeners(div);
  }

  templateButtons(idContainer, ok, cancel) {
    return `
      <p id="${idContainer}">
        <input type="button" class="button" id="${cancel}" style="background:red; color:#fff; margin-top:10px; border: none; font-weight: bold; width: 65px; text-align:center;" value="Cancel">
        <input type="submit" class="button" id="${ok}" style="background:green; color:#fff; margin-top:10px; border: none; font-weight: bold; width: 65px; text-align:center;" value="Ok">
      </p>`;
  }

  templateSwitch() {
    return `<section style="display: flex;align-items: center;margin-right: auto;font-size: 1.2em;">
         <div style="display: flex;align-items: center;margin-right: 20px;">
           <p style="margin-right:5px;" >View code</p>
           <label class="switch-subitem">
             <input id="viewRealBuildedExpression" name="viewRealBuildedExpression" type="checkbox" />
             <span class="slider-subitem"></span>
           </label>
         </div>
         <div style="display: flex;align-items: center;">
           <p style="margin-right:5px;" >Validate</p>
           <label class="switch-subitem">
             <input id="validateExpressionSwitch" name="validateExpressionSwitch" type="checkbox" checked />
             <span class="slider-subitem"></span>
           </label>
         </div>
         <section id="changeWizardGridContainer" style="display:flex;margin-left:20px;">
           <div id="changeWizardGridLeft" class="change-wizard-grid"></div>
           <div id="changeWizardGridBottom" class="change-wizard-grid change-wizard-grid-bottom change-wizard-grid-active"></div>
           <div id="changeWizardGridRight" class="change-wizard-grid change-wizard-grid-right"></div>
         </section>
       </section>`;
  }

  addBuilderFormListeners(div) {
    this.switchBuildedExpression = document.querySelector(
      "#viewRealBuildedExpression"
    );
    this.switchValidateExpression = document.querySelector(
      "#validateExpressionSwitch"
    );
    this.builderTabs = document.querySelector(".builder-tabs");
    this.cancelBuilderBtn = document.querySelector("#cancel-modal-wizard");
    this.okBuilderBtn = document.querySelector("#ok-modal-wizard");
    this.changeWizardGrid = document.querySelector(
      "#changeWizardGridContainer"
    );
    this.builderTabs.addEventListener(
      "click",
      this.switchBuilderTab.bind(this)
    );
    this.cancelBuilderBtn.addEventListener(
      "click",
      this.closeBuilder.bind(this, div)
    );
    this.switchBuildedExpression.addEventListener(
      "change",
      this.handleSwitchExpression.bind(this)
    );
    this.switchValidateExpression.addEventListener(
      "change",
      this.handleSwitchValidateExpression.bind(this)
    );
    this.changeWizardGrid.addEventListener(
      "click",
      this.handleChangeWizardGrid.bind(this)
    );
  }

  switchBuilderTab(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (target.id === "manualBuilderTab") {
      this.updateWizardGridStyles(
        document.querySelector("#changeWizardGridBottom")
      );
      this.toggleBuilderClass(target, "manualBuilder", "wizardBuilder");
    } else if (target.id === "wizardBuilderTab") {
      this.toggleBuilderClass(target, "wizardBuilder", "manualBuilder");
      this.updateWizardGridStyles(
        document.querySelector("#changeWizardGridLeft")
      );
    }
  }

  toggleBuilderClass(target, sectionActive, sectionHide) {
    target.classList.remove("builder-tab-inactive");
    target.classList.add("builder-tab-active");
    document
      .querySelector(`#${sectionHide}Tab`)
      .classList.remove("builder-tab-active");
    document
      .querySelector(`#${sectionHide}Tab`)
      .classList.add("builder-tab-inactive");
    document.querySelector(`#${sectionHide}`).classList.add("hide");
    document.querySelector(`#${sectionActive}`).classList.remove("hide");
    const borderDel =
      sectionActive === "wizardBuilder"
        ? "border-builder-clear-m"
        : "border-builder-clear-w";
    const borderAdd =
      sectionActive === "wizardBuilder"
        ? "border-builder-clear-w"
        : "border-builder-clear-m";
    const className =
      sectionActive === "wizardBuilder"
        ? "window-dim-code-wizard-left-right"
        : "";
    document.querySelector("#window-dim-code").className = "";
    document.querySelector("#window-dim-code").className = [
      `window-dim-code-default ${className}`,
    ];
    document.querySelector(`#borderBuilder`).classList.remove(borderDel);
    document.querySelector(`#borderBuilder`).classList.add(borderAdd);
  }

  handleSwitchExpression(ev) {
    ev.preventDefault();
    const viewCode = document.querySelector("#realBuildedExpression");
    if (ev.target.checked) {
      viewCode.classList.remove("hide");
    } else {
      viewCode.classList.add("hide");
    }
  }

  handleSwitchValidateExpression(ev) {
    ev.preventDefault();
    const checked = ev.target.checked;
    this.wizardForm.dnd.setValidationForm(checked);
  }

  handleChangeWizardGrid(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (
      !target.classList.contains("change-wizard-grid") ||
      target.classList.contains("change-wizard-grid-active")
    )
      return;
    this.updateWizardGridStyles(target);
  }

  updateWizardGridStyles(target) {
    [...this.changeWizardGrid.children].forEach((el) =>
      el.classList.remove("change-wizard-grid-active")
    );
    target.classList.add("change-wizard-grid-active");
    const h = window.innerHeight - 105;
    const windowDimCode = document.querySelector("#window-dim-code");
    const wizardAllZones = document.querySelector(".wizard-all-zones");
    const dropZoneContainer = document.querySelector(".dropZone-container");
    const dragZoneBuilderItems = document.querySelector(
      ".dragZone-builderItems"
    );
    const wizardExpressionsContainer = document.querySelector(
      ".wizard-expressions-container"
    );
    wizardAllZones.className = "";
    dropZoneContainer.className = "";
    dragZoneBuilderItems.className = "";
    wizardExpressionsContainer.className = "";
    windowDimCode.className = "";
    switch (target.id) {
      case "changeWizardGridLeft":
        windowDimCode.className = [
          "window-dim-code-default window-dim-code-wizard-left-right",
        ];
        document.querySelector("#wizardBuilder").style.height = `${h}px`;
        wizardAllZones.className = [
          "wizard-all-zones wizard-all-zones-left-right",
        ];
        dragZoneBuilderItems.className = [
          "dragZone-builderItems dragZone-builderItems-left custom-gray-scroll",
        ];
        wizardExpressionsContainer.className = [
          "wizard-expressions-container wizard-expressions-container-left-right",
        ];
        dropZoneContainer.className = [
          "dropZone-container dropZone-container-left",
        ];
        document.querySelector("#dropZone").style.height = `${
          document.querySelector("#window-code").getBoundingClientRect()
            .height - 295
        }px`;
        dragZoneBuilderItems.style.height = `${
          document.querySelector("#window-code").getBoundingClientRect()
            .height - 295
        }px`;
        break;
      case "changeWizardGridRight":
        windowDimCode.className = [
          "window-dim-code-default window-dim-code-wizard-left-right",
        ];
        document.querySelector("#wizardBuilder").style.height = `${h}px`;
        dropZoneContainer.className = [
          "dropZone-container dropZone-container-right",
        ];
        dragZoneBuilderItems.className = [
          "dragZone-builderItems dragZone-builderItems-right custom-gray-scroll",
        ];
        wizardExpressionsContainer.className = [
          "wizard-expressions-container wizard-expressions-container-left-right",
        ];
        wizardAllZones.className = [
          "wizard-all-zones wizard-all-zones-left-right",
        ];
        document.querySelector("#dropZone").style.height = `${
          document.querySelector("#window-code").getBoundingClientRect()
            .height - 295
        }px`;
        dragZoneBuilderItems.style.height = `${
          document.querySelector("#window-code").getBoundingClientRect()
            .height - 295
        }px`;
        break;
      case "changeWizardGridBottom":
        windowDimCode.className = [
          "window-dim-code-default window-dim-code-wizard-bottom",
        ];
        document.querySelector("#wizardBuilder").style.height = `auto`;
        dropZoneContainer.className = ["dropZone-container"];
        dragZoneBuilderItems.className = [
          "dragZone-builderItems custom-gray-scroll",
        ];
        wizardExpressionsContainer.className = ["wizard-expressions-container"];
        document.querySelector("#dropZone").style.height = "435px";
        dragZoneBuilderItems.style.height = "200px";
        wizardAllZones.classList.add("wizard-all-zones");
        break;
      default:
        break;
    }
    this.changeStyleOfInnerZones(target.id);
  }

  changeStyleOfInnerZones(id) {
    if (!["defineBlock", "inputBlock", "forBlock"].includes(this.type)) return;
    switch (id) {
      case "changeWizardGridLeft":
      case "changeWizardGridRight":
        document
          .querySelectorAll(".wizardForDropTitle")
          .forEach((el) => el.classList.remove("hide"));
        document
          .querySelectorAll(".wizardForDrop")
          .forEach((el) => (el.style.height = "185px"));
        break;
      case "changeWizardGridBottom":
        document
          .querySelectorAll(".wizardForDropTitle")
          .forEach((el) => el.classList.add("hide"));
        document
          .querySelectorAll(".wizardForDrop")
          .forEach((el) => (el.style.height = "137px"));
        break;
    }
  }

  closeBuilder(div, ev) {
    div.remove();
  }

  removeBuilderListener() {
    this.builderTabs.removeEventListener(
      "click",
      this.switchBuilderTab.bind(this)
    );
    this.cancelBuilderBtn.removeEventListener(
      "click",
      this.closeBuilder.bind(this)
    );
  }

  cleanAndUpdateBlockForm(div) {
    this.removeBuilderListener();
    div.remove();
    this.c.updateCanvas();
  }

  handleDeclareNew(selector, message, ev) {
    ev.preventDefault();
    if (ev.target.tagName.toLowerCase() !== "span") return;
    this.showDefineNewModal(selector, message);
    this.addDefineNewListeners(selector);
  }

  showDefineNewModal(selector, message) {
    this.overlayDefineNew = document.createElement("div");
    this.overlayDefineNew.classList.add("overlay");
    this.overlayDefineNew.id = "overlayDefineNew";
    this.overlayDefineNew.style = `background: none;`;
    document.querySelector("body").classList.add("backdropOver");
    this.overlayDefineNew.innerHTML = this.defineNewTemplate(selector, message);
    document.querySelector("body").appendChild(this.overlayDefineNew);
  }

  defineNewTemplate(selector, message) {
    return `<section class="wizardWrapFunc-container" style="gap:30px;padding:20px;width:300px;">
         <div>
           <h3 style="font-size:1.6em;">Define new function</h3> 
         </div>        
         <div style="font-size:1.5em;">
           ${message}
         </div>
         <div id="defineNewModalBtn${selector}" style="display: flex;align-items:center;justify-content: space-evenly;">
            <span id="defineModalOk" style="padding:8px;border:2px solid green;border-radius:5px;color:green;font-weight:bold;cursor:pointer;">accept</span>
            <span id="defineModalCancel" style="padding:8px;border:2px solid red;border-radius:5px;background-color:red;color:#fff;font-weight:bold;cursor:pointer;">cancel</span>
         </div>
       </section>
      `;
  }

  addDefineNewListeners(selector) {
    this.defineNewModalBtn = document.querySelector(
      `#defineNewModalBtn${selector}`
    );
    this.defineNewModalBtn.addEventListener(
      "click",
      this.handleDefineModalButtons.bind(this)
    );
  }

  handleDefineModalButtons(ev) {
    ev.preventDefault();
    const id = ev.target.id;
    if (id === "defineModalOk") {
      this.overlayDefineNew.remove();
      if (document.querySelector("#overlayEdition"))
        document.querySelector("#overlayEdition").remove();
      document.querySelector("body").classList.remove("backdropOver");
      document.querySelector(".overlay").remove();
      this.declareNewFunctionAction();
    } else if (id === "defineModalCancel") {
      this.defineNewModalBtn.removeEventListener(
        "click",
        this.handleDefineModalButtons.bind(this)
      );
      document.querySelector("body").classList.remove("backdropOver");
      this.overlayDefineNew.remove();
    }
  }

  declareNewFunctionAction() {
    this.c.loadTabByIndex(1);
    const state = { ...this.c.blockState.get("end-id"), clone: true };
    const { w, h } = flowChartEditor.API.getWidthAndHeigthBlock("wrapBlock");
    this.c.program.push(
      BlockFactory.getImplementation(
        flowChartEditor.uuid(),
        this.c,
        "wrapBlock",
        0,
        0,
        w,
        h,
        "",
        true,
        this.c.languageOutput,
        "function_declaration"
      )
    );
    const indexHook = this.c.program.findIndex(
      (block) => block.id === state.lastHook
    );
    const indexRing = this.c.program.length - 1;
    const hook = "out";
    const hookArrowIndex = flowChartEditor.API.getIndexHook(
      this.c.program[indexHook].type,
      hook
    );
    this.c.program[indexRing].x = this.c.eventHandler.setXOnDrop(
      this.c.program[indexRing],
      this.c.program[indexHook],
      hook
    );
    this.c.program[indexRing].y =
      this.c.program[indexHook].hooks[hookArrowIndex].y;
    this.c.interceptedProgram = {
      programRing: this.c.program[indexRing],
      programHook: this.c.program[indexHook],
      arrowType: hook,
    };
    this.c.eventHandler.dropInterceptedProgram();
    this.c.update();
    const wizardForm = WrapFormFactory.getImplementation(
      this.c,
      null,
      "new_empty",
      "[]",
      indexRing,
      []
    );
    wizardForm.showModal("Create function");
  }

  hasWhiteSpace(str) {
    return /\s/g.test(str);
  }

  isInvalidNameInScope() {
    const globalScope = this.c.program[0].globalScope;
    if (globalScope.hasKey(this.variableName)) {
      const scopeVar = globalScope.get(this.variableName);
      return this.id !== scopeVar.id;
    }
    if (!this.parentId) {
      if (["inputBlock", "defineBlock"].includes(this.type)) {
        if (this.type === "inputBlock" && this.radioOption === "selectVar")
          return;
        const isUsed = this.c.program.some(
          (block) =>
            block.type === "forBlock" &&
            block.parentId === null &&
            block.radioVar === "defineVar" &&
            block.variableName === this.variableName
        );
        if (isUsed) return true;
      }
    }
    this.parentsScope = [];
    if (this.parentId) {
      const index = this.c.getBlockIndex(this.parentId);
      this.parentsScope.push(this.c.program[index]);
      this.findParents(this.c.program[index].parentId, this.parentsScope);
      const isInvalidInParent = this.findVarNameInScope(
        this.parentsScope,
        this.blockProps.branch
      );
      if (isInvalidInParent) return true;
      const children = this.c
        .getChildren(this.c.program[index].id)
        .filter((child) =>
          ["whileBlock", "doWhileBlock", "forBlock", "ifBlock"].includes(
            child.type
          )
        );
      const allDescendants = this.c.getAllDescendants(children);
      return this.hasVarIntoInnerBlock(allDescendants);
    }
    return this.findVarNameInScope(this.c.program, this.blockProps.branch);
  }

  findVarNameInScope(blocks, branch) {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const { type } = block;
      const { scopeProp } = this.getScopeProps(type, branch);
      if (
        [
          "startBlock",
          "whileBlock",
          "forBlock",
          "doWhileBlock",
          "ifBlock",
        ].includes(type)
      ) {
        if (block[scopeProp].hasKey(this.variableName)) {
          const scopeVar = block[scopeProp].get(this.variableName);
          if (this.id !== scopeVar.id && this.type !== "forBlock") return true;
        }
        branch = block.blockProps.branch;
      }
    }
    return false;
  }

  hasVarIntoInnerBlock(allDescendants) {
    for (let i = 0; i < allDescendants.length; i++) {
      const idx = this.c.program.findIndex(
        (child) => child.id === allDescendants[i].id
      );
      const { scopeProp } = this.c.program[idx].getScopeProps(
        this.c.program[idx].type,
        "NO"
      );
      if (
        this.c.program[idx][scopeProp].hasKey(this.variableName) &&
        ["defineBlock", "inputBlock"].includes(this.type)
      ) {
        return true;
      }
      if (this.c.program[idx].type === "ifBlock") {
        if (
          this.c.program[idx].ifScopeBranchRight.hasKey(this.variableName) &&
          ["defineBlock", "inputBlock"].includes(this.type)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  setScope(varState) {
    let isInFlow = true;
    if (!this.hooks[0].occupied || this.isLocked) isInFlow = false;
    if (!this.parentId) {
      const index =
        this.type !== "forBlock" ? 0 : this.c.getBlockIndex(this.id);
      const { type } = this.c.program[index];
      const { scopeProp, scope } = this.getScopeProps(
        type,
        this.blockProps.branch
      );
      this.checkRenameVar(varState, index, scopeProp);
      this.addVariableToScope({ index, scopeProp, scope, isInFlow });
    } else {
      const index =
        this.type !== "forBlock"
          ? this.c.getBlockIndex(this.parentId)
          : this.c.getBlockIndex(this.id);
      const { type } = this.c.program[index];
      const { scopeProp, scope } = this.getScopeProps(
        type,
        this.blockProps.branch
      );
      this.checkRenameVar(varState, index, scopeProp);
      this.addVariableToScope({ index, scopeProp, scope, isInFlow });
    }
  }

  checkRenameVar(varState, index, scopeProp) {
    if (varState.length > 0 && this.variableName !== varState[0].name) {
      this.c.program[index][scopeProp].remove(varState[0].name);
    }
  }

  addVariableToScope({ index, scopeProp, scope, isInFlow }) {
    this.c.program[index][scopeProp].update(this.variableName, {
      id: this.id,
      name: this.variableName,
      value: this.variableValue,
      declaration: this.declaration,
      declarationType: this.declarationType,
      scope,
      isInFlow,
    });
  }

  getAllVariableScope() {
    this.allParentScope = [];
    let allScopes = [];
    let branch = this.blockProps.branch;
    if (this.parentId) {
      const index = this.c.getBlockIndex(this.parentId);
      this.allParentScope.push(this.c.program[index]);
      this.findParents(this.c.program[index].parentId, this.allParentScope);
      this.allParentScope.forEach((block) => {
        const { type } = block;
        const { scopeProp } = this.getScopeProps(type, branch);
        if (
          [
            "startBlock",
            "whileBlock",
            "forBlock",
            "doWhileBlock",
            "ifBlock",
          ].includes(type)
        ) {
          allScopes =
            block[scopeProp].size() > 0
              ? [...allScopes, block[scopeProp].state]
              : allScopes;
          branch = block.blockProps.branch;
        }
      });
    }
    allScopes.unshift(this.c.program[0].globalScope.state);
    return this.mergeMaps(...allScopes);
  }

  mergeMaps(...maps) {
    return maps.reduce((merged, list) => {
      return new Map([...merged, ...list]);
    }, new Map());
  }

  findParents(parentId, parents) {
    const index = this.c.getBlockIndex(parentId);
    if (index > -1) {
      const parentBlock = this.c.program[index].parentId;
      parents.push(this.c.program[index]);
      this.findParents(parentBlock, parents);
    }
    return;
  }

  getScopeProps(type, branch) {
    switch (type) {
      case "whileBlock":
        return { scopeProp: "whileScope", scope: this.c.scopeType.WHILE_SCOPE };
      case "doWhileBlock":
        return {
          scopeProp: "doWhileScope",
          scope: this.c.scopeType.DO_WHILE_SCOPE,
        };
      case "forBlock":
        return { scopeProp: "forScope", scope: this.c.scopeType.FOR_SCOPE };
      case "ifBlock":
        if (branch === "NO") {
          return {
            scopeProp: "ifScopeBranchLeft",
            scope: this.c.scopeType.IF_SCOPE_LEFT,
          };
        }
        return {
          scopeProp: "ifScopeBranchRight",
          scope: this.c.scopeType.IF_SCOPE_RIGHT,
        };
      default:
        return {
          scopeProp: "globalScope",
          scope: this.c.scopeType.GLOBAL_SCOPE,
        };
    }
  }

  colorFormTemplate() {
    const bgColor = this.colors ? this.colors.blockColor : "#ffffff";
    const lineColor = this.colors ? this.colors.lineColor : "#000000";
    const fontColor = this.colors ? this.colors.fontColor : "#000000";
    return {
      title: "Color Block",
      help: `<p>Choose color</p>`,
      styles: `height: 295px; top: -115px; width: max-content; padding: 15px 10px; text-align:left;`,
      content: `<div style="font-size:1.4em; margin-top:5px;">Colors</div>
      <div style="display: flex; justify-content: space-evenly; align-items: center;">
        <p>Background </p>
        <input type="color" id="backgroundColor" name="backgroundColor" value="${bgColor}"/>
        <p>Line </p>
        <input type="color" id="lineColor" name="lineColor" value="${lineColor}"/>
        <p>Font </p>
        <input type="color" id="fontColor" name="fontColor" value="${fontColor}"/>
      </div>
      <div style="margin: 10px; font-size: 1.3em; display: flex; align-items: center;">reset personal color &nbsp;<input type="checkbox" id="resetColor" name="resetColor"/></div>`,
    };
  }

  showColorModal() {
    const template = this.genericTemplate(this.colorFormTemplate());
    const div = document.createElement("div");
    div.setAttribute("class", "overlay");
    div.innerHTML = template;
    document.querySelector("body").appendChild(div);
    this.handlerColorButtons(div);
  }

  handlerColorButtons(div) {
    document.querySelector("#ok-modal").addEventListener("click", (e) => {
      e.preventDefault();
      const form = document.forms.namedItem("blockForm");
      const formData = new FormData(form);
      const isReseted = formData.get("resetColor");
      if (isReseted) {
        this.colors = null;
      } else {
        const blockColor = formData.get("backgroundColor");
        const lineColor = formData.get("lineColor");
        const fontColor = formData.get("fontColor");
        this.colors = { blockColor, fontColor, lineColor };
      }
      div.remove();
      this.c.updateCanvas();
    });
    document.querySelector("#cancel-modal").addEventListener("click", (e) => {
      div.remove();
      this.c.updateCanvas();
    });
  }

  getFixedX() {
    const state = this.c.blockState.get(this.id);
    if (!state || !this.hooks[0].occupied) return this.x;
    if (!state.hasOwnProperty("indexArrowHook"))
      throw new Error("index hook property not found");
    if (!state.hasOwnProperty("lastHook"))
      throw new Error("last hook property not found");
    const { lastHook, indexArrowHook } = state;
    const index = this.c.program.findIndex((block) => block.id === lastHook);
    if (index < 0) throw new Error("block top not found");
    if (this.c.program[index].grabed || this.c.pauseRenderX) return this.x;
    const hookX =
      this.c.program[index].hooks[indexArrowHook].x > 0
        ? this.c.program[index].hooks[indexArrowHook].x
        : -1 * this.c.program[index].hooks[indexArrowHook].x;
    return this.c.program[index].hooks[indexArrowHook].x > 0
      ? Math.abs(this.type !== "ifBlock" ? Math.abs(this.w / 2 - hookX) : hookX)
      : -1 *
          Math.abs(
            this.type !== "ifBlock" ? Math.abs(this.w / 2 + hookX) : hookX
          );
  }
}
