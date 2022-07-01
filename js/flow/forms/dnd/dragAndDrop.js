class DragAndDrop {
  constructor(options) {
    this.dragSourceItem = null;
    this.activeEvent = null;
    this.hasError = false;
    this.radioInputs = null;
    this.validateForm = true;
    this.block = options.block;
    this.draggableElements = document.querySelectorAll(
      options.draggableSelector
    );
    this.dropZone = document.querySelector(options.dropZoneSelector);
    this.currentDropZone = document.querySelector(
      options.currentDropZoneSelector
    );
    this.specialDropZones = options.specialDropZones;
    this.expressionBuildedVisible = document.querySelector(
      options.expressionSelectorVisible
    );
    this.expressionBuildedHidden = document.querySelector(
      options.expressionSelectorHidden
    );
    this.expressionBuildedHiddenToParse = document.querySelector(
      "#expressionBuildedHiddenToParse"
    );
    this.expressionContainer = document.querySelector(
      options.expressionContainer
    );
    this.overlay = document.querySelector(".overlay");
    this.addListeners();
  }

  setValidationForm(valid) {
    this.validateForm = valid;
    if (!valid) {
      this.hasError = false;
    } else {
      this.evalWizardExpression();
    }
  }

  addListeners() {
    this.draggableElements.forEach((element) => {
      element.addEventListener("dragstart", this.handleDragStart.bind(this));
      element.addEventListener("dragend", this.handleDragEnd.bind(this));
      element.addEventListener("touchstart", this.handleTouchStart.bind(this));
      element.addEventListener("touchmove", this.handleTouchMove.bind(this));
      element.addEventListener("touchend", this.handleTouchEnd.bind(this));
      // element.addEventListener(
      //   "touchend",
      //   this.detectDoubleTapClosure.bind(this)
      // );
    });
    this.overlay.addEventListener("dragenter", this.handleDragEnter.bind(this));
    this.overlay.addEventListener("dragover", this.handleDragOver.bind(this));
    this.overlay.addEventListener("dragleave", this.handleDragLeave.bind(this));
    this.overlay.addEventListener("drop", this.handleDrop.bind(this));
    this.overlay.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.overlay.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.overlay.addEventListener("mouseup", this.handleMouseUp.bind(this));
    if (this.block.type === "inputBlock") {
      this.radioInputs = document.querySelectorAll(
        'input[name="optionTypeWizard"]'
      );
      this.radioInputs.forEach((radio) =>
        radio.addEventListener("change", this.handleInputRadioBtn.bind(this))
      );
    }
  }

  handleDragStart(ev) {
    Utils.selecting(false);
    const target = ev.target;
    this.dragSourceItem = this.getModifyTarget(target);
  }

  handleDragEnter(ev) {
    ev.preventDefault();
    if (ev.target.classList.contains("dropZone")) {
      this.dropZone.classList.add("dropZone-over");
    } else if (ev.target.classList.contains("wizardForDrop")) {
      ev.target.classList.add("dropZone-over");
    }
  }

  handleDragOver(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (target.classList.contains("dropZone")) {
      this.dropZone.classList.add("dropZone-over");
    } else if (target.classList.contains("cloned")) {
      if (this.block.type !== "forBlock") {
        const initialValue =
          [...this.currentDropZone.children].indexOf(target) + 1;
        this.moveSmooth(initialValue, "add");
      } else {
        this.dropZone.classList.remove("dropZone-over");
        const parent = ev.target.parentElement;
        this.currentDropZone = document.querySelector(`#${parent.id}`);
        const initialValue =
          [...this.currentDropZone.children].indexOf(target) + 1;
        this.moveSmooth(initialValue, "add");
      }
    } else if (ev.target.classList.contains("wizardForDrop")) {
      this.dropZone.classList.remove("dropZone-over");
      this.currentDropZone = ev.target;
      this.currentDropZone.classList.add("dropZone-over");
    }
  }

  handleDragLeave(ev) {
    ev.preventDefault();
    this.currentDropZone.classList.remove("dropZone-over");
    this.dropZone.classList.remove("dropZone-over");
    this.moveSmooth(0, "remove");
  }

  handleDragEnd(ev) {
    ev.stopPropagation();
    this.dragSourceItem = null;
    this.moveSmooth(0, "remove");
    Utils.selecting(true);
    return false;
  }

  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const { type } = this.block;
    const target =
      ev.target.tagName.toLowerCase() === "input"
        ? ev.target.parentElement
        : ev.target;
    const dataWe = JSON.parse(this.dragSourceItem.getAttribute("data-we"));
    if (type === "inputBlock" && this.isInputSelectVar()) {
      if (this.currentDropZone.id !== "defineVar") {
        this.currentDropZone.classList.remove("dropZone-over");
        this.dropZone.classList.remove("dropZone-over");
        return;
      }
    }
    if (
      !target.classList.contains("dropZone") &&
      !target.classList.contains("draggable") &&
      !target.classList.contains("wizardForDrop")
    ) {
      if (this.dragSourceItem.classList.contains("cloned")) {
        this.removeDndListeners();
        this.buildWizardExpression();
      }
      return;
    } else if (target.classList.contains("draggable")) {
      if (!target.classList.contains("cloned")) {
        if (this.dragSourceItem.classList.contains("cloned")) {
          this.removeDndListeners();
          this.buildWizardExpression();
        }
        return;
      }
      if (this.dragSourceItem != target) {
        if (this.dragSourceItem.classList.contains("cloned")) {
          if (
            (type === "defineBlock" || type === "inputBlock") &&
            this.currentDropZone.id !== "valueVar"
          ) {
            this.removeDndListeners();
            return;
          }
          target.insertAdjacentElement("afterend", this.dragSourceItem);
          this.buildWizardExpression();
        } else {
          this.dropAction("afterEnd", dataWe, target);
        }
      }
      return;
    }
    if (!this.dragSourceItem.classList.contains("cloned")) {
      this.dropAction("appendChild", dataWe, target);
    }
    this.currentDropZone.classList.remove("dropZone-over");
    this.dropZone.classList.remove("dropZone-over");
  }

  dropAction(appendType, dataWe, target) {
    const clone = this.getCloneItem(dataWe);
    clone.firstElementChild.style.color = dataWe.color.font;
    const { type } = this.block;
    if (appendType === "appendChild") {
      if (
        (type === "defineBlock" || type === "inputBlock") &&
        this.currentDropZone.id !== "valueVar"
      ) {
        if (!this.appendDefineAction(clone)) return;
      }
      if (type === "forBlock" && !this.appendForAction(clone)) {
        this.displayExpressionError(
          "builderExpressionError",
          `this item can't be drop here`
        );
        return;
      }
      this.currentDropZone.appendChild(clone);
    } else {
      if (
        (type === "defineBlock" || type === "inputBlock") &&
        this.currentDropZone.id !== "valueVar"
      ) {
        clone.remove();
        this.displayExpressionError(
          "builderExpressionError",
          `this item can't be drop here`
        );
        return;
      }
      if (type === "forBlock" && !this.appendForAction(clone)) {
        this.displayExpressionError(
          "builderExpressionError",
          `this item can't be drop here`
        );
        return;
      }
      target.insertAdjacentElement("afterend", clone);
    }
    this.addCloneDndListeners(clone);
    this.fillWizardBox(clone.firstElementChild, dataWe);
    if (dataWe.type !== "input") this.buildWizardExpression();
  }

  getCloneItem(data) {
    const { type, name, color } = data;
    const clone = this.dragSourceItem.cloneNode(true);
    clone.classList.remove("new-wizard-box");
    clone.classList.add("cloned");
    clone.firstElementChild.style = "text-align: left;";
    if (type === "input" || (type === "helper" && name === "wildcard")) {
      const fillColor = color.font;
      const svg = this.createSvgIcon(fillColor);
      svg.addEventListener("click", this.handleEdition.bind(this));
      clone.appendChild(svg);
    }
    return clone;
  }

  appendDefineAction(clone) {
    if (Array.from(this.currentDropZone.children).length > 0) {
      clone.remove();
      this.displayExpressionError(
        "builderExpressionError",
        `this item can't be drop here`
      );
      return false;
    }
    const dataWe = JSON.parse(clone.dataset.we);
    if (
      (this.currentDropZone.id === "defineVar" && dataWe.name !== "variable") ||
      (this.currentDropZone.id === "assignVar" && dataWe.name !== "assign")
    ) {
      clone.remove();
      this.displayExpressionError(
        "builderExpressionError",
        `this item can't be drop here`
      );
      return false;
    }
    return true;
  }

  appendForAction(clone) {
    const dataWe = JSON.parse(clone.dataset.we);
    if (this.currentDropZone.id === "forAssign") {
      if (
        !["assign", "variable", "number", "wildcard", "function"].includes(
          dataWe.name
        )
      ) {
        clone.remove();
        return false;
      }
    }
    if (this.currentDropZone.id === "forTest") {
      if (["assign", "text", "equal", "not-equal"].includes(dataWe.name)) {
        clone.remove();
        return false;
      }
    }
    if (this.currentDropZone.id === "forUpdate") {
      if (
        [
          "text",
          "equal",
          "not-equal",
          "greater-than",
          "greater-than-equal",
          "less-than",
          "less-than-equal",
          "and",
          "or",
          "not",
        ].includes(dataWe.name)
      ) {
        clone.remove();
        return false;
      }
    }
    return true;
  }

  addCloneDndListeners(clone) {
    clone.addEventListener("dragstart", this.handleDragStart.bind(this));
    clone.addEventListener("dragend", this.handleDragEnd.bind(this));
    clone.addEventListener("dragenter", this.handleDragEnter.bind(this));
    clone.addEventListener("dragover", this.handleDragOver.bind(this));
    clone.addEventListener("dragleave", this.handleDragLeave.bind(this));
    clone.addEventListener("drop", this.handleDrop.bind(this));
  }

  handleTouchStart(ev) {
    console.log("!!>> ", ev);
    //alert(JSON.stringify(ev.srcElement.defaultValue));
    if (ev.cancelable) ev.preventDefault();
    const tagName = ev.target.tagName.toLowerCase();

    if (tagName === "svg" || tagName === "path") {
      this.handleTouchEdit(ev);
    } else {
      this.touchStartAction(ev, tagName);
    }
  }

  // let date = new Date();
  // let time = date.getTime();
  // const time_between_taps = 200; // 200ms
  // if (time - lastClick < time_between_taps) {
  //   // do stuff
  //   console.log("done");
  // }
  // lastClick = time;

  touchStartAction(ev, tagName) {
    const target = tagName === "div" ? ev.target : ev.target.parentElement;
    console.log("START ", target);
    if (!this.activeEvent) {
      const touch = ev.touches[0];
      this.lastTouch = touch;
      this.activeEvent = "start";
      if (!target.classList.contains("cloned")) {
        this.cloneTouchItem(target);
      } else {
        target.style.opacity = ".7";
        target.style.zIndex = 200;
        this.dragSourceItem = target;
      }
      Utils.dispatchMouseEvent({
        touch,
        type: "mousedown",
        element: this.overlay,
      });
    }
  }

  handleTouchEdit(ev) {
    this.handleEdition(ev);
  }

  cloneTouchItem(target) {
    const clone = target.cloneNode(true);
    target.after(clone);
    target.classList.remove("new-wizard-box");
    target.style.opacity = ".7";
    target.style.transform = "scale(2,2)";
    this.dragSourceItem = this.getModifyTarget(target);
    clone.addEventListener("touchstart", this.handleTouchStart.bind(this));
    clone.addEventListener("touchmove", this.handleTouchMove.bind(this));
    clone.addEventListener("touchend", this.handleTouchEnd.bind(this));
  }

  handleTouchMove(ev) {
    const target =
      ev.target.tagName.toLowerCase() === "div"
        ? ev.target
        : ev.target.parentElement;
    const touch = ev.touches[0];
    this.lastTouch = touch;
    Utils.dispatchMouseEvent({
      touch,
      type: "mousemove",
      element: this.overlay,
    });
    this.activeEvent = "move";
  }

  handleTouchEnd(ev) {
    if (!this.dragSourceItem) return;
    if (!this.lastTouch) return;
    Utils.dispatchMouseEvent({
      touch: this.lastTouch,
      type: "mouseup",
      element: this.overlay,
    });
  }

  detectDoubleTapClosure() {
    let lastTap = 0;
    let timeout;
    return function detectDoubleTap(event) {
      const curTime = new Date().getTime();
      const tapLen = curTime - lastTap;
      if (tapLen < 500 && tapLen > 0) {
        console.log("Double tapped!");
        event.preventDefault();
      } else {
        timeout = setTimeout(() => {
          clearTimeout(timeout);
        }, 500);
      }
      lastTap = curTime;
    };
  }

  handleMouseDown(ev) {
    if (!this.activeEvent) return;
    Utils.selecting(false);
    this.dragSourceItem.style.position = "absolute";
  }

  handleMouseMove(ev) {
    if (!this.activeEvent) return;
    const rect = document
      .querySelector(".window-modal")
      .getBoundingClientRect();
    const scrollTop = document.querySelector(".window-modal").scrollTop;
    // console.log("### ", ev);
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top + scrollTop;
    this.dragSourceItem.style.position = "absolute";
    this.dragSourceItem.style.left = x - 20 + "px";
    this.dragSourceItem.style.top = y - 20 + "px";
    this.specialDropZones.forEach((el) => {
      const box = document.querySelector(`#${el}`);
      if (
        this.validDropZone(box.getBoundingClientRect(), this.dragSourceItem)
      ) {
        this.currentDropZone = box;
        const { top } = this.getCoords(this.dragSourceItem);
        this.scrollTo(top, this.dropZone);
      } else {
        box.classList.remove("dropZone-over");
      }
    });
    this.inDropZone(
      this.currentDropZone.getBoundingClientRect(),
      this.dragSourceItem,
      this.currentDropZone
    );
  }

  handleMouseUp(ev) {
    ev.preventDefault();
    if (this.activeEvent === "move") {
      const droppedZoneBox = this.currentDropZone.getBoundingClientRect();
      if (this.validDropZone(droppedZoneBox, this.dragSourceItem)) {
        if (this.invalidInputTouchDropZone()) return;
        this.handleMouseUpAction();
      } else {
        this.removeTouchListeners(this.dragSourceItem);
        this.dragSourceItem.remove();
        this.buildWizardExpression();
      }
      this.cleanTouchItems();
    }
    Utils.selecting(true);
  }

  invalidInputTouchDropZone() {
    if (this.block.type === "inputBlock" && this.isInputSelectVar()) {
      if (this.currentDropZone.id !== "defineVar") {
        this.dragSourceItem.remove();
        this.cleanTouchItems();
        this.displayExpressionError(
          "builderExpressionError",
          `this item can't be drop here`
        );
        return true;
      }
    }
    return false;
  }

  cleanTouchItems() {
    this.activeEvent = null;
    this.dragSourceItem = null;
    this.dropZone.classList.remove("dropZone-over");
    this.currentDropZone.classList.remove("dropZone-over");
  }

  handleMouseUpAction() {
    const { type } = this.block;
    const children = Array.from(this.currentDropZone.children);
    const index = this.getZoneElementIndex(children);
    const dataWe = JSON.parse(this.dragSourceItem.getAttribute("data-we"));
    if (index > -1) {
      if (
        (type === "defineBlock" || type === "inputBlock") &&
        this.currentDropZone.id !== "valueVar"
      ) {
        if (!this.appendDefineAction(this.dragSourceItem)) {
          this.buildWizardExpression();
          return;
        }
      }
      if (type === "forBlock" && !this.appendForAction(this.dragSourceItem)) {
        this.displayExpressionError(
          "builderExpressionError",
          `this item can't be drop here`
        );
        this.buildWizardExpression();
        return;
      }
      this.updateTouchSourceItem(
        dataWe,
        this.dragSourceItem.children.length < 2
      );
      this.currentDropZone.insertBefore(
        this.dragSourceItem,
        this.currentDropZone.children[index + 1]
      );
      this.fillWizardBox(this.dragSourceItem.firstElementChild, dataWe);
      if (index + 1 === this.currentDropZone.children.length - 1)
        this.currentDropZone.scrollTop = this.currentDropZone.scrollHeight;
      this.buildWizardExpression();
    } else {
      if (
        (type === "defineBlock" || type === "inputBlock") &&
        this.currentDropZone.id !== "valueVar"
      ) {
        if (!this.appendDefineAction(this.dragSourceItem)) {
          this.buildWizardExpression();
          return;
        }
      }
      if (type === "forBlock" && !this.appendForAction(this.dragSourceItem)) {
        this.displayExpressionError(
          "builderExpressionError",
          `this item can't be drop here`
        );
        this.buildWizardExpression();
        return;
      }
      this.updateTouchSourceItem(dataWe, true);
      this.currentDropZone.appendChild(this.dragSourceItem);
      this.fillWizardBox(this.dragSourceItem.firstElementChild, dataWe);
      this.currentDropZone.scrollTop = this.currentDropZone.scrollHeight;
      if (dataWe.type !== "input") this.buildWizardExpression();
    }
  }

  getZoneElementIndex(children) {
    for (let i = 0; i < children.length; i++) {
      if (
        this.validDropZone(
          children[i].getBoundingClientRect(),
          this.dragSourceItem
        )
      ) {
        return i;
      }
    }
    return -1;
  }

  updateTouchSourceItem(data, hasChildren) {
    const { type, name, color } = data;
    this.dragSourceItem.classList.add("cloned");
    this.dragSourceItem.style.position = "initial";
    this.dragSourceItem.style.opacity = 1;
    this.dragSourceItem.style.transform = "scale(1,1)";
    this.dragSourceItem.style.zIndex = 0;
    this.dragSourceItem.firstElementChild.style.textAlign = "left";
    this.dragSourceItem.firstElementChild.style.width = "100%";
    this.dragSourceItem.firstElementChild.style.color = color.font;
    if (this.dragSourceItem.lastChild.tagName === "svg") return;
    if (
      (type === "input" && hasChildren) ||
      (type === "helper" && name === "wildcard" && hasChildren)
    ) {
      const fillColor = color.font;
      const svg = this.createSvgIcon(fillColor);
      svg.addEventListener("click", this.handleEdition.bind(this));
      this.dragSourceItem.appendChild(svg);
    }
  }

  getModifyTarget(target) {
    const { isNew, enable, ...rest } = JSON.parse(
      target.getAttribute("data-we")
    );
    target.setAttribute("data-we", JSON.stringify(rest));
    return target;
  }

  handleEdition(ev) {
    ev.preventDefault();
    const target = ev.target;
    const parent =
      target.tagName.toLowerCase() === "svg"
        ? target.parentElement
        : target.tagName.toLowerCase() === "path"
        ? target.parentElement.parentElement
        : null;
    if (!parent || document.querySelector("#overlayEdition")) return;
    const dataWe = JSON.parse(parent.getAttribute("data-we"));
    const firstChild = parent.firstElementChild;
    this.fillWizardBox(firstChild, dataWe);
  }

  fillWizardBox(element, data) {
    switch (data.name) {
      case "number":
      case "text":
      case "wildcard":
        new WizardEditItem(this, element, data).show();
        break;
      case "and":
      case "or":
      case "not":
        element.value = data.value;
        break;
      case "variable":
        this.fillVariableBox(element, data);
        break;
      case "function":
        new WizardEditFuncItem(this, element, data).show();
        break;
      case "bool":
        new WizardEditBoolItem(this, element, data).show();
        break;
      default:
        break;
    }
  }

  fillVariableBox(element, data) {
    switch (this.block.type) {
      case "forBlock":
        if (element.parentElement.parentElement.id === "forAssign") {
          const children = [...element.parentElement.parentElement.children];
          let existVarAssign = false;
          for (const child of children) {
            const dataWE = JSON.parse(child.dataset.we);
            if (dataWE.forVar && data.userValue !== dataWE.userValue)
              existVarAssign = true;
          }
          if (!existVarAssign) {
            new WizardNewVariableForForm(this, element, data).show();
          } else {
            new WizardEditVarItem(this, element, data).show();
          }
        } else {
          new WizardEditVarItem(this, element, data).show();
        }
        break;
      case "defineBlock":
        if (element.parentElement.parentElement.id === "defineVar") {
          new WizardNewVariableDefineForm(this, element, data).show();
        } else if (element.parentElement.parentElement.id === "valueVar") {
          new WizardEditVarItem(this, element, data).show();
        } else {
          element.parentElement.remove();
        }
        break;
      case "inputBlock":
        if (this.isInputSelectVar()) {
          new WizardEditVarItem(this, element, data).show();
        } else if (element.parentElement.parentElement.id === "defineVar") {
          new WizardNewVariableDefineForm(this, element, data).show();
        } else if (element.parentElement.parentElement.id === "valueVar") {
          new WizardEditVarItem(this, element, data).show();
        } else {
          element.parentElement.remove();
        }
        break;
      default:
        new WizardEditVarItem(this, element, data).show();
    }
  }

  buildWizardExpression() {
    switch (this.block.type) {
      case "forBlock":
        this.buildForWizardExpression();
        break;
      case "defineBlock":
      case "inputBlock":
        this.buildDefineWizardExpression();
        break;
      default:
        this.buildDefaultWizardExpression();
    }
  }

  buildDefaultWizardExpression() {
    const children = Array.from(this.currentDropZone.children);
    this.expressionBuildedVisible.value = children.reduce(
      (acc, curr) => acc + curr.firstElementChild.value + " ",
      ""
    );
    this.expressionBuildedHidden.value = this.childrenReduce(children, false);
    this.expressionBuildedHiddenToParse.value = this.childrenReduce(
      children,
      true
    );
    this.evalWizardExpression();
  }

  buildForWizardExpression() {
    const dropZoneChildren = Array.from(this.dropZone.children).filter(
      (el) => el.tagName.toLowerCase() !== "h2"
    );
    let expression = "";
    dropZoneChildren.forEach((dropZoneChild, index) => {
      const children = Array.from(dropZoneChild.children);
      expression += children.reduce(
        (acc, curr) => acc + curr.firstElementChild.value + " ",
        ""
      );
      expression += index < 2 ? "; " : "";
    });
    this.expressionBuildedVisible.value = expression;
    expression = "";
    dropZoneChildren.forEach((dropZoneChild, index) => {
      const children = Array.from(dropZoneChild.children);
      expression += this.childrenReduce(children, false);
      expression += index < 2 ? "; " : "";
    });
    this.expressionBuildedHidden.value = expression;
    this.expressionBuildedHiddenToParse.value = expression;
    this.evalWizardExpression();
  }

  buildDefineWizardExpression() {
    const dropZoneChildren = Array.from(this.dropZone.children).filter(
      (el) => el.tagName.toLowerCase() !== "h2"
    );
    let expression = "";
    dropZoneChildren.forEach((dropZoneChild, index) => {
      const children = Array.from(dropZoneChild.children);
      expression += children.reduce(
        (acc, curr) => acc + curr.firstElementChild.value + " ",
        ""
      );
    });
    this.expressionBuildedVisible.value = expression;
    expression = "";
    dropZoneChildren.forEach((dropZoneChild, index) => {
      const children = Array.from(dropZoneChild.children);
      expression += this.childrenReduce(children, false);
    });
    this.expressionBuildedHidden.value = expression;
    this.expressionBuildedHiddenToParse.value = expression;
  }

  childrenReduce(children, hiddenReduce) {
    return children.reduce((acc, curr) => {
      const data = JSON.parse(curr.getAttribute("data-we"));
      const symbol = ["+", "-", "*", "/", "%", "=", "<", ">"].includes(
        data.value
      );
      const lastChar = acc.charAt(acc.length - 1);
      const spaceStart =
        !symbol &&
        ["+", "-", "*", "/", "%", "=", "<", ">"].includes(lastChar) &&
        data.userValue !== "="
          ? " "
          : "";
      const spaceEnd = symbol ? "" : " ";
      let userValue = isNaN(data.userValue)
        ? data.userValue.trim()
        : data.userValue;
      if (hiddenReduce && data.name === "number")
        userValue = userValue.replace(/d*(f|L)/g, "");
      return acc + spaceStart + userValue + spaceEnd;
    }, "");
  }

  createSvgIcon(fillColor) {
    const iconSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    const iconPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    iconSvg.setAttribute("fill", "currentColor");
    iconSvg.setAttribute("viewBox", "0 0 20 20");
    const cls = ["icon-svg", "h-5", "w-5"];
    iconSvg.classList.add(...cls);
    iconSvg.style = `fill:${fillColor};justify-self:center; cursor:pointer;font-size: 1.7em;`;
    iconPath.setAttribute(
      "d",
      "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
    );
    iconSvg.appendChild(iconPath);
    return iconSvg;
  }

  inDropZone(box, target, dropZone) {
    if (this.validDropZone(box, target)) {
      dropZone.classList.add("dropZone-over");
      const { top } = this.getCoords(target);
      this.scrollTo(top, dropZone);
    } else {
      dropZone.classList.remove("dropZone-over");
    }
  }

  validDropZone(box, target) {
    const { top, left } = this.getCoords(target);
    return (
      left > box.left && left < box.right && top > box.top && top < box.bottom
    );
  }

  getCoords(elem) {
    const box = elem.getBoundingClientRect();
    return {
      top: box.top + window.pageYOffset,
      right: box.right + window.pageXOffset,
      bottom: box.bottom + window.pageYOffset,
      left: box.left + window.pageXOffset,
    };
  }

  scrollTo(y, dropZone) {
    dropZone.style.scrollBehavior = "smooth";
    if (y > dropZone.clientHeight - 20) dropZone.scrollBy(0, 20);
    if (y < dropZone.clientHeight + 20) dropZone.scrollBy(0, -20);
  }

  expressionContainerBorder(m) {
    const border =
      m === "ok"
        ? "2px solid #2cb912"
        : m === "error"
        ? "2px solid #b50c0c"
        : "2px solid #ccc";
    this.expressionContainer.style.border = border;
  }

  getWizardExpression() {
    return this.expressionBuildedHidden.value.trim();
  }

  getWizardExpressionToParse() {
    return this.expressionBuildedHiddenToParse.value.trim();
  }

  evalWizardExpression() {
    if (!this.validateForm) return;
    const code =
      this.block.type !== "forBlock"
        ? this.getWizardExpressionToParse()
        : `for(${this.getWizardExpressionToParse()}){}`;
    if (code.startsWith("return") || code.startsWith("break")) {
      this.hasError = false;
      this.expressionContainerBorder("ok");
      return;
    }
    try {
      acorn.parse(code, { ecmaVersion: 5, preserveParens: true });
      this.hasError = !Utils.isEmpty(code) ? false : true;
      this.expressionContainerBorder(!Utils.isEmpty(code) ? "ok" : "error");
    } catch (error) {
      this.hasError = true;
      this.expressionContainerBorder("error");
    }
  }

  evalEqualStringExpression() {
    if (!this.validateForm) return;
    const elements = this.getDroppedElements();
    const len = elements.length;
    for (let i = 0; i < len; i++) {
      if (i > 0 && i < len - 1) {
        if (elements[i].name === "equal") {
          const l = elements[i - 1];
          const r = elements[i + 1];
          if (
            ((l.name === "variable" && l.extraProps.declaration == "String") ||
              l.name === "text") &&
            (r.name === "text" ||
              (r.name === "variable" && r.extraProps.declaration == "String"))
          ) {
            let hiddenExpression = this.getWizardExpression().replace(
              `${l.userValue} == ${r.userValue}`,
              `${l.userValue}.equals(${r.userValue})`
            );
            this.expressionBuildedHidden.value = hiddenExpression;
          }
        }
      }
    }
  }

  getDeclaredVariables() {
    let code = "";
    for (const element of this.getDroppedElements()) {
      if (element.name === "variable") {
        code += `var ${element.userValue} = ${this.getValueByDeclaration(
          element.extraProps.declaration
        )};\n`;
      }
    }
    return code;
  }

  getValueByDeclaration(kind) {
    switch (kind) {
      case "String":
      case "char":
        return '"browxy"';
      case "boolean":
        return true;
      default:
        return 1;
    }
  }

  getDroppedElements() {
    const children = Array.from(this.currentDropZone.children);
    return children.map((child) => JSON.parse(child.getAttribute("data-we")));
  }

  getDroppedForItems(index) {
    const dropZoneChildren = Array.from(this.dropZone.children).filter(
      (el) => el.tagName.toLowerCase() !== "h2"
    );
    const children = Array.from(dropZoneChildren[index].children);
    return children.map((child) => JSON.parse(child.getAttribute("data-we")));
  }

  moveSmooth(initialValue, action) {
    const children = [...this.currentDropZone.children];
    for (let i = initialValue; i < children.length; i++) {
      this.currentDropZone.children[i].classList[action]("move-smooth");
    }
  }

  addListenersToDroppedItemsOnLoad() {
    switch (this.block.type) {
      case "forBlock":
      case "defineBlock":
      case "inputBlock":
        const dropZoneChildren = Array.from(this.dropZone.children);
        dropZoneChildren.forEach((dropZoneChild, index) => {
          const children = Array.from(dropZoneChild.children);
          this.addDroppedElementListeners(children);
        });
        break;
      default:
        const children = Array.from(this.currentDropZone.children);
        this.addDroppedElementListeners(children);
    }
    this.expressionContainerBorder("default");
  }

  displayExpressionError(selector, txt) {
    const builderExpressionError = document.querySelector(`#${selector}`);
    builderExpressionError.innerText = txt;
    builderExpressionError.classList.remove("hide");
    setTimeout(() => {
      builderExpressionError.classList.add("hide");
    }, 2500);
  }

  addDroppedElementListeners(children) {
    children.forEach((el) => {
      const data = JSON.parse(el.getAttribute("data-we"));
      el.addEventListener("dragstart", this.handleDragStart.bind(this));
      el.addEventListener("dragend", this.handleDragEnd.bind(this));
      el.addEventListener("touchstart", this.handleTouchStart.bind(this));
      el.addEventListener("touchmove", this.handleTouchMove.bind(this));
      el.addEventListener("touchend", this.handleTouchEnd.bind(this));
      if (data.type === "input" || data.name === "wildcard") {
        el.lastElementChild.addEventListener(
          "click",
          this.handleEdition.bind(this)
        );
      }
    });
  }

  handleInputRadioBtn(ev) {
    const value = ev.target.value;
    if (value === "selectVar") {
      this.changeInputZoneContent("add");
    } else {
      this.changeInputZoneContent("remove");
    }
    this.buildWizardExpression();
  }

  changeInputZoneContent(action) {
    const defineZone = document.querySelector("#defineVar");
    const assignZone = document.querySelector("#assignVar");
    const valueZone = document.querySelector("#valueVar");
    defineZone.dataset.content =
      action === "add" ? "select drop zone" : "define drop zone";
    assignZone.dataset.content =
      action === "add" ? "disabled" : "assign drop zone";
    valueZone.dataset.content =
      action === "add" ? "disabled" : "value drop zone";
    assignZone.classList[action]("input-wizard");
    valueZone.classList[action]("input-wizard");
    defineZone.innerHTML = "";
    assignZone.innerHTML = "";
    valueZone.innerHTML = "";
  }

  isInputSelectVar() {
    if (this.block.type !== "inputBlock") return false;
    const value = document.querySelector(
      'input[name="optionTypeWizard"]:checked'
    ).value;
    return value === "selectVar";
  }

  removeDndListeners() {
    this.dragSourceItem.removeEventListener(
      "dragstart",
      this.handleDragStart.bind(this)
    );
    this.dragSourceItem.removeEventListener(
      "dragend",
      this.handleDragEnd.bind(this)
    );
    this.dragSourceItem.removeEventListener(
      "dragenter",
      this.handleDragEnter.bind(this)
    );
    this.dragSourceItem.removeEventListener(
      "dragover",
      this.handleDragOver.bind(this)
    );
    this.dragSourceItem.removeEventListener(
      "dragleave",
      this.handleDragLeave.bind(this)
    );
    this.dragSourceItem.removeEventListener("drop", this.handleDrop.bind(this));
    if (this.block.type === "inputBlock") {
      this.radioInputs.forEach((radio) =>
        radio.removeEventListener("change", this.handleInputRadioBtn.bind(this))
      );
    }
    this.dragSourceItem.remove();
  }

  removeTouchListeners(target) {
    target.removeEventListener("touchstart", this.handleTouchStart.bind(this));
    target.removeEventListener("touchmove", this.handleTouchMove.bind(this));
    target.removeEventListener("touchend", this.handleTouchEnd.bind(this));
  }
}
