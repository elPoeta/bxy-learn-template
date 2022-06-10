class EventHandler {
  constructor(canvas) {
    this.c = canvas;
    this.setupValues();
    this.ioBlocks = [
      "codeBlock",
      "defineBlock",
      "inputBlock",
      "outputBlock",
      "wrapBlock",
    ];
    this.loopBlocks = ["whileBlock", "forBlock"];
    this.blockStatement = ["whileBlock", "forBlock", "doWhileBlock", "ifBlock"];
    this.allOuts = [
      "out",
      "inner-out-yes",
      "bottom-inner-out-yes",
      "bottom-inner-out-no",
      "inner-out-no",
    ];
    this.outs = [
      "inner-out-yes",
      "bottom-inner-out-yes",
      "bottom-inner-out-no",
      "inner-out-no",
    ];
    this.bottomInnerOuts = ["bottom-inner-out-yes", "bottom-inner-out-no"];
    this.dragConsoleBar = document.querySelectorAll(".drag-console-bar");
    this.c.canvas.addEventListener(
      "mousemove",
      this.handlerMouseMove.bind(this)
    );
    this.c.canvas.addEventListener(
      "mousedown",
      this.handlerMouseDown.bind(this)
    );
    this.c.canvas.addEventListener("mouseup", this.handlerMouseUp.bind(this));
    this.c.canvas.addEventListener("click", this.handlerMouseClick.bind(this));
    this.c.canvas.addEventListener(
      "contextmenu",
      this.showContextMenu.bind(this)
    );
    this.c.canvas.addEventListener("wheel", this.handleWheel.bind(this));
    this.c.canvas.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      false
    );
    this.c.canvas.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      false
    );
    this.c.canvas.addEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
      false
    );
    this.dragConsoleBar.forEach((element) => {
      element.addEventListener("mousemove", this.handlerConsoleMove.bind(this));
      element.addEventListener("mousedown", this.handlerConsoleDown.bind(this));
      element.addEventListener("mouseup", this.handlerConsoleUp.bind(this));
      element.addEventListener(
        "mouseleave",
        this.handlerConsoleLeave.bind(this)
      );
      element.addEventListener(
        "touchstart",
        this.handleConsoleTouchStart.bind(this),
        false
      );
      element.addEventListener(
        "touchmove",
        this.handleConsoleTouchMove.bind(this),
        false
      );
      element.addEventListener(
        "touchend",
        this.handleConsoleTouchEnd.bind(this),
        false
      );
    });
    window.addEventListener("keydown", this.handlerKeyDown.bind(this));
    window.addEventListener("keyup", this.handlerKeyUp.bind(this));
  }

  setupValues() {
    this.flowErrorManager = new FlowErrorManager(this.c, "browxy");
    this.lastTouch = null;
    this.startTouch = 0;
    this.lastTap = 0;
    this.isPinch = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.startX = 0;
    this.startY = 0;
    this.ctrlKeyPressed = false;
    this.paletteGrabbed = false;
    this.timeStamp = 160;
    this.timeStampStop = 150;
    this.timeDifference = this.timeStamp;
    this.mousedownTime = 0;
    this.widthLine = 60;
    this.widthLoopLine = 30;
    this.doWhileDefaultAccum = 80;
    this.innerPlusHeight = 130;
    this.incrementOutLine = 60;
    this.incrementHeightRightLine = 60;
    this.incrementHeightLeftLine = 60;
    this.incrementLeftRing = 0;
    this.incrementRightRing = 0;
    this.programEdited = null;
    this.blockBeforeDrop = null;
    this.outsideFlowBlock = null;
    this.removeScopeVar = null;
    this.cloneBlocks = [];
    this.innerBlocks = [];
    this.addToHeight = {
      codeBlock: 70,
      defineBlock: 70,
      inputBlock: 70,
      outputBlock: 70,
      whileBlock: 70,
      forBlock: 70,
      ifBlock: 70,
      doWhileBlock: 70,
      wrapBlock: 70,
    };
    this.lastHookIndex = -1;
    this.trashLid = document.querySelector(".lid");
    this.trashLidCap = document.querySelector(".lidcap");
    this.trashBin = document.querySelector(".bin");
    this.isGrabbingBlock = false;
  }

  handlerConsoleDown(ev) {
    this.c.grabSplit = true;
    this.c.workspaceGrabed = false;
    ev.target.style.cursor = "grabbing";
    if (ev.target.getAttribute("data-dragg") === "vertical") {
      this.createVerticalGhost();
    } else if (ev.target.getAttribute("data-dragg") === "horizontal") {
      this.createHorizontalGhost();
    }
  }

  handlerConsoleMove(ev) {
    ev.target.style.cursor =
      ev.target.getAttribute("data-dragg") === "vertical"
        ? "ew-resize"
        : "ns-resize";
    this.c.updateCanvas();
  }

  handlerConsoleUp(ev) {
    this.c.grabSplit = false;
    document.querySelector("body").style.cursor = "auto";
    document.querySelector(".cursor-auto").style.cursor = "auto";
    ev.target.style.cursor = "auto";
  }

  handlerConsoleLeave(ev) {
    document.querySelector(".cursor-auto").style.cursor = "auto";
    ev.target.style.cursor = "auto";
  }

  createVerticalGhost() {
    const div = document.createElement("div");
    div.setAttribute("class", "ghostCanvasVerticalBar");
    div.setAttribute("id", "ghostCanvasV");
    div.style.right = document.querySelector("#console-box").offsetWidth + "px";
    div.style.cursor = "grabbing";
    const actualHeight = +document.querySelector(`#${this.c.IDCanvasContainer}`)
      .offsetHeight;
    div.style.height = `${actualHeight - 45}px`;
    document
      .querySelector(`#${this.c.IDCanvasContainer}`)
      .insertBefore(
        div,
        document.querySelector(`#${this.c.IDCanvasContainer}`).childNodes[0]
      );
    this.c.grabGhostV = true;
  }

  createHorizontalGhost() {
    const div = document.createElement("div");
    div.setAttribute("class", "ghostCanvasHorizontalBar");
    div.setAttribute("id", "ghostCanvasH");
    div.style.top = `${
      +document.querySelector("#console-box").offsetTop + 25
    }px`;
    div.style.width = document.querySelector("#console-box").offsetWidth + "px";
    div.style.right = 0;
    div.style.cursor = "grabbing";
    document
      .querySelector(`#${this.c.IDCanvasContainer}`)
      .insertBefore(
        div,
        document.querySelector(`#${this.c.IDCanvasContainer}`).childNodes[0]
      );
    this.c.grabGhostH = true;
  }

  handleTouchStart(ev) {
    ev.preventDefault();
    this.checkContextMenu();
    const touch = ev.touches[0];
    this.lastTouch = touch;
    this.startTouch = ev.timeStamp;
    if (ev.touches.length > 1) {
      this.isPinch = true;
      this.fingerDistance = this.getFingerDistance(ev);
    } else {
      this.isPinch = false;
      Utils.dispatchMouseEvent({
        touch,
        type: "mousedown",
        element: this.c.canvas,
      });
    }
  }

  handleTouchMove(ev) {
    ev.preventDefault();
    const touch = ev.touches[0];
    this.lastTouch = touch;
    if (ev.touches.length > 1) {
      this.dispatchZoom({ ev, touch });
    } else {
      Utils.dispatchMouseEvent({
        touch,
        type: "mousemove",
        element: this.c.canvas,
      });
    }
  }

  handleTouchEnd(ev) {
    ev.preventDefault();
    const currentTime = new Date().getTime();
    const tapLength = currentTime - this.lastTap;
    const diffTime = ev.timeStamp - this.startTouch;
    if (diffTime <= 500 && tapLength <= 500 && tapLength > 0) {
      this.openContextMenuOnTouchEnd();
    } else {
      if (this.isPinch) {
        this.updateMouseUp();
      } else {
        Utils.dispatchMouseEvent({
          touch: this.lastTouch,
          type: "mouseup",
          element: this.c.canvas,
        });
      }
    }
    this.lastTap = currentTime;
  }

  handleConsoleTouchStart(ev) {
    const touch = ev.touches[0];
    this.lastTouch = touch;
    this.handlerConsoleDown(ev);
    Utils.dispatchMouseEvent({
      touch,
      type: "mousedown",
      element: window.document,
    });
  }

  handleConsoleTouchMove(ev) {
    const touch = ev.touches[0];
    this.lastTouch = touch;
    this.handlerConsoleMove(ev);
    Utils.dispatchMouseEvent({
      touch,
      type: "mousemove",
      element: window.document,
    });
  }

  handleConsoleTouchEnd(ev) {
    if (!this.lastTouch) return;
    this.handlerConsoleUp(ev);
    Utils.dispatchMouseEvent({
      touch: this.lastTouch,
      type: "mouseup",
      element: window.document,
    });
  }

  dispatchZoom({ ev, touch }) {
    if (this.c.selectBlock) return;
    this.unSelectBlocks();
    const x = touch.clientX;
    const y = touch.clientY;
    const currentFingerDistance = this.getFingerDistance(ev);
    const direction = currentFingerDistance > this.fingerDistance ? 1 : -1;
    this.zoom({ x, y, direction });
    this.fingerDistance = currentFingerDistance;
  }

  checkContextMenu() {
    if (document.querySelector("#containerMenuContext")) {
      document.querySelector("#containerMenuContext").remove();
    }
  }

  openContextMenuOnTouchEnd() {
    if (!document.querySelector("#containerMenuContext")) {
      setTimeout(() => {
        Utils.dispatchMouseEvent({
          touch: this.lastTouch,
          type: "contextmenu",
          element: this.c.canvas,
        });
      }, 300);
    } else {
      this.checkContextMenu();
    }
  }

  getFingerDistance(ev) {
    const diffX = ev.touches[0].clientX - ev.touches[1].clientX;
    const diffY = ev.touches[0].clientY - ev.touches[1].clientY;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  }

  handlerMouseClick(ev) {
    if (this.c.activeTour) return;
    this.c.ungrabedBlocks();
    this.unSelectBlocks();
  }

  handlerMouseDown(ev) {
    if (this.c.activeTour) return;
    setTimeout(() => {
      if (this.isEditing) return;
      this.cloneBlocks = [];
      this.c.canvas.style.cursor = "grab";
      this.mousedownTime = ev.timeStamp;
      this.mouseX = ev.clientX - this.c.ctx.canvas.offsetLeft - this.c.xOffset;
      this.mouseY =
        ev.clientY - this.c.ctx.canvas.offsetTop - this.c.yOffset + 6 + 30;
      this.selectBlock(ev);
      this.selectWorkspace(ev);
      this.rightClick = false;
      this.updateMouseDown();
    }, 0);
  }

  handlerMouseMove(ev) {
    if (this.c.activeTour) return;
    if (this.timeDifference < this.timeStampStop || this.isEditing) {
      this.c.workspaceGrabed = false;
      return;
    }
    if (this.drag) {
      const { x, y } = this.screenToWorld(ev.clientX, ev.clientY);
      this.c.selectBlock.move(x, y);
      this.c.updateCanvas();
    } else {
      this.mouseX = ev.clientX - this.c.ctx.canvas.offsetLeft - this.c.xOffset;
      this.mouseY =
        ev.clientY - this.c.ctx.canvas.offsetTop - this.c.yOffset + 6 + 30;
      this.setCursorPallete(ev);
      this.moveBlock(ev);
      this.updateWorkspaceMove(ev);
    }
  }

  handlerMouseUp(ev) {
    if (this.c.activeTour) return;
    this.drag = false;
    this.c.workspaceGrabed = false;
    this.paletteGrabed = false;
    this.c.canvas.style.cursor = "auto";
    const mouseupTime = ev.timeStamp;
    this.timeDifference = mouseupTime - this.mousedownTime;
    if (this.timeDifference < this.timeStampStop) {
      const length = this.c.program.length - 1;
      if (length > 1) {
        if (this.mouseX < 200 && this.c.program[length].grabed) {
          this.c.program[length].remove();
        }
      }
      return;
    }
    this.mouseX = ev.clientX - this.c.ctx.canvas.offsetLeft - this.c.xOffset;
    this.mouseY =
      ev.clientY - this.c.ctx.canvas.offsetTop - this.c.yOffset + 6 + 30;
    this.dropBlock();
    this.updateMouseUp();
  }

  handlerKeyDown(ev) {
    this.removeBlock(ev);
    this.runCommand(ev);
  }

  handlerKeyUp(ev) {
    this.ctrlKeyPressed = false;
  }

  closeTrash() {
    this.trashLid.style =
      "transform: rotate(0deg); margin-bottom: 0px; background: #ff2323bf;";
    this.trashLidCap.style =
      "transform: rotate(0deg); margin-bottom: 0px; background: #ff2323bf;";
    this.trashBin.style = " border-top: 26px solid #ff2323bf;";
    this.trashBin.classList.remove("binLinesRed");
    flowChartEditor.canvasToolContainer.style.background = "#3da0d9";
  }

  openTrash() {
    this.trashLid.style =
      "transform: rotate(-25deg); margin-bottom: 7.5px; background: #fff;";
    this.trashLidCap.style =
      "transform: rotate(-25deg); margin-bottom: 7.5px; background: #fff;";
    this.trashBin.style = "border-top: 26px solid #fff;";
    this.trashBin.classList.add("binLinesRed");
    flowChartEditor.canvasToolContainer.style.background = "#ee494d";
  }

  handleWheel(ev) {
    if (this.c.selectBlock || this.c.activeTour) return;
    this.unSelectBlocks();
    const { x, y } = ev;
    const direction = ev.wheelDelta
      ? ev.wheelDelta > 0
        ? 1
        : -1
      : ev.deltaY < 0
      ? 1
      : -1;
    if (ev.clientX > 200) {
      this.zoom({ x, y, direction });
    } else {
      this.scrollPalleteWheel({ direction });
    }
  }

  zoom({ x, y, direction }) {
    let zoom = 1 * direction * this.c.scaleFactor;
    if (this.c.scale < this.c.scaleFactor) zoom = this.c.scaleFactor;
    const wx =
      (x - this.c.ctx.canvas.offsetLeft - this.c.xOffset - this.c.xScroll) /
      (this.c.canvas.width * this.c.scale);
    const wy =
      (y -
        this.c.ctx.canvas.offsetTop -
        this.c.yOffset -
        this.c.yScroll +
        6 +
        30) /
      (this.c.canvas.height * this.c.scale);
    this.c.xScroll -= wx * this.c.canvas.width * zoom;
    this.c.yScroll -= wy * this.c.canvas.height * zoom;
    this.c.scale += zoom;
    this.c.updateCanvas();
  }

  scrollPalleteWheel({ direction }) {
    const dy = direction * 10;
    const paletteH = this.c.palette[this.c.palette.length - 1].h;
    const paletteY = this.c.palette[this.c.palette.length - 1].y + paletteH;
    const diffH =
      paletteY -
      (this.c.canvas.height -
        document.querySelector("#canvasToolContainer").getBoundingClientRect()
          .height) +
      paletteH;
    this.c.yScrollPalette +=
      this.c.yScrollPalette + dy > 0 || this.c.yScrollPalette + dy < -diffH
        ? 0
        : dy;
    this.c.updateCanvas();
  }

  screenToWorld(x, y) {
    x =
      (x - this.c.ctx.canvas.offsetLeft - this.c.xOffset - this.c.xScroll) /
      this.c.scale;
    y =
      (y -
        this.c.ctx.canvas.offsetTop -
        this.c.yOffset -
        this.c.yScroll +
        6 +
        30) /
      this.c.scale;
    return { x, y };
  }

  worldToScreen(x, y) {
    x = parseInt(
      x * this.c.scale +
        this.c.xScroll +
        this.c.xOffset +
        this.c.ctx.canvas.offsetLeft
    );
    y = parseInt(
      y * this.c.scale +
        this.c.yScroll +
        this.c.yOffset +
        this.c.ctx.canvas.offsetTop -
        6 -
        30
    );
    return { x, y };
  }

  unSelectBlocks() {
    this.resetValues();
    this.c.program = this.c.program.map((program) => {
      program.selected = false;
      program.grabed = false;
      return program;
    });
  }

  selectBlock(ev) {
    const { x, y } = this.screenToWorld(ev.clientX, ev.clientY);
    this.c.program = this.selectBlockEdited({ x, y });
    if (this.c.expanded) {
      this.c.program = this.isTouchingCogwheelOrBreakPoint({ ev, x, y });
      return;
    }
    this.c.program = this.filterSelectedAndGrabbedBlocks({ x, y });
    this.c.program = this.isTouchingCogwheelOrBreakPoint({ ev, x, y });
    this.selectBlockFromPallete({ ev, x, y });
  }

  selectBlockEdited({ x, y }) {
    return this.c.program.map((program) => {
      if (this.c.grabSplit || program.isLocked || this.c.selectBlock)
        return program;
      if (program.editing) {
        if (program.isTouching(x, y)) {
          program.code = document.getElementById("text").value;
          document.getElementById("text-box").style.display = "none";
          document.getElementById("text").value = "";
          program.editing = false;
          this.programEdited = program;
        }
      }
      program.selected = false;
      return program;
    });
  }

  filterSelectedAndGrabbedBlocks({ x, y }) {
    return this.c.program.map((program, index) => {
      if (["start-id", "end-id"].includes(program.id)) return program;
      if (this.c.grabSplit || program.isLocked || this.c.selectBlock)
        return program;
      if (!this.isGrabbingBlock && program.isTouching(x, y)) {
        if (this.mouseX > 200) {
          program.selected = true;
          program.grabed = true;
          this.isGrabbingBlock = true;
          if (!this.blockBeforeDrop) {
            this.cloneBlocks = [];
            this.cloneBlocks.push({ ...program, isClone: true, index });
            this.traverseInnerBlocksClone(program.id);
            this.blockBeforeDrop = { ...program, isClone: true };
          }
        }
      }
      return program;
    });
  }

  selectBlockFromPallete({ ev, x, y }) {
    const yPalette =
      ev.clientY -
      this.c.ctx.canvas.offsetTop -
      this.c.yOffset -
      this.c.yScrollPalette +
      6 +
      30;
    this.c.palette.forEach((block) => {
      if (this.c.selectBlock) return;
      if (!this.paletteGrabbed) {
        if (block.isTouching(this.mouseX, yPalette)) {
          this.paletteGrabbed = true;
          const type = block.type;
          const w = block.w;
          const h = block.h;
          if (this.c.tabs[this.c.selectedTab].id !== "1") {
            this.c.createNewProgram(
              type,
              x - this.c.xScroll,
              y - this.c.yScroll,
              w,
              h,
              "",
              "function_calling"
            );
            const index = this.c.program.length - 1;
            this.c.program[index].grabed = true;
            this.c.program[index].selected = true;
          } else {
            if (type === "wrapBlock") {
              this.c.createNewProgram(
                type,
                x - this.c.xScroll,
                y - this.c.yScroll,
                w,
                h,
                "",
                "function_declaration"
              );
              const index = this.c.program.length - 1;
              this.c.program[index].grabed = true;
              this.c.program[index].selected = true;
            }
          }
        }
      }
    });
  }

  isTouchingCogwheelOrBreakPoint({ ev, x, y }) {
    return this.c.program.map((program, index) => {
      if (this.c.grabSplit || program.isLocked || this.c.selectBlock)
        return program;
      if (program.breakpoint) {
        if (program.breakpoint.isTouching(x, y)) {
          program.removeBreakpoint();
        }
      }
      if (program.cogwheel) {
        if (program.cogwheel.isTouching(x, y)) {
          this.isEditing = true;
          const selectContextMenu = new SelectContextMenu(this.c, "edition");
          selectContextMenu.filterMenu("selection", index).show(ev, { x, y });
          this.c.ungrabedUi();
        }
      }
      return program;
    });
  }

  traverseInnerBlocksClone(edgeId, from = 1) {
    const nodeEdges = this.c.graph.getNodeEdges(edgeId);
    for (let i = from; i < (nodeEdges && nodeEdges.length); i++) {
      if (nodeEdges[i]) {
        if (nodeEdges[i] === "empty") continue;
        const index = this.c.program.findIndex(
          (block) => block.id === nodeEdges[i]
        );
        if (index <= -1) continue;
        const block = this.c.program[index];
        this.cloneBlocks.push({ ...block, isClone: true, index });
        this.traverseInnerBlocksClone(block.id, 0);
      }
    }
    return;
  }

  selectWorkspace(ev) {
    if (this.c.grabSplit || this.c.selectBlock) return;
    const { x, y } = this.screenToWorld(ev.clientX, ev.clientY);
    this.c.workspaceGrabed = true;
    this.paletteGrabed = false;
    ev.preventDefault();
    ev.stopPropagation();
    this.startX = parseInt(
      ev.clientX - this.c.ctx.canvas.offsetLeft - this.c.xOffset
    );
    this.startY = parseInt(
      ev.clientY - this.c.ctx.canvas.offsetTop - this.c.yOffset + 6 + 30
    );
    if (this.c.expanded) return;
    this.c.program = this.c.program.map((program) => {
      if (
        program.isTouching(x, y) ||
        this.mouseX < 200 ||
        this.ctrlKeyPressed
      ) {
        if (this.mouseX < 200) {
          this.c.palette.forEach((block) => {
            if (block.isTouching(this.mouseX, this.mouseY)) {
              this.paletteGrabed = false;
            } else {
              if (!this.paletteGrabbed) this.paletteGrabed = true;
            }
          });
        }
        this.c.workspaceGrabed = false;
      }
      return program;
    });
  }

  setCursorPallete(ev) {
    const yPalette =
      ev.clientY -
      this.c.ctx.canvas.offsetTop -
      this.c.yOffset -
      this.c.yScrollPalette +
      6 +
      40;
    this.c.palette.forEach((block) => {
      if (this.c.selectBlock) return;
      if (!this.paletteGrabbed && ev.clientX <= 200) {
        if (block.isTouching(this.mouseX, yPalette)) {
          this.c.canvas.style.cursor = "pointer";
        } else {
          if (
            (ev.clientX > 160 && ev.clientX <= 200) ||
            (ev.clientX > 0 && ev.clientX <= 40)
          ) {
            this.c.canvas.style.cursor = "row-resize";
          }
        }
      } else {
        this.c.canvas.style.cursor = "auto";
      }
    });
  }

  getBlockScalePosition(type, index) {
    let mouseX;
    let mouseY;
    const zoomX = this.c.zoomFlowchart.getZoomX();
    if (type === "ifBlock") {
      mouseX =
        zoomX === 0
          ? this.mouseX
          : this.c.program[index].x - this.c.program[index].w / 2;
      mouseY =
        zoomX === 0
          ? this.mouseY
          : this.c.program[index].y + this.c.program[index].h;
    } else {
      mouseX =
        zoomX === 0
          ? this.mouseX
          : this.c.program[index].x + this.c.program[index].w / 2;
      mouseY =
        zoomX === 0
          ? this.mouseY
          : this.c.program[index].y + this.c.program[index].h / 2;
    }
    return { mouseX, mouseY };
  }

  updateMouseDown() {
    this.c.updateCanvas();
  }

  updateMouseUp() {
    this.c.grabSplit = false;
    this.c.workspaceGrabed = false;
    this.paletteGrabbed = false;
    this.c.ungrabedBlocks();
    this.c.updateCanvas();
  }

  updateWorkspaceMove(ev) {
    if (this.c.workspaceGrabed) {
      ev.preventDefault();
      ev.stopPropagation();
      const mouseX = parseInt(
        ev.clientX - this.c.ctx.canvas.offsetLeft - this.c.xOffset
      );
      const mouseY = parseInt(
        ev.clientY - this.c.ctx.canvas.offsetTop - this.c.yOffset + 6 + 30
      );
      const dx = mouseX - this.startX;
      const dy = mouseY - this.startY;
      this.startX = mouseX;
      this.startY = mouseY;
      this.c.xScroll += dx;
      this.c.yScroll += dy;
      this.c.updateCanvas();
    } else if (this.paletteGrabed) {
      ev.preventDefault();
      ev.stopPropagation();
      const mouseY = parseInt(
        ev.clientY - this.c.ctx.canvas.offsetTop - this.c.yOffset + 6 + 30
      );
      const dy = mouseY - this.startY;
      this.startY = mouseY;
      const paletteH = this.c.palette[this.c.palette.length - 1].h;
      const paletteY = this.c.palette[this.c.palette.length - 1].y + paletteH;
      const diffH =
        paletteY -
        (this.c.canvas.height -
          document.querySelector("#canvasToolContainer").getBoundingClientRect()
            .height) +
        paletteH;
      this.c.yScrollPalette +=
        this.c.yScrollPalette + dy > 0 || this.c.yScrollPalette + dy < -diffH
          ? 0
          : dy;
      this.c.updateCanvas();
    }
  }

  moveBlock(ev) {
    this.showCodeToolTip(ev);
    if (this.c.expanded) return;
    this.blockColliding(ev);
    this.c.updateCanvas();
  }

  showCodeToolTip(ev) {
    const { x, y } = this.screenToWorld(ev.clientX, ev.clientY);
    let hit = false;
    this.c.program.forEach((program) => {
      let ht = 0;
      let yh = 30;
      const lineHeight = this.c.ctxTip.measureText("M").width * 1.2;
      if (program.isTouching(x, y)) {
        if (
          !program.grabed &&
          (!Utils.isEmpty(program.code) || program.compileError.hasError)
        ) {
          const codeTip = this.getCodeTip(program);
          let lines = codeTip.split("\n");
          lines = lines.filter((line) => line !== "");
          let txtMeasure = this.c.ctxTip.measureText(lines[0]).width + 20;
          lines.forEach((line, index) => {
            const txtW = this.c.ctxTip.measureText(line).width + 20;
            if (txtW > txtMeasure) {
              txtMeasure = txtW;
            }
          });
          const fix =
            this.c.ctxTip.measureText("H").actualBoundingBoxDescent / 2;
          for (let i = 0; i < lines.length; i++) {
            ht += lineHeight + fix;
          }
          this.c.tip.width = txtMeasure;
          this.c.tip.height = ht + 20;
          this.c.ctxTip.clearRect(0, 0, this.c.tip.width, this.c.tip.height);
          this.c.ctxTip.fillStyle = "#fff";
          this.c.ctxTip.font = "bold 22px Roboto";
          this.c.ctxTip.textAlign = "center";
          for (let i = 0; i < lines.length; i++) {
            const w = this.c.ctxTip.measureText(lines[i]).width + 20;
            this.c.ctxTip.fillText(lines[i], w / 2, yh + fix);
            yh += lineHeight;
          }
          hit = true;
          this.c.tip.style.top = "40px";
          this.c.tip.style.left = "200px";
        }
      }
      if (!hit) {
        this.c.tip.style.left = "-2000px";
      }
    });
  }

  getCodeTip(program) {
    if (
      program.type === "startBlock" &&
      this.c.tabs[this.c.selectedTab].id != "0" &&
      this.c.tabs[this.c.selectedTab].id != "1"
    ) {
      const index = this.c.tabs[1].api.program["1"].blocks.findIndex(
        (block) => block.vars.tabId === this.c.tabs[this.c.selectedTab].id
      );
      if (index > -1) {
        const code = this.c.tabs[1].api.program["1"].blocks[index].code;
        const type = this.c.tabs[1].api.program["1"].blocks[index].type;
        return this.addStatementToCode(code, type);
      }
    }
    return !program.compileError.hasError
      ? this.addStatementToCode(program.code, program.type)
      : program.compileError.errorMessages.reduce(
          (accumalator, currentValue) => accumalator + `${currentValue}\n`,
          ""
        );
  }

  addStatementToCode(code, type) {
    switch (type) {
      case "ifBlock":
        return `if(${code})`;
      case "doWhileBlock":
        return `do(${code})`;
      case "whileBlock":
        return `while(${code})`;
      case "forBlock":
        return `for(${code})`;
      default:
        return code;
    }
  }

  blockColliding(ev) {
    const { x, y } = this.screenToWorld(ev.clientX, ev.clientY);
    this.innerBlocks = [];
    let hookIndex = -1;
    this.c.program = this.c.program.map((program, i) => {
      if (program.grabed) {
        this.c.canvas.style.cursor = "grabbing";
        this.c.tip.style.left = "-2000px";
        program.selected = true;
        program.move(x - program.grabPosition.x, y - program.grabPosition.y);
        this.traverseInnerBlocks(program.id);
        this.moveInnerBlocks(program);
        let ok = true;
        let okHook = false;
        this.c.program.forEach((programHook, j) => {
          if (j != i) {
            if (program.isColliding(programHook)) ok = false;
            programHook.hooks.forEach((hook) => {
              if (this.allOuts.includes(hook.ioType)) {
                let c = { x: program.hooks[0].x, y: program.hooks[0].y };
                let r = program.hooks[0].radius;
                if (
                  !programHook.isLocked &&
                  hook.isLineInterceptCircle(c, r) &&
                  programHook.hooks[0].occupied
                ) {
                  okHook = true;
                  hookIndex = j;
                  program.x = this.setXOnDrop(
                    program,
                    programHook,
                    hook.ioType
                  );
                  this.moveInnerBlocks(program);
                  this.c.interceptedProgram = {
                    programRing: program,
                    programHook,
                    arrowType: hook.ioType,
                  };
                }
              }
            });
          }
        });
        if (this.mouseX < 200) {
          this.c.paletteColor = this.c.colors.red;
          this.openTrash();
        } else {
          this.c.paletteColor = this.c.colors.ligthBlue;
          this.closeTrash();
        }
        if (ok) {
          program.error = false;
          program.lastGoodPosition = { x: program.x, y: program.y };
          this.setInterceptedInnerBlocksColorState({
            intercepted: "isIntercepted",
            isIntercepted: false,
            error: "error",
            isError: false,
            lastGoodPosition: "lastGoodPosition",
          });
        } else {
          this.c.canvas.style.cursor = "not-allowed";
          program.error = true;
          this.setInterceptedInnerBlocksColorState({
            intercepted: "isIntercepted",
            isIntercepted: false,
            error: "error",
            isError: true,
          });
        }
        if (okHook) {
          this.c.canvas.style.cursor = "grabbing";
          program.error = false;
          program.isIntercepted = true;
          this.c.program[hookIndex].isIntercepted = true;
          this.lastHookIndex = hookIndex;
          this.setInterceptedInnerBlocksColorState({
            intercepted: "isIntercepted",
            isIntercepted: true,
            error: "error",
            isError: false,
          });
        } else {
          program.isIntercepted = false;
          if (this.lastHookIndex > -1)
            this.c.program[this.lastHookIndex].isIntercepted = false;
          this.setInterceptedInnerBlocksColorState({
            intercepted: "isIntercepted",
            isIntercepted: false,
            error: null,
          });
          this.c.interceptedProgram = null;
          this.outsideFlowBlock = program;
        }
      } else {
        if (!this.innerBlocks.length) program.selected = false;
      }
      return program;
    });
  }

  traverseInnerBlocks(edgeId, from = 1) {
    const nodeEdges = this.c.graph.getNodeEdges(edgeId);
    for (let i = from; i < (nodeEdges && nodeEdges.length); i++) {
      if (nodeEdges[i]) {
        if (nodeEdges[i] === "empty") continue;
        const index = this.c.program.findIndex(
          (block) => block.id === nodeEdges[i]
        );
        if (index <= -1) continue;
        const block = this.c.program[index];
        this.innerBlocks.push(block);
        this.traverseInnerBlocks(block.id, 0);
      }
    }
    return;
  }

  moveInnerBlocks(program) {
    let accumYes = this.c.defaultAccumulator;
    let accumNo = this.c.defaultAccumulator;
    let parentBlock = program;
    let doWhileBlocks = [];
    let parentTemp = null;
    let lastBlock = null;
    this.innerBlocks.forEach((innerBlock) => {
      const idx = this.c.program.findIndex(
        (block) => block.id === innerBlock.id
      );
      if (idx < 0) return;
      const {
        id,
        parentId,
        type,
        blockProps: { branch },
        accumulativeHeight,
      } = this.c.program[idx];
      if (parentBlock.id !== parentId) {
        this.moveDoWhileBlocks(parentTemp, doWhileBlocks, accumYes);
        parentTemp = null;
        doWhileBlocks = [];
        lastBlock = null;
        accumYes = this.c.defaultAccumulator;
        accumNo = this.c.defaultAccumulator;
        const indexParent = this.c.program.findIndex(
          (block) => block.id === parentId
        );
        parentBlock = this.c.program[indexParent];
      }
      if (program.id !== id) {
        if (parentBlock.type === "doWhileBlock") {
          parentTemp = parentBlock;
          doWhileBlocks.unshift(idx);
        } else {
          const x = this.getParentXPosition(parentBlock, type, branch);
          if (branch === "NO") {
            accumNo +=
              lastBlock && lastBlock.type === "doWhileBlock"
                ? -lastBlock.accumulativeHeight
                : type === "doWhileBlock"
                ? accumulativeHeight
                : 0;
            this.c.program[idx].move(x, parentBlock.y + accumNo);
            accumNo += this.c.program[idx].blockProps.fullH;
          } else {
            accumYes +=
              lastBlock && lastBlock.type === "doWhileBlock"
                ? -lastBlock.accumulativeHeight
                : type === "doWhileBlock"
                ? accumulativeHeight
                : 0;
            this.c.program[idx].move(x, parentBlock.y + accumYes);
            accumYes += this.c.program[idx].blockProps.fullH;
          }
          this.c.program[idx].selected = true;
          this.c.program[idx].isLocked = true;
        }
        lastBlock = this.c.program[idx];
      }
    });
    if (parentTemp) {
      this.moveDoWhileBlocks(parentTemp, doWhileBlocks, accumYes);
    }
  }

  getParentXPosition(parentBlock, type, branch) {
    let x = parentBlock.x;
    if (type === "ifBlock") {
      if (parentBlock.type === "ifBlock") {
        if (branch === "NO") {
          x =
            parentBlock.x -
            parentBlock.w -
            this.widthLine +
            parentBlock.hooks[1].incrementWidthLeftLine;
        } else {
          x =
            parentBlock.x +
            parentBlock.w +
            this.widthLine +
            parentBlock.hooks[2].incrementWidthRightLine;
        }
      } else {
        x += this.widthLine;
      }
    } else if (parentBlock.type === "ifBlock") {
      if (branch === "NO") {
        x =
          parentBlock.x -
          parentBlock.w -
          this.widthLine * 2 +
          parentBlock.hooks[1].incrementWidthLeftLine;
      } else {
        x =
          parentBlock.x +
          this.widthLine +
          parentBlock.hooks[2].incrementWidthRightLine;
      }
    }
    return x;
  }

  moveDoWhileBlocks(parentTemp, doWhileBlocks, accum) {
    if (doWhileBlocks.length > 0) {
      doWhileBlocks.forEach((blockIndex) => {
        const {
          type,
          blockProps: { branch, fullH },
          accumulativeHeight,
        } = this.c.program[blockIndex];
        const fixAccum = this.getFixedInnerDoWhileYPosition(
          type,
          accumulativeHeight
        );
        const x = this.getParentXPosition(parentTemp, type, branch);
        this.c.program[blockIndex].move(x, parentTemp.y - accum - fixAccum);
        this.c.program[blockIndex].selected = true;
        this.c.program[blockIndex].isLocked = true;
        accum += fullH;
      });
    }
  }

  getFixedInnerDoWhileYPosition(type, accumulativeHeight) {
    return this.loopBlocks.includes(type)
      ? this.c.arrowDistance + accumulativeHeight
      : type === "ifBlock"
      ? this.c.arrowDistance * 2 + accumulativeHeight
      : 0;
  }

  setInterceptedInnerBlocksColorState({
    intercepted,
    isIntercepted,
    error,
    isError,
    lastGoodPosition,
  }) {
    this.innerBlocks.forEach((innerBlock) => {
      const idx = this.c.program.findIndex(
        (block) => block.id === innerBlock.id
      );
      this.c.program[idx][intercepted] = isIntercepted;
      this.c.program[idx][error] = error ? isError : false;
      this.c.program[idx][lastGoodPosition] = lastGoodPosition
        ? { x: innerBlock.x, y: innerBlock.y }
        : this.c.program[idx][lastGoodPosition];
    });
  }

  setXOnDrop(programRing, programHook, ioType) {
    const { hooks, x, w, type: prgHookType } = programHook;
    const { type } = programRing;
    let newBlockX = x;
    if (this.c.tabs[this.c.selectedTab].id != "1") {
      if (prgHookType === "ifBlock") {
        if (ioType === "out") {
          newBlockX -= type !== "ifBlock" ? this.widthLine : 0;
        } else if (ioType === "inner-out-yes") {
          newBlockX +=
            type !== "ifBlock"
              ? w + hooks[2].incrementWidthRightLine
              : w + hooks[2].incrementWidthRightLine + this.widthLine;
        } else if (ioType === "bottom-inner-out-yes") {
          newBlockX -= type !== "ifBlock" ? this.widthLine : 0;
        } else if (ioType === "inner-out-no") {
          newBlockX -=
            type !== "ifBlock"
              ? w - hooks[1].incrementWidthLeftLine + this.widthLine * 2
              : w - hooks[1].incrementWidthLeftLine + this.widthLine;
        } else if (ioType === "bottom-inner-out-no") {
          newBlockX -= type !== "ifBlock" ? this.widthLine : 0;
        }
      } else {
        if (type === "ifBlock") {
          newBlockX += this.widthLine;
        }
      }
    } else {
      newBlockX = x + w / 2 - programRing.w / 2;
    }
    return newBlockX;
  }

  async dropBlock() {
    this.c.pauseRenderX = true;
    let isDeleted = false;
    let undoDeleted = false;
    for (let i = 0; i < this.c.program.length; i++) {
      if (i < 0) break;
      if (this.c.program[i].error && this.c.program[i].grabed) {
        this.c.program[i].move(
          this.c.program[i].lastGoodPosition.x,
          this.c.program[i].lastGoodPosition.y
        );
        this.c.program[i].error = false;
      }
      let grabed = this.c.program[i].grabed;
      this.c.program[i].grabed = false;
      this.c.program[i].isIntercepted = false;
      if (this.mouseX < 200) {
        if (
          this.c.program[i].type !== "endBlock" &&
          this.c.program[i].type !== "startBlock"
        ) {
          if (grabed) {
            const { deletedBlock, lessI, undo } = await this.runDialogConfirm(
              this.blockBeforeDrop,
              i
            );
            isDeleted = deletedBlock;
            undoDeleted = undo;
            if (isDeleted) {
              i -= lessI;
            }
            this.c.paletteColor = this.c.colors.ligthBlue;
            this.closeTrash();
          }
        }
      }
    }
    if (isDeleted) {
      this.removeBlockPropsOutsideFlow();
      this.moveBlocksBeforeDraw();
      this.c.undoRedoManager.save(this.c.getApiUndoRedoManager());
      this.resetValues();
      this.c.loadTabByIndex(this.c.selectedTab);
      this.c.markFlowchartAsSavedUnsaved(true);
    } else {
      this.blockBeforeDrop = null;
      this.dropInterceptedProgram(undoDeleted);
    }
  }

  async removeBlock(ev) {
    let isDeleted = false;
    let undoDeleted = false;
    if (ev.code === "Delete") {
      for (let i = 0; i < this.c.program.length; i++) {
        if (this.c.program[i].selected) {
          this.traverseInnerBlocks(this.c.program[i].id);
          this.blockBeforeDrop = { ...this.c.program[i], isClone: true };
          if (!this.c.program[i].editing) {
            if (
              this.c.program[i].type !== "startBlock" &&
              this.c.program[i].type !== "endBlock"
            ) {
              const { deletedBlock, lessI, undo } = await this.runDialogConfirm(
                this.blockBeforeDrop,
                i
              );
              isDeleted = deletedBlock;
              undoDeleted = undo;
              if (isDeleted) {
                i -= lessI;
              }
              this.c.paletteColor = this.c.colors.ligthBlue;
              this.closeTrash();
            }
          }
        }
      }
    }
    if (isDeleted) {
      this.removeBlockPropsOutsideFlow();
      this.moveBlocksBeforeDraw();
      this.c.undoRedoManager.save(this.c.getApiUndoRedoManager());
      this.resetValues();
      this.c.loadTabByIndex(this.c.selectedTab);
      this.c.markFlowchartAsSavedUnsaved(true);
    } else {
      this.lastHookIndex = -1;
      this.blockBeforeDrop = null;
      this.dropInterceptedProgram(undoDeleted);
    }
  }

  dropInterceptedProgram(undoDeleted) {
    if (undoDeleted) {
      this.resetValues();
      this.c.updateCanvas();
      this.flowErrorManager.execute();
      return;
    }
    if (this.c.interceptedProgram) {
      const { programRing, programHook, arrowType } = this.c.interceptedProgram;
      const { isUsed, isRehook, variableName } = this.isUsedVaribleOnSwap({
        programRing,
        programHook,
        arrowType,
      });
      if (isUsed) {
        if (!isRehook) {
          Dialog.noticeDialog({
            title: "Error",
            text: `<span class="prj-name color-red">Swapped blocks contain same define variable in scope with name: <span style="color: #000; font-weight: bold; font-style: italic;">${variableName}</span></span>`,
            isExamSubmission: false,
          });
        }
        this.resetValues();
        this.c.updateCanvas();
        this.flowErrorManager.execute();
        return;
      }
      this.interceptArrowsTypes();
      this.updateStateOnSwap();
      this.resetValues();
      this.c.markFlowchartAsSavedUnsaved(true);
      this.c.undoRedoManager.save(this.c.getApiUndoRedoManager());
    } else {
      if (this.outsideFlowBlock) {
        const { type } = this.outsideFlowBlock;
        if (type !== "startBlock" && type !== "endBlock") {
          this.removeScopeFromFlow();
          this.removeBlockPropsOutsideFlow();
          this.updateStateOnSwap();
          this.c.undoRedoManager.save(this.c.getApiUndoRedoManager());
          this.c.loadTabByIndex(this.c.selectedTab);
          this.widthManagerOutsideBlocks();
        } else {
          this.c.updateCanvas();
          this.flowErrorManager.execute();
        }
        this.resetValues();
        this.c.markFlowchartAsSavedUnsaved(true);
      }
    }
  }

  resetValues() {
    this.c.interceptedProgram = null;
    this.outsideFlowBlock = null;
    this.blockBeforeDrop = null;
    this.timeDifference = this.timeStamp;
    this.paletteGrabbed = false;
    this.isGrabbingBlock = false;
    this.pauseRenderX = false;
  }

  addNodeEdgesToOut() {
    const { programRing, programHook } = this.c.interceptedProgram;
    const nodeEdges = [...this.c.graph.getNodeEdges(programHook.id)];
    const edge = nodeEdges[0];
    let tempEdge = null;
    let tempEdge2 = null;
    const length = nodeEdges.length;
    if (length > 1) {
      tempEdge = nodeEdges[1];
      this.c.graph.removeEdge(programHook.id, tempEdge);
      if (length > 2) {
        tempEdge2 = nodeEdges[2];
        this.c.graph.removeEdge(programHook.id, tempEdge2);
      }
    }
    this.c.graph.removeEdge(programHook.id, edge);
    this.c.graph.addNode(programRing.id);
    this.c.graph.addEdge(programHook.id, programRing.id);
    this.c.graph.addEdge(programRing.id, edge);
    if (tempEdge) this.c.graph.addEdge(programHook.id, tempEdge);
    if (tempEdge2) this.c.graph.addEdge(programHook.id, tempEdge2);
    this.c.blockState.update(programRing.id, { lastHook: programHook.id });
    this.c.blockState.update(edge, { lastHook: programRing.id });
  }

  addNodeEdgesIoBlocks() {
    const { programRing, programHook } = this.c.interceptedProgram;
    const nodeEdges = this.c.graph.getNodeEdges(programHook.id);
    const edge = nodeEdges[0];
    this.c.graph.addNode(programRing.id);
    this.c.graph.addEdge(programRing.id, edge);
    this.c.graph.removeEdge(programHook.id, edge);
    this.c.graph.addEdge(programHook.id, programRing.id);
    this.c.blockState.update(programRing.id, { lastHook: programHook.id });
    if (edge) this.c.blockState.update(edge, { lastHook: programRing.id });
  }

  addNodeEdgesToInnerLoops() {
    const { programHook } = this.c.interceptedProgram;
    const nodeEdges = this.c.graph.getNodeEdges(programHook.id);
    if (nodeEdges.length === 1) {
      this.addNewNodeAndEdge();
    } else {
      this.replaceAndAddNewEdge(programHook.id);
    }
  }

  addNodeEdgesToInnerIf() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const nodeEdges = [...this.c.graph.getNodeEdges(programHook.id)];
    const length = nodeEdges.length;
    if (length >= 1) {
      if (["inner-out-yes"].includes(arrowType)) {
        const edge = nodeEdges[0];
        this.c.graph.removeEdge(programHook.id, edge);
        let node1 =
          nodeEdges[1] && nodeEdges[1] !== "empty" ? nodeEdges[1] : null;
        let node2 = nodeEdges[2] ? nodeEdges[2] : "empty";
        if (nodeEdges[1]) {
          this.c.graph.removeEdge(programHook.id, node1);
        }
        if (nodeEdges[2]) {
          this.c.graph.removeEdge(programHook.id, nodeEdges[2]);
        }
        this.c.graph.addNode(programRing.id);
        this.c.graph.addEdge(programHook.id, edge);
        this.c.graph.addEdge(programHook.id, programRing.id);
        this.c.graph.addEdge(programHook.id, node2);
        if (node1 !== null) this.c.graph.addEdge(programRing.id, node1);
        let idx = this.c.program.findIndex(
          (block) => block.id === programRing.id
        );
        this.updateStateHook(idx, programHook.id, arrowType);
        idx = this.c.program.findIndex((block) => block.id === node1);
        this.updateStateHook(idx, programRing.id, "bottom-inner-out-yes");
      }
      if (["inner-out-no"].includes(arrowType)) {
        const edge = nodeEdges[0];
        this.c.graph.removeEdge(programHook.id, edge);
        let node1 = nodeEdges[1] ? nodeEdges[1] : "empty";
        let node2 =
          nodeEdges[2] && nodeEdges[2] !== "empty" ? nodeEdges[2] : null;
        if (nodeEdges[1]) {
          this.c.graph.removeEdge(programHook.id, node1);
        }
        if (nodeEdges[2]) {
          this.c.graph.removeEdge(programHook.id, nodeEdges[2]);
        }
        this.c.graph.addNode(programRing.id);
        this.c.graph.addEdge(programHook.id, edge);
        this.c.graph.addEdge(programHook.id, node1);
        this.c.graph.addEdge(programHook.id, programRing.id);
        if (node2 !== null) this.c.graph.addEdge(programRing.id, node2);
        let idx = this.c.program.findIndex(
          (block) => block.id === programRing.id
        );
        this.updateStateHook(idx, programHook.id, arrowType);
        idx = this.c.program.findIndex((block) => block.id === node2);
        this.updateStateHook(idx, programRing.id, "bottom-inner-out-no");
      }
    } else {
      this.c.graph.addNode(programRing.id);
      if (["inner-out-yes"].includes(arrowType)) {
        this.setInnerIfNodeEdge(null, programRing.id, "empty");
      } else if (["inner-out-no"].includes(arrowType)) {
        this.setInnerIfNodeEdge(null, "empty", programRing.id);
      } else if (["bottom-inner-out-yes"].includes(arrowType)) {
        this.setInnerIfNodeEdge(programRing.id, "empty", "empty");
      }
    }
  }

  setInnerIfNodeEdge(edge1, edge2, edge3) {
    const { programHook } = this.c.interceptedProgram;
    this.c.graph.addEdge(programHook.id, edge1);
    this.c.graph.addEdge(programHook.id, edge2);
    this.c.graph.addEdge(programHook.id, edge3);
  }

  addNewNodeAndEdge() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    this.c.graph.addNode(programRing.id);
    this.c.graph.addEdge(programHook.id, programRing.id);
    const idx = this.c.program.findIndex(
      (block) => block.id === programRing.id
    );
    this.updateStateHook(idx, programHook.id, arrowType);
  }

  replaceAndAddNewEdge(edgeId) {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const nodeEdges = [...this.c.graph.getNodeEdges(edgeId)];
    if (!nodeEdges || !nodeEdges.length) {
      if (arrowType === "inner-out-yes") {
        this.c.graph.addEdge(programHook.id, null);
        this.addNewNodeAndEdge();
      } else {
        this.addNewNodeAndEdge();
      }
    } else {
      const edge = nodeEdges[0];
      let tempEdge = null;
      let tempEdge2 = null;
      if (nodeEdges.length > 1) {
        tempEdge = nodeEdges[1];
        this.c.graph.removeEdge(programHook.id, tempEdge);
        if (nodeEdges[2]) {
          tempEdge2 = nodeEdges[2];
          this.c.graph.removeEdge(programHook.id, tempEdge2);
        }
      }
      this.c.graph.removeEdge(programHook.id, edge);
      this.c.graph.addNode(programRing.id);
      if (["inner-out-yes"].includes(arrowType)) {
        this.c.graph.addEdge(programHook.id, edge);
        this.c.graph.addEdge(programHook.id, programRing.id);
        this.c.graph.addEdge(programRing.id, tempEdge);
        let idx = this.c.program.findIndex(
          (block) => block.id === programRing.id
        );
        this.updateStateHook(idx, programHook.id, arrowType);
        idx = this.c.program.findIndex((block) => block.id === tempEdge);
        this.updateStateHook(idx, programRing.id, "bottom-inner-out-yes");
      } else if (["inner-out-no"].includes(arrowType)) {
      } else if (
        ["bottom-inner-out-yes", "bottom-inner-out-no"].includes(arrowType)
      ) {
        this.c.graph.addEdge(programHook.id, programRing.id);
        this.c.graph.addEdge(programRing.id, edge);
        let idx = this.c.program.findIndex(
          (block) => block.id === programRing.id
        );
        this.updateStateHook(idx, programHook.id, arrowType);
        idx = this.c.program.findIndex((block) => block.id === edge);
        this.updateStateHook(idx, programRing.id, arrowType);
        if (tempEdge) {
          this.c.graph.addEdge(programHook.id, tempEdge);
          const idx = this.c.program.findIndex(
            (block) => block.id === tempEdge
          );
          this.updateStateHook(idx, programHook.id, "inner-out-yes");
        }
        if (tempEdge2) {
          this.c.graph.addEdge(programHook.id, tempEdge2);
          const idx = this.c.program.findIndex(
            (block) => block.id === tempEdge2
          );
          this.updateStateHook(idx, programHook.id, "inner-out-no");
        }
      }
    }
  }

  updateStateHook(index, lastHook, arrowHook) {
    if (index < 0) return;
    this.c.blockState.update(this.c.program[index].id, {
      x: this.c.program[index].x,
      y: this.c.program[index].y,
      lastHook,
      arrowHook,
    });
  }

  interceptArrowsTypes() {
    const { arrowType } = this.c.interceptedProgram;
    const types = {
      out: this.interceptOutArrow.bind(this),
      "inner-out-yes": this.interceptInneOutYesArrowType.bind(this),
      "inner-out-no": this.inneOutNoType.bind(this),
      "bottom-inner-out-yes": this.bottomInneOutType.bind(this),
      "bottom-inner-out-no": this.bottomInneOutType.bind(this),
    };
    return types[arrowType]();
  }

  interceptInneOutYesArrowType() {
    const { programHook } = this.c.interceptedProgram;
    const blockType = programHook.type;
    const types = {
      forBlock: this.loopBlockTypeInnerYes.bind(this),
      whileBlock: this.loopBlockTypeInnerYes.bind(this),
      doWhileBlock: this.doWhileBlockTypeInnerYes.bind(this),
      ifBlock: this.ifBlockTypeInnerYes.bind(this),
    };
    return types[blockType]();
  }

  inneOutNoType() {
    const { programHook } = this.c.interceptedProgram;
    const blockType = programHook.type;
    const types = {
      ifBlock: this.ifBlockTypeInnerNo.bind(this),
    };
    return types[blockType]();
  }

  bottomInneOutType() {
    const { programHook } = this.c.interceptedProgram;
    const blockType = programHook.type;
    const types = {
      defineBlock: this.ioBlockTypeBottomInner.bind(this),
      codeBlock: this.ioBlockTypeBottomInner.bind(this),
      inputBlock: this.ioBlockTypeBottomInner.bind(this),
      outputBlock: this.ioBlockTypeBottomInner.bind(this),
      wrapBlock: this.ioBlockTypeBottomInner.bind(this),
      forBlock: this.loopBlockTypeBottomInner.bind(this),
      whileBlock: this.loopBlockTypeBottomInner.bind(this),
      doWhileBlock: this.doWhileBlockTypeBottomInner.bind(this),
      ifBlock: this.ifBlockTypeBottomInner.bind(this),
    };
    return types[blockType]();
  }

  interceptOutArrow() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const { length, firstNode, secondNode } = this.swapBlocks({
      programRing,
      programHook,
      arrowType,
    });
    this.addNodeEdgesToOut();
    const type = programRing.type;
    const heightToAdd =
      type !== "doWhileBlock"
        ? this.addToHeight[type]
        : this.addToHeight[type] + programRing.accumulativeHeight;
    const indexRing = this.c.program.findIndex(
      (block) => block.id === programRing.id
    );
    const indexArrowHookRing = programRing.outHookIndex.out;
    const indexArrowHook = programHook.outHookIndex.out;
    const y = programHook.hooks[indexArrowHook].y + heightToAdd;
    this.c.program[indexRing].hooks[indexArrowHookRing].ioType = arrowType;
    const diff = y - programRing.y;
    this.c.blockState.add(programRing.id, {
      type,
      x: programRing.x,
      y,
      h: programRing.blockProps.fullH,
      w: programRing.blockProps.w,
      arrowType,
      arrowHook: arrowType,
      lastHook: programHook.id,
      indexArrowHook,
      branch: "none",
      render: true,
    });
    this.updateInnerBlockState(this.c.program[indexRing], diff);
    this.draw(programRing.id, null);
    this.setMissingEdgesOnSwapBlock({
      length,
      firstNode,
      secondNode,
      programRing,
    });
    this.removeVarNameFromScopeOnSwap();
  }

  loopBlockTypeInnerYes() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const { length, firstNode, secondNode } = this.swapBlocks({
      programRing,
      programHook,
      arrowType,
    });
    this.addNodeEdgesToInnerLoops();
    const indexRing = this.c.program.findIndex(
      (block) => programRing.id === block.id
    );
    const type = programRing.type;
    const indexArrowHook = programHook.outHookIndex.innerOutYes;
    const indexArrowHookRing = programRing.outHookIndex.out;
    this.c.program[indexRing].hooks[indexArrowHookRing].ioType =
      "bottom-inner-out-yes";
    this.c.program[indexRing].blockProps.branch = "YES";
    this.c.program[indexRing].parentId = programHook.id;
    const heightToAdd =
      type === "doWhileBlock"
        ? programHook.y + programRing.accumulativeHeight
        : programHook.y;
    const y = heightToAdd + this.innerPlusHeight;
    const diff = y - programRing.y;
    this.c.blockState.add(programRing.id, {
      type,
      x: programRing.x,
      y,
      h: programRing.blockProps.fullH,
      w: programRing.blockProps.w,
      arrowType: "bottom-inner-out-yes",
      arrowHook: arrowType,
      heightToAdd,
      indexArrowHook,
      lastHook: programHook.id,
      parentId: programHook.id,
      branch: "YES",
      render: true,
    });
    this.updateInnerBlockState(this.c.program[indexRing], diff);
    this.draw(programRing.id, programHook.id);
    this.setMissingEdgesOnSwapBlock({
      length,
      firstNode,
      secondNode,
      programRing,
    });
    this.removeVarNameFromScopeOnSwap();
  }

  doWhileBlockTypeInnerYes() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const { length, firstNode, secondNode } = this.swapBlocks({
      programRing,
      programHook,
      arrowType,
    });
    this.addNodeEdgesToInnerLoops();
    const indexRing = this.c.program.findIndex(
      (block) => programRing.id === block.id
    );
    const type = programRing.type;
    const indexArrowHook = programHook.outHookIndex.innerOutYes;
    const indexArrowHookRing = programRing.outHookIndex.out;
    this.c.program[indexRing].hooks[indexArrowHookRing].ioType =
      "bottom-inner-out-yes";
    this.c.program[indexRing].blockProps.branch = "YES";
    this.c.program[indexRing].parentId = programHook.id;
    const heightToAdd =
      type === "doWhileBlock"
        ? programHook.y +
          programRing.accumulativeHeight -
          programHook.accumulativeHeight +
          programHook.blockProps.accumH
        : programHook.y -
          programHook.accumulativeHeight +
          programHook.blockProps.accumH;
    const diff = heightToAdd - programRing.y;
    this.c.blockState.add(programRing.id, {
      type,
      x: programRing.x,
      y: heightToAdd,
      h: programRing.blockProps.fullH,
      w: programRing.blockProps.w,
      arrowType: "bottom-inner-out-yes",
      arrowHook: arrowType,
      heightToAdd,
      indexArrowHook,
      lastHook: programHook.id,
      parentId: programHook.id,
      branch: "YES",
      render: true,
    });
    this.updateInnerBlockState(this.c.program[indexRing], diff);
    this.draw(programRing.id, programHook.id);
    this.setMissingEdgesOnSwapBlock({
      length,
      firstNode,
      secondNode,
      programRing,
    });
    this.removeVarNameFromScopeOnSwap();
  }

  ifBlockTypeInnerYes() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const { length, firstNode, secondNode } = this.swapBlocks({
      programRing,
      programHook,
      arrowType,
    });
    this.addNodeEdgesToInnerIf();
    const indexRing = this.c.program.findIndex(
      (block) => programRing.id === block.id
    );
    const type = programRing.type;
    const indexArrowHook = programHook.outHookIndex.innerOutYes;
    const indexArrowHookRing = programRing.outHookIndex.out;
    this.c.program[indexRing].hooks[indexArrowHookRing].ioType =
      "bottom-inner-out-yes";
    this.c.program[indexRing].blockProps.branch = "YES";
    this.c.program[indexRing].parentId = programHook.id;
    const heightToAdd =
      type === "doWhileBlock"
        ? programHook.y + programRing.accumulativeHeight
        : programHook.y;
    const y = heightToAdd + this.innerPlusHeight;
    const diff = y - programRing.y;
    this.c.blockState.add(programRing.id, {
      type,
      x: programRing.x,
      y,
      h: programRing.blockProps.fullH,
      w: programRing.blockProps.w,
      arrowType: "bottom-inner-out-yes",
      arrowHook: arrowType,
      heightToAdd,
      indexArrowHook,
      lastHook: programHook.id,
      parentId: programHook.id,
      branch: "YES",
      render: true,
    });
    this.updateInnerBlockState(this.c.program[indexRing], diff);
    this.draw(programRing.id, programHook.id);
    this.setMissingEdgesOnSwapBlock({
      length,
      firstNode,
      secondNode,
      programRing,
    });
    this.removeVarNameFromScopeOnSwap();
  }

  ifBlockTypeInnerNo() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const { length, firstNode, secondNode } = this.swapBlocks({
      programRing,
      programHook,
      arrowType,
    });
    this.addNodeEdgesToInnerIf();
    const indexRing = this.c.program.findIndex(
      (block) => programRing.id === block.id
    );
    const type = programRing.type;
    const indexArrowHook = programHook.outHookIndex.innerOutNo;
    const indexArrowHookRing = programRing.outHookIndex.out;
    this.c.program[indexRing].hooks[indexArrowHookRing].ioType =
      "bottom-inner-out-no";
    this.c.program[indexRing].blockProps.branch = "NO";
    this.c.program[indexRing].parentId = programHook.id;
    const heightToAdd =
      type === "doWhileBlock"
        ? programHook.y + programRing.accumulativeHeight
        : programHook.y;
    const y = heightToAdd + this.innerPlusHeight;
    const diff = y - programRing.y;
    this.c.blockState.add(programRing.id, {
      type,
      x: programRing.x,
      y,
      h: programRing.blockProps.fullH,
      w: programRing.blockProps.w,
      arrowType: "bottom-inner-out-no",
      arrowHook: arrowType,
      heightToAdd,
      indexArrowHook,
      lastHook: programHook.id,
      parentId: programHook.id,
      branch: "NO",
      render: true,
    });
    this.updateInnerBlockState(this.c.program[indexRing], diff);
    this.draw(programRing.id, programHook.id);
    this.setMissingEdgesOnSwapBlock({
      length,
      firstNode,
      secondNode,
      programRing,
    });
    this.removeVarNameFromScopeOnSwap();
  }

  ioBlockTypeBottomInner() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const { length, firstNode, secondNode } = this.swapBlocks({
      programRing,
      programHook,
      arrowType,
    });
    this.addNodeEdgesIoBlocks();
    const indexRing = this.c.program.findIndex(
      (block) => programRing.id === block.id
    );
    const type = programRing.type;
    const indexArrowHook = programHook.outHookIndex.innerOutYes;
    const indexArrowHookRing = programRing.outHookIndex.out;
    this.c.program[indexRing].hooks[indexArrowHookRing].ioType = arrowType;
    this.c.program[indexRing].blockProps.branch = programHook.blockProps.branch;
    this.c.program[indexRing].parentId = programHook.parentId;
    const heightToAdd =
      type !== "doWhileBlock"
        ? this.addToHeight[type]
        : this.addToHeight[type] + programRing.accumulativeHeight;
    const y = programHook.hooks[indexArrowHook].y + heightToAdd;
    this.c.blockState.add(programRing.id, {
      type,
      x: programRing.x,
      y,
      h: programRing.blockProps.fullH,
      w: programRing.blockProps.w,
      arrowType,
      arrowHook: arrowType,
      heightToAdd,
      indexArrowHook,
      lastHook: programHook.id,
      parentId: programHook.parentId,
      branch: this.c.program[indexRing].blockProps.branch,
      render: true,
    });
    this.draw(programRing.id, programHook.parentId);
    this.setMissingEdgesOnSwapBlock({
      length,
      firstNode,
      secondNode,
      programRing,
    });
    this.removeVarNameFromScopeOnSwap();
  }

  loopBlockTypeBottomInner() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const { length, firstNode, secondNode } = this.swapBlocks({
      programRing,
      programHook,
      arrowType,
    });
    this.replaceAndAddNewEdge(programHook.id);
    const indexRing = this.c.program.findIndex(
      (block) => programRing.id === block.id
    );
    const type = programRing.type;
    const indexArrowHook = programHook.outHookIndex.out;
    const indexArrowHookRing = programRing.outHookIndex.out;
    this.c.program[indexRing].hooks[indexArrowHookRing].ioType = arrowType;
    this.c.program[indexRing].blockProps.branch = programHook.blockProps.branch;
    this.c.program[indexRing].parentId = programHook.parentId;
    const heightToAdd =
      type !== "doWhileBlock"
        ? this.addToHeight[type]
        : this.addToHeight[type] + programRing.accumulativeHeight;
    const y = programHook.hooks[indexArrowHook].y + heightToAdd;
    const diff = y - programRing.y;
    this.c.blockState.add(programRing.id, {
      type,
      x: programRing.x,
      y,
      h: programRing.blockProps.fullH,
      w: programRing.blockProps.w,
      arrowType,
      arrowHook: arrowType,
      heightToAdd,
      indexArrowHook,
      lastHook: programHook.id,
      parentId: programHook.parentId,
      branch: this.c.program[indexRing].blockProps.branch,
      render: true,
    });
    this.updateInnerBlockState(this.c.program[indexRing], diff);
    this.draw(programRing.id, programHook.parentId);
    this.setMissingEdgesOnSwapBlock({
      length,
      firstNode,
      secondNode,
      programRing,
    });
    this.removeVarNameFromScopeOnSwap();
  }

  doWhileBlockTypeBottomInner() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const { length, firstNode, secondNode } = this.swapBlocks({
      programRing,
      programHook,
      arrowType,
    });
    this.addNodeEdgesToInnerLoops();
    const indexRing = this.c.program.findIndex(
      (block) => programRing.id === block.id
    );
    const type = programRing.type;
    const indexArrowHook = programHook.outHookIndex.out;
    const indexArrowHookRing = programRing.outHookIndex.out;
    this.c.program[indexRing].hooks[indexArrowHookRing].ioType = arrowType;
    this.c.program[indexRing].blockProps.branch = programHook.blockProps.branch;
    this.c.program[indexRing].parentId = programHook.parentId;
    const heightToAdd =
      type !== "doWhileBlock"
        ? this.addToHeight[type]
        : this.addToHeight[type] + programRing.accumulativeHeight;
    const y = programHook.hooks[indexArrowHook].y + heightToAdd;
    const diff = y - programRing.y;
    this.c.blockState.add(programRing.id, {
      type,
      x: programRing.x,
      y,
      h: programRing.blockProps.fullH,
      w: programRing.blockProps.w,
      arrowType,
      arrowHook: arrowType,
      heightToAdd,
      indexArrowHook,
      lastHook: programHook.id,
      parentId: programHook.parentId,
      branch: this.c.program[indexRing].blockProps.branch,
      render: true,
    });
    this.updateInnerBlockState(this.c.program[indexRing], diff);
    this.draw(programRing.id, programHook.parentId);
    this.setMissingEdgesOnSwapBlock({
      length,
      firstNode,
      secondNode,
      programRing,
    });
    this.removeVarNameFromScopeOnSwap();
  }

  ifBlockTypeBottomInner() {
    const { programRing, programHook, arrowType } = this.c.interceptedProgram;
    const { length, firstNode, secondNode } = this.swapBlocks({
      programRing,
      programHook,
      arrowType,
    });
    this.replaceAndAddNewEdge(programHook.id);
    const indexRing = this.c.program.findIndex(
      (block) => programRing.id === block.id
    );
    const type = programRing.type;
    const indexArrowHook = programHook.outHookIndex.out;
    const indexArrowHookRing = programRing.outHookIndex.out;
    this.c.program[indexRing].hooks[indexArrowHookRing].ioType = arrowType;
    this.c.program[indexRing].blockProps.branch = programHook.blockProps.branch;
    this.c.program[indexRing].parentId = programHook.parentId;
    const heightToAdd =
      type !== "doWhileBlock"
        ? this.addToHeight[type]
        : this.addToHeight[type] + programRing.accumulativeHeight;
    const y = programHook.hooks[indexArrowHook].y + heightToAdd;
    const diff = y - programRing.y;
    this.c.blockState.add(programRing.id, {
      type,
      x: programRing.x,
      y,
      h: programRing.blockProps.fullH,
      w: programRing.blockProps.w,
      arrowType,
      arrowHook: arrowType,
      heightToAdd,
      indexArrowHook,
      lastHook: programHook.id,
      parentId: programHook.parentId,
      branch: this.c.program[indexRing].blockProps.branch,
      render: true,
    });
    this.updateInnerBlockState(this.c.program[indexRing], diff);
    this.draw(programRing.id, programHook.parentId);
    this.setMissingEdgesOnSwapBlock({
      length,
      firstNode,
      secondNode,
      programRing,
    });
    this.removeVarNameFromScopeOnSwap();
  }

  swapBlocks({ programRing, programHook, arrowType }) {
    if (programRing.hooks[0].occupied) {
      this.removeBlockPropsOutsideFlow();
      this.moveBlocksBeforeDraw();
      programRing.x = this.setXOnDrop(programRing, programHook, arrowType);
      this.c.interceptedProgram = { programRing, programHook, arrowType };
    }
    return this.getEdgesOfSwapBlockDropped();
  }

  updateStateOnSwap() {
    const tree = this.c.graph
      .breadthFirstSearch(this.c.startBlockId)
      .filter((g) => g !== this.c.endBlockId);
    tree.forEach((node) => {
      const state = this.c.blockState.get(node);
      const index = this.c.program.findIndex((block) => block.id === node);
      if (index > -1) {
        const indexHook = this.c.program.findIndex(
          (block) => block.id === state.lastHook
        );
        const indexArrowHook = flowChartEditor.API.getIndexHook(
          this.c.program[indexHook].type,
          state.arrowHook
        );
        this.c.blockState.update(node, { indexArrowHook });
      }
    });
    this.c.pauseRenderX = false;
  }

  isUsedVaribleOnSwap({ programRing, programHook, arrowType }) {
    if (this.reHook({ programRing, programHook, arrowType }))
      return { isUsed: true, isRehook: true, variableName: "" };
    if (["defineBlock", "inputBlock", "forBlock"].includes(programRing.type)) {
      if (this.isNotDefineVar(programRing))
        return { isUsed: false, isRehook: false, variableName: "" };
      if (this.checkIoBlockScope({ programRing, programHook, arrowType }))
        return {
          isUsed: true,
          isRehook: false,
          variableName: programRing.variableName,
        };
    }
    const { isParentVarUsed, parentVarName } = this.checkParentBlockScope(
      programHook,
      arrowType
    );
    if (isParentVarUsed)
      return { isUsed: true, isRehook: false, variableName: parentVarName };
    if (programRing.hooks[0].occupied) {
      this.removeAndUpdateVariablesScopeOnSwap({
        programRing,
        programHook,
        arrowType,
      });
    } else {
      this.setScopeFromOutsideBlock({ programRing, programHook, arrowType });
    }
    return { isUsed: false };
  }

  removeScopeFromFlow() {
    const dropped = { ...this.outsideFlowBlock, clone: true };
    if (["defineBlock", "inputBlock"].includes(dropped.type)) {
      if (dropped.type === "inputBlock" && dropped.radioOption === "selectVar")
        return;
      if (!dropped.parentId) {
        if (this.c.program[0].globalScope.hasKey(dropped.variableName)) {
          this.c.program[0].globalScope.remove(dropped.variableName);
        }
      } else {
        const index = this.c.program.findIndex(
          (block) => block.id === dropped.parentId
        );
        const { scopeProp } = this.c.program[index].getScopeProps(
          this.c.program[index].type,
          dropped.blockProps.branch
        );
        this.c.program[index][scopeProp].remove(dropped.variableName);
      }
    }
  }

  reHook({ programRing, programHook, arrowType }) {
    const lastRingState = this.c.blockState.get(programRing.id);
    if (
      lastRingState &&
      lastRingState.lastHook === programHook.id &&
      lastRingState.arrowHook === arrowType &&
      lastRingState.render
    ) {
      this.cloneBlockIterator();
      return true;
    }
    return false;
  }

  isNotDefineVar(block) {
    if (block.type === "inputBlock" && block.radioOption === "selectVar")
      return true;
    if (
      !this.innerBlocks.length &&
      block.type === "forBlock" &&
      block.radioVar === "selectVar"
    )
      return true;
    return false;
  }

  checkIoBlockScope({ programRing, programHook, arrowType }) {
    if (["inner-out-yes", "inner-out-no"].includes(arrowType)) {
      return this.blockHookHasVar(programHook, programRing, arrowType);
    } else if (
      ["bottom-inner-out-yes", "bottom-inner-out-no"].includes(arrowType)
    ) {
      const indexParent = this.c.program.findIndex(
        (parentBlock) => parentBlock.id === programHook.parentId
      );
      return this.blockHookHasVar(
        this.c.program[indexParent],
        programRing,
        arrowType
      );
    } else {
      return this.findVarScopeIterateAllBlocks(programRing);
    }
  }

  blockHookHasVar(block, programRing, arrowType) {
    const branch = ["inner-out-no", "bottom-inner-out-no"].includes(arrowType)
      ? "NO"
      : "YES";
    const { scopeProp } = block.getScopeProps(block.type, branch);
    if (
      !Utils.isEmpty(programRing.code) &&
      block[scopeProp].hasKey(programRing.variableName) &&
      block.id !== programRing.parentId
    ) {
      this.cloneBlockIterator();
      return true;
    } else {
      const children = this.c
        .getChildren(block.id)
        .filter((child) =>
          ["whileBlock", "doWhileBlock", "forBlock", "ifBlock"].includes(
            child.type
          )
        );
      const allDescendants = this.c.getAllDescendants(children);
      for (let i = 0; i < allDescendants.length; i++) {
        const idx = this.c.program.findIndex(
          (child) => child.id === allDescendants[i].id
        );
        const { scopeProp } = this.c.program[idx].getScopeProps(
          this.c.program[idx].type,
          "NO"
        );
        if (
          !Utils.isEmpty(programRing.code) &&
          this.c.program[idx][scopeProp].hasKey(programRing.variableName)
        ) {
          const value = this.c.program[idx][scopeProp].get(
            programRing.variableName
          );
          if (
            ["defineBlock", "inputBlock"].includes(
              this.c.interceptedProgram.programRing.type
            ) &&
            value.id !== this.c.interceptedProgram.programRing.id
          ) {
            this.cloneBlockIterator();
            return true;
          }
        }
        if (this.c.program[idx].type === "ifBlock") {
          if (
            !Utils.isEmpty(programRing.code) &&
            this.c.program[idx].ifScopeBranchRight.hasKey(
              programRing.variableName
            )
          ) {
            const value = this.c.program[idx].ifScopeBranchRight.get(
              programRing.variableName
            );
            if (
              ["defineBlock", "inputBlock"].includes(
                this.c.interceptedProgram.programRing.type
              ) &&
              value.id !== this.c.interceptedProgram.programRing.id
            ) {
              this.cloneBlockIterator();
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  findVarScopeIterateAllBlocks(programRing) {
    for (let i = 0; i < this.c.program.length; i++) {
      const { type } = this.c.program[i];
      if (
        [
          "startBlock",
          "ifBlock",
          "whileBlock",
          "doWhileBlock",
          "forBlock",
        ].includes(type)
      ) {
        const { scopeProp } = this.c.program[i].getScopeProps(type, "NO");
        if (
          !Utils.isEmpty(programRing.code) &&
          this.c.program[i][scopeProp].hasKey(programRing.variableName) &&
          this.c.program[i][scopeProp].get(programRing.variableName).id !==
            programRing.id &&
          this.c.program[i].id !== programRing.parentId &&
          this.c.program[i].id !== programRing.id
        ) {
          this.cloneBlockIterator();
          return true;
        }
        if (type === "ifBlock") {
          if (
            !Utils.isEmpty(programRing.code) &&
            this.c.program[i].ifScopeBranchRight.hasKey(
              programRing.variableName
            ) &&
            this.c.program[i].id !== programRing.parentId &&
            this.c.program[i].id !== programRing.id
          ) {
            this.cloneBlockIterator();
            return true;
          }
        }
      }
    }
    return false;
  }

  checkParentBlockScope(programHook, arrowType) {
    if (this.innerBlocks.length > 0) {
      if (
        arrowType === "out" &&
        this.c.interceptedProgram.programRing.parentId === null
      )
        return { isParentVarUsed: false };
      for (let i = 0; i < this.innerBlocks.length; i++) {
        const { type } = this.innerBlocks[i];
        if (
          this.checkIoBlockScope({
            programRing: this.innerBlocks[i],
            programHook,
            arrowType,
          })
        )
          return {
            isParentVarUsed: true,
            parentVarName: this.innerBlocks[i].variableName,
          };
      }
    }
    return { isParentVarUsed: false };
  }

  removeAndUpdateVariablesScopeOnSwap({ programRing, programHook, arrowType }) {
    if (!programRing.parentId) {
      this.updateAndRemoveScopeBlockWithNotParent({
        programRing,
        programHook,
        arrowType,
      });
    } else if (programRing.parentId) {
      this.updateAndRemoveScopeBlockWithParent({
        programRing,
        programHook,
        arrowType,
      });
    }
  }

  updateAndRemoveScopeBlockWithNotParent({
    programRing,
    programHook,
    arrowType,
  }) {
    const value = this.c.program[0].globalScope.get(programRing.variableName);
    if (!value) return;
    if (["inner-out-yes", "inner-out-no"].includes(arrowType)) {
      const indexHook = this.c.program.findIndex(
        (block) => block.id === programHook.id
      );
      const { scopeProp, scope } = this.c.program[indexHook].getScopeProps(
        this.c.program[indexHook].type,
        this.c.program[indexHook].blockProps.branch
      );
      value.scope = scope;
      this.c.program[indexHook][scopeProp].update(programRing.variableName, {
        ...value,
      });
      this.removeScopeVar = {
        scope: "globalScope",
        index: 0,
        varName: programRing.variableName,
      };
    } else if (
      ["bottom-inner-out-yes", "bottom-inner-out-no"].includes(arrowType)
    ) {
      const indexHookParent = this.c.program.findIndex(
        (block) => block.id === programHook.parentId
      );
      const { scopeProp, scope } = this.c.program[
        indexHookParent
      ].getScopeProps(
        this.c.program[indexHookParent].type,
        this.c.program[indexHookParent].blockProps.branch
      );
      value.scope = scope;
      this.c.program[indexHookParent][scopeProp].update(
        programRing.variableName,
        { ...value }
      );
      this.removeScopeVar = {
        scope: "globalScope",
        index: 0,
        varName: programRing.variableName,
      };
    }
  }

  updateAndRemoveScopeBlockWithParent({ programRing, programHook, arrowType }) {
    const indexParentHook = this.c.program.findIndex(
      (block) => block.id === programRing.parentId
    );
    const { scopeProp } = this.c.program[indexParentHook].getScopeProps(
      this.c.program[indexParentHook].type,
      programRing.blockProps.branch
    );
    const value = this.c.program[indexParentHook][scopeProp].get(
      programRing.variableName
    );
    if (!value) return;
    if (["inner-out-yes", "inner-out-no"].includes(arrowType)) {
      const indexHook = this.c.program.findIndex(
        (block) => block.id === programHook.id
      );
      const branch = arrowType === "inner-out-no" ? "NO" : "YES";
      const scopePropHook = programHook.getScopeProps(
        programHook.type,
        branch
      ).scopeProp;
      const scopeHook = programHook.getScopeProps(
        programHook.type,
        branch
      ).scope;
      value.scope = scopeHook;
      this.c.program[indexHook][scopePropHook].update(
        programRing.variableName,
        { ...value }
      );
      this.removeScopeVar = {
        scope: scopeProp,
        index: indexParentHook,
        varName: programRing.variableName,
      };
    } else if (
      ["bottom-inner-out-yes", "bottom-inner-out-no"].includes(arrowType)
    ) {
      const indexHook = this.c.program.findIndex(
        (block) => block.id === programHook.parentId
      );
      const branch = arrowType === "bottom-inner-out-no" ? "NO" : "YES";
      const scopePropHook = this.c.program[indexHook].getScopeProps(
        this.c.program[indexHook].type,
        branch
      ).scopeProp;
      const scopeHook = programHook.getScopeProps(
        programHook.type,
        branch
      ).scope;
      value.scope = scopeHook;
      this.c.program[indexHook][scopePropHook].update(
        programRing.variableName,
        { ...value }
      );
      this.removeScopeVar = {
        scope: scopeProp,
        index: indexParentHook,
        varName: programRing.variableName,
      };
    } else {
      value.scope = "Global scope";
      this.c.program[0].globalScope.update(programRing.variableName, {
        ...value,
      });
      this.removeScopeVar = {
        scope: scopeProp,
        index: indexParentHook,
        varName: programRing.variableName,
      };
    }
  }

  setScopeFromOutsideBlock({ programRing, programHook, arrowType }) {
    if (["defineBlock", "inputBlock"].includes(programRing.type)) {
      if (
        programRing.type === "inputBlock" &&
        programRing.radioOption === "selectVar"
      )
        return;
      if (Utils.isEmpty(programRing.code)) return;
      const indexRing = this.c.program.findIndex(
        (block) => block.id === programRing.id
      );
      if (["inner-out-yes", "inner-out-no"].includes(arrowType)) {
        const branch = "inner-out-no" === arrowType ? "NO" : "YES";
        const indexHook = this.c.program.findIndex(
          (block) => block.id === programHook.id
        );
        const { scopeProp, scope } = this.c.program[indexHook].getScopeProps(
          this.c.program[indexHook].type,
          branch
        );
        this.c.program[indexRing].addVariableToScope({
          index: indexHook,
          scopeProp,
          scope,
          isInFlow: true,
        });
      } else if (
        ["bottom-inner-out-yes", "bottom-inner-out-no"].includes(arrowType)
      ) {
        const branch = "bottom-inner-out-no" === arrowType ? "NO" : "YES";
        const indexHook = this.c.program.findIndex(
          (block) => block.id === programHook.parentId
        );
        const { scopeProp, scope } = this.c.program[indexHook].getScopeProps(
          this.c.program[indexHook].type,
          branch
        );
        this.c.program[indexRing].addVariableToScope({
          index: indexHook,
          scopeProp,
          scope,
          isInFlow: true,
        });
      } else {
        this.c.program[indexRing].addVariableToScope({
          index: 0,
          scopeProp: "globalScope",
          scope: "Global scope",
          isInFlow: true,
        });
      }
    }
  }

  getEdgesOfSwapBlockDropped() {
    const { programRing } = this.c.interceptedProgram;
    if (this.innerBlocks.length > 0) {
      const nodeEdges = this.c.graph.getNodeEdges(programRing.id);
      const length = nodeEdges.length;
      let firstNode;
      switch (length) {
        case 2:
          firstNode = nodeEdges[1];
          return { length, firstNode };
        case 3:
          firstNode = nodeEdges[1];
          const secondNode = nodeEdges[2];
          return { length, firstNode, secondNode };
        default:
          break;
      }
    }
    return {};
  }

  updateInnerBlockState(parentBlock, diff) {
    this.innerBlocks.forEach((innerBlock) => {
      this.c.blockState.update(innerBlock.id, {
        y: innerBlock.y + diff,
        render: true,
      });
    });
  }

  setMissingEdgesOnSwapBlock({ length, firstNode, secondNode, programRing }) {
    if (this.innerBlocks.length > 0) {
      const nodeEdges = this.c.graph.getNodeEdges(programRing.id);
      if (length === 2) {
        if (!nodeEdges.length) this.c.graph.addEdge(programRing.id, null);
        this.c.graph.addEdge(programRing.id, firstNode);
      } else {
        if (!nodeEdges.length) this.c.graph.addEdge(programRing.id, null);
        this.c.graph.addEdge(programRing.id, firstNode);
        this.c.graph.addEdge(programRing.id, secondNode);
      }
    }
    this.updateVariableState(programRing, true);
  }

  parentTasks(parentId) {
    this.setParents(parentId);
    this.setParentsDeep(parentId);
  }

  setParents(parentId) {
    this.parents = [];
    this.parents.push(parentId);
    this.findParents(parentId, this.parents);
  }

  setParentsDeep(parentId) {
    this.parentDeep = [];
    this.parentDeep.push(parentId);
    this.findParents(parentId, this.parentDeep);
  }

  findParents(parentId, parents) {
    const index = this.c.program.findIndex((block) => parentId === block.id);
    if (index > -1) {
      const parentBlock = this.c.program[index].parentId;
      if (parentBlock !== null) {
        parents.push(parentBlock);
        this.findParents(parentBlock, parents);
      }
    }
    return;
  }

  draw(startId, parentId) {
    const { programRing } = this.c.interceptedProgram;
    this.c.interceptedProgram.incrementY = programRing.blockProps.fullH;
    this.findDeepPathAndUpdateStateBlock(startId);
    this.updateParentHeight(parentId);
    this.moveBlocksBeforeDraw();
    this.widthManager();
  }

  widthManager() {
    const node = this.c.expandShrink.getFirstNode();
    if (node === this.c.endBlockId) return;
    this.c.expandShrink.getNodesAndVisit(node);
  }

  widthManagerOutsideBlocks() {
    const nodes = this.c.program
      .filter(
        (block) =>
          ["forBlock", "whileBlock", "doWhileBlock", "ifBlock"].includes(
            block.type
          ) && !block.hooks[0].occupied
      )
      .map((block) => block.id);
    this.c.expandShrink.visitNodes(nodes);
    this.c.update();
    this.flowErrorManager.execute();
  }

  findDeepPathAndUpdateStateBlock(id, isRemoved = false) {
    let { incrementY, programRing } = this.c.interceptedProgram;
    incrementY = !isRemoved ? incrementY : -incrementY;
    let path = this.c.graph.depthFirstSearch(id);
    let keys = Object.keys(path);
    keys.forEach((key) => {
      const indexKey = this.c.program.findIndex((block) => block.id === key);
      if (indexKey > -1 && this.c.program[indexKey].id !== programRing.id) {
        const y = this.c.program[indexKey].y + incrementY;
        this.c.blockState.update(this.c.program[indexKey].id, { y });
      }
    });
  }

  updateParentHeight(parentId, isRemoved = false) {
    if (!parentId) return;
    this.parentTasks(parentId);
    this.parentDeep.forEach((parent) => {
      let { incrementY, programRing } = this.c.interceptedProgram;
      incrementY = !isRemoved ? incrementY : -incrementY;
      const index = this.c.program.findIndex((block) => block.id === parent);
      const indexParent = this.parents.findIndex((p) => p === parent);
      const type = this.c.program[index].type;
      if (indexParent > -1) {
        if (["whileBlock", "forBlock", "doWhileBlock"].includes(type)) {
          this.c.program[index].accumulativeHeight += incrementY;
          const accum = !isRemoved
            ? incrementY
            : this.ioBlocks.includes(programRing.type)
            ? -programRing.blockProps.h
            : -programRing.blockProps.fullH;
          this.c.program[index].blockProps.fullH += accum;
        }
      }
      if (this.loopBlocks.includes(type))
        this.updateHeightLoop(index, isRemoved);
      if (type === "doWhileBlock") this.updateHeightDoWhile(index, isRemoved);
      if (type === "ifBlock") this.updateHeightIf(index, isRemoved);
      const edges = this.c.graph.getNodeEdges(parent);
      this.findDeepPathAndUpdateStateBlock(edges[0], isRemoved);
    });
  }

  moveBlocksBeforeDraw() {
    this.c.blockState.toArray().forEach((block) => {
      const [id, props] = block;
      if (props.render) {
        const index = this.c.program.findIndex((block) => block.id === id);
        this.c.program[index].hooks[0].occupied = true;
        this.c.program[index].isLocked = false;
        this.c.program[index].y = props.y;
        this.c.program[index].move(
          this.c.program[index].x,
          this.c.program[index].y
        );
      }
    });
    this.flowErrorManager.execute();
  }

  updateHeightLoop(index, isRemoved = false) {
    const plusOutHeight =
      this.c.program[index].accumulativeHeight > 0
        ? this.c.program[index].accumulativeHeight + this.widthLine
        : this.widthLine;
    const plusHeight =
      this.c.program[index].accumulativeHeight > 0
        ? this.c.program[index].accumulativeHeight
        : 0;
    this.c.program[index].updateHeight({ plusOutHeight, plusHeight });
  }

  updateHeightDoWhile(index, isRemoved = false) {
    const { incrementY } = this.c.interceptedProgram;
    let height = 0;
    if (isRemoved) {
      height = -incrementY;
    } else if (
      this.c.program[index].accumulativeHeight > this.doWhileDefaultAccum
    ) {
      height = incrementY;
    }
    this.c.program[index].updateHeight({ height, isRemoved });
    const y = this.c.program[index].y;
    this.c.blockState.update(this.c.program[index].id, { y });
  }

  updateHeightIf(index, isRemoved = false) {
    const {
      incrementY,
      programRing: { id },
    } = this.c.interceptedProgram;
    this.c.interceptedProgram.foundChildId = 0;
    let incrementOutLine = this.incrementOutLine;
    let incrementHeightRightLine = this.incrementHeightRightLine;
    let incrementHeightLeftLine = this.incrementHeightLeftLine;
    let incrementLeftRing = this.incrementLeftRing;
    let incrementRightRing = this.incrementRightRing;
    let heightLeftLine = 0;
    let heightRightLine = 0;
    let plusY = 0;
    const childrenBranchLeft = this.c.getSortedChildren(
      this.c.program[index].id,
      "NO"
    );
    const childrenBranchRight = this.c.getSortedChildren(
      this.c.program[index].id,
      "YES"
    );
    const { totalBranchL, totalBranchR } = this.totalHeightByBranch({
      childrenBranchLeft,
      childrenBranchRight,
    });
    const totalH = totalBranchL >= totalBranchR ? totalBranchL : totalBranchR;
    const fullH = this.c.program[index].accumulativeHeight;
    if (totalBranchL > totalBranchR) {
      incrementOutLine += totalBranchL;
      incrementHeightRightLine += totalBranchL - totalBranchR;
      incrementLeftRing += totalBranchL;
      incrementRightRing += totalBranchR;
      heightLeftLine = totalBranchL;
      heightRightLine = totalBranchR;
      if (!isRemoved) {
        plusY = fullH === 0 ? incrementY : fullH > totalH ? 0 : totalH - fullH;
      } else {
        plusY = fullH - totalH;
      }
    } else if (totalBranchL < totalBranchR) {
      incrementOutLine += totalBranchR;
      incrementHeightLeftLine += totalBranchR - totalBranchL;
      incrementRightRing += totalBranchR;
      incrementLeftRing += totalBranchL;
      heightLeftLine = totalBranchL;
      heightRightLine = totalBranchR;
      if (!isRemoved) {
        plusY = fullH === 0 ? incrementY : fullH > totalH ? 0 : totalH - fullH;
      } else {
        plusY = fullH - totalH;
      }
    } else {
      incrementOutLine += totalBranchL;
      incrementLeftRing += totalBranchL;
      incrementRightRing += totalBranchR;
      heightLeftLine = totalBranchL;
      heightRightLine = totalBranchR;
      if (isRemoved) {
        plusY = fullH - totalH;
      }
    }
    const nodeEdges = this.c.graph.getNodeEdges(this.c.program[index].id);
    if (nodeEdges[0]) {
      if (nodeEdges[0] !== id) {
        this.c.interceptedProgram.incrementY = plusY;
      }
    } else {
      this.c.interceptedProgram.incrementY = plusY;
    }
    this.c.program[index].updateHeight({
      leftBranchHeight: totalBranchL,
      rightBranchHeight: totalBranchR,
      incrementOutLine,
      incrementHeightLeftLine,
      incrementHeightRightLine,
      incrementLeftRing,
      incrementRightRing,
      heightLeftLine,
      heightRightLine,
    });
  }

  totalHeightByBranch({ childrenBranchLeft, childrenBranchRight }) {
    const totalBranchL = childrenBranchLeft
      .map((child) => {
        const accum =
          child.type === "doWhileBlock" ? this.doWhileDefaultAccum : 0;
        return child.props.h + child.accumulativeHeight - accum;
      })
      .reduce((a, b) => a + b, 0);

    const totalBranchR = childrenBranchRight
      .map((child) => {
        const accum =
          child.type === "doWhileBlock" ? this.doWhileDefaultAccum : 0;
        return child.props.h + child.accumulativeHeight - accum;
      })
      .reduce((a, b) => a + b, 0);

    return { totalBranchL, totalBranchR };
  }

  runCommand(ev) {
    if (ev.code === "Enter") {
      const command = document.querySelector(
        `#${this.c.consolePromptElement}`
      ).value;
      if (command.length) {
        this.c.runCanvas(false, command);
        document.querySelector(`#${this.c.consolePromptElement}`).value = "";
      }
    }
  }

  removeBlockPropsOutsideFlow() {
    if (this.outsideFlowBlock) {
      if (this.outsideFlowBlock.hooks[0].occupied) {
        const index = this.c.program.findIndex(
          (block) => block.id === this.outsideFlowBlock.id
        );
        this.c.program[index].hooks[0].occupied = false;
        this.removeBlockOutsideFromGraph();
        this.moveBlocksBeforeDraw();
      }
    }
    this.resetValues();
  }

  removeBlockOutsideFromGraph() {
    const { arrowType } = this.c.interceptedProgram || "";
    const branch = ["inner-out-no", "bottom-inner-out-no"].includes(arrowType)
      ? "NO"
      : "YES";
    const blockDroped = this.outsideFlowBlock;
    blockDroped.blockProps.branch = branch;
    const nodeEdges = this.c.graph.getNodeEdges(blockDroped.id);
    let fullHeight = this.getRemoveHeight(blockDroped, 0);
    this.c.interceptedProgram = {
      programRing: blockDroped,
      incrementY: fullHeight,
      arrowType,
    };
    const parentId = blockDroped.parentId;
    const blockState = this.c.blockState.get(blockDroped.id);
    const topBlockIndex = this.c.program.findIndex(
      (block) => block.id === blockState.lastHook
    );
    const bottomBlockNode = this.c.graph.getNodeEdges(blockDroped.id);
    const bottomBlockIndex = bottomBlockNode[0]
      ? this.c.program.findIndex((block) => block.id === bottomBlockNode[0])
      : -1;
    const topBlock = this.c.program[topBlockIndex];
    const bottomBlock =
      bottomBlockIndex > -1 ? this.c.program[bottomBlockIndex] : null;
    this.replaceNodeEdgesOnRemove(topBlock.id, blockDroped.id, false);
    if (bottomBlockIndex > -1) {
      this.c.blockState.update(bottomBlock.id, { lastHook: topBlock.id });
      this.findDeepPathAndUpdateStateBlock(bottomBlock.id, true);
    }
    const index = this.c.program.findIndex(
      (block) => block.id === this.outsideFlowBlock.id
    );
    this.c.program[index].parentId = null;
    this.c.blockState.update(blockDroped.id, { render: false });
    this.deleteBreakpoint(blockDroped.id);
    this.innerBlocks.forEach((innerBlock) => {
      this.deleteBreakpoint(innerBlock.id);
      this.c.blockState.update(innerBlock.id, { render: false });
    });
    this.updateVariableState(blockDroped, false);
    this.updateParentHeight(parentId, true);
    if (nodeEdges.length === 1) {
      const tempEdge = nodeEdges[0];
      this.delReplacedEdgesOnRemove(blockDroped.id, [tempEdge]);
      if (!this.ioBlocks.includes(blockDroped.type)) {
        this.addReplacedEdgesOnRemove(blockDroped.id, [null, tempEdge]);
      }
    } else if (nodeEdges.length === 2) {
      if (["doWhileBlock", ...this.loopBlocks].includes(blockDroped.type)) {
        const tempEdge = nodeEdges[0];
        const tempEdge2 = nodeEdges[1];
        this.delReplacedEdgesOnRemove(blockDroped.id, [tempEdge, tempEdge2]);
        this.addReplacedEdgesOnRemove(blockDroped.id, [null, tempEdge2]);
      } else {
        const tempEdge = nodeEdges[0] || "empty";
        const tempEdge2 = nodeEdges[1] || "empty";
        this.delReplacedEdgesOnRemove(blockDroped.id, [tempEdge, tempEdge2]);
        this.addReplacedEdgesOnRemove(blockDroped.id, [
          null,
          tempEdge,
          tempEdge2,
        ]);
      }
    }
  }

  removeBlockFromGraph(blockDroped, i) {
    let lessI = 0;
    this.innerBlocksToRemove = {};
    if (blockDroped && blockDroped.hooks[0].occupied) {
      let fullHeight = this.getRemoveHeight(blockDroped, 0);
      this.c.interceptedProgram = {
        programRing: blockDroped,
        incrementY: fullHeight,
      };
      const parentId = blockDroped.parentId;
      const blockState = this.c.blockState.get(blockDroped.id);
      const topBlockIndex = this.c.program.findIndex(
        (block) => block.id === blockState.lastHook
      );
      const bottomBlockNode = this.c.graph.getNodeEdges(blockDroped.id);
      const bottomBlockIndex = bottomBlockNode[0]
        ? this.c.program.findIndex((block) => block.id === bottomBlockNode[0])
        : -1;
      const topBlock = this.c.program[topBlockIndex];
      const bottomBlock =
        bottomBlockIndex > -1 ? this.c.program[bottomBlockIndex] : null;
      this.getRemoveInnerBlock(blockDroped.id);
      lessI = this.removeInnerBlocks(this.innerBlocksToRemove, lessI);
      this.replaceNodeEdgesOnRemove(topBlock.id, blockDroped.id);
      if (bottomBlockIndex > -1) {
        this.c.blockState.update(bottomBlock.id, { lastHook: topBlock.id });
        this.findDeepPathAndUpdateStateBlock(bottomBlock.id, true);
      }
      i = this.c.program.findIndex((block) => block.id === blockDroped.id);
      this.deleteStateVars(this.c.program[i]);
      this.c.program[i].remove();
      this.removeBlockFromState(blockDroped.id);
      this.updateParentHeight(parentId, true);
    } else {
      let index = -1;
      if (blockDroped) {
        this.innerBlocks.forEach((innerBlock) => {
          const idx = this.c.program.findIndex(
            (block) => block.id === innerBlock.id
          );
          this.c.graph.removeNode(innerBlock.id);
          this.c.program[idx].remove();
          lessI++;
        });
        this.c.graph.removeNode(blockDroped.id);
        index = this.c.program.findIndex(
          (block) => block.id === blockDroped.id
        );
      }
      index = index > -1 ? index : i;
      this.c.program[index].remove();
    }
    lessI++;
    this.resetValues();
    return { deletedBlock: true, undo: false, lessI };
  }

  undoDeleteBlock() {
    this.cloneBlockIterator();
    return { deletedBlock: false, undo: true, lessI: 0 };
  }

  cloneBlockIterator() {
    this.cloneBlocks.forEach((cloneBlock, index) => {
      this.c.program[cloneBlock.index].move(cloneBlock.x, cloneBlock.y);
      this.c.program[cloneBlock.index].grabed = false;
      this.c.program[cloneBlock.index].selected = false;
      if (index !== 0) {
        this.c.program[cloneBlock.index].isLocked = this.cloneBlocks[0].hooks[0]
          .occupied
          ? false
          : true;
      }
    });
  }

  dialogConfirm(text) {
    return new Promise((resolve) => {
      const stylePopup = `display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 40px 40px 40px;
        gap: 20px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        width: 365px;
        height: 160px;
        border: 8px double rgb(170, 7, 7);
        color: rgb(150 8 8);
        background: rgb(255, 255, 255);
        box-shadow: 5px 5px 10px 5px #0000009e;
        align-items: center;`;
      const styleP = `grid-column: 1/-1; font-size: 1.5em;`;
      const styleCheck = `display: flex; grid-column: 1/-1; color: #444; align-items: end; font-size: 1.2em;`;
      const wrapper = document.createElement("div");
      const popup = document.createElement("div");
      const p = document.createElement("p");
      const checkContainer = document.createElement("div");
      const checkBox = document.createElement("input");
      const span = document.createElement("span");
      const okBtn = document.createElement("button");
      const cancelBtn = document.createElement("button");
      wrapper.classList.add("moreOptions-overlay");
      wrapper.style.height = "100%";
      popup.style = stylePopup;
      wrapper.appendChild(popup);
      p.textContent = text;
      p.style = styleP;
      checkContainer.style = styleCheck;
      checkBox.setAttribute("id", "removeBlockDialogBox");
      checkBox.type = "checkbox";
      checkBox.checked = this.c.removeDialogBox;
      span.textContent = "Don't show this dialog box next time";
      span.style.marginLeft = "10px";
      okBtn.textContent = "Ok";
      cancelBtn.textContent = "Cancel";
      okBtn.classList.add("bxy_button--green");
      cancelBtn.classList.add("bxy_button--red");
      okBtn.style = "cursor: pointer; height: 35px;";
      cancelBtn.style = "cursor: pointer; height: 35px;";
      checkContainer.appendChild(checkBox);
      checkContainer.appendChild(span);
      popup.appendChild(p);
      popup.appendChild(checkContainer);
      popup.appendChild(okBtn);
      popup.appendChild(cancelBtn);
      document
        .querySelector("body")
        .insertBefore(wrapper, document.querySelector("body").childNodes[0]);
      const onClick = (pass) => {
        resolve(pass);
        this.c.removeDialogBox = document.querySelector(
          "#removeBlockDialogBox"
        ).checked;
        wrapper.remove();
      };
      okBtn.addEventListener("click", onClick.bind(null, true));
      cancelBtn.addEventListener("click", onClick.bind(null, false));
    });
  }

  async runDialogConfirm(blockDroped, i) {
    let open = false;
    let message = "Are you sure remove block/s from flowchart ?";
    if (!blockDroped) {
      return this.removeBlockFromGraph(blockDroped, i);
    }
    if (this.isVarNameInUse(blockDroped, i)) {
      open = true;
      message = `variable ${blockDroped.variableName} cannot be removed because it's in use. Delete anyway ?`;
    }
    if (this.c.removeDialogBox && !open) {
      this.removeTab(blockDroped);
      return this.removeBlockFromGraph(blockDroped, i);
    }
    if (await this.dialogConfirm(message)) {
      this.removeTab(blockDroped);
      return this.removeBlockFromGraph(blockDroped, i);
    } else {
      return this.undoDeleteBlock();
    }
  }

  removeTab(blockDroped) {
    if (
      blockDroped.type === "wrapBlock" &&
      blockDroped.wrapType === "function_declaration"
    ) {
      this.c.tabs = this.c.tabs.filter((tab) => tab.id !== blockDroped.tabId);
    }
  }

  isVarNameInUse(blockDroped, i) {
    if (Utils.isEmpty(blockDroped.code)) return false;
    if (["defineBlock", "inputBlock", "forBlock"].includes(blockDroped.type)) {
      const isNotDefineVar = this.isNotDefineVar(blockDroped);
      if (isNotDefineVar) return false;
      const { id, variableName } = blockDroped;
      const regex = new RegExp(`\\b${variableName}\\b`, "g");
      if (!blockDroped.parentId) {
        const blocks = this.c.program.filter(
          (block) =>
            !["startBlock", "endBlock"].includes(block.type) &&
            block.hooks[0].occupied &&
            block.id !== blockDroped.id
        );
        return blocks.some((block) => regex.test(block.code));
      } else {
        const indexParent = this.c.program.findIndex(
          (block) => block.id === blockDroped.parentId
        );
        if (indexParent < 0) return false;
        const children = this.c
          .getChildren(this.c.program[indexParent].id)
          .filter((child) => child.id !== id);
        const allDescendants = this.c.getAllDescendants(children, true);
        const blocks = allDescendants.map((child) => {
          const index = this.c.program.findIndex((prg) => prg.id === child.id);
          return this.c.program[index];
        });
        return blocks.some((block) => regex.test(block.code));
      }
    }
    return false;
  }

  getRemoveHeight(block, accum) {
    const {
      accumulativeHeight,
      type,
      blockProps: { h },
    } = block;
    let fullHeight = accum;
    fullHeight +=
      type !== "doWhileBlock"
        ? h + accumulativeHeight
        : h + accumulativeHeight - this.doWhileDefaultAccum;
    return fullHeight;
  }

  getRemoveInnerBlock(edgeId, from = 1) {
    const nodeEdges = this.c.graph.getNodeEdges(edgeId);
    for (let i = from; i < (nodeEdges && nodeEdges.length); i++) {
      if (nodeEdges[i]) {
        if (nodeEdges[i] === "empty") continue;
        const index = this.c.program.findIndex(
          (block) => block.id === nodeEdges[i]
        );
        if (index <= -1) continue;
        const block = this.c.program[index];
        this.innerBlocksToRemove[block.id] = block.id;
        this.getRemoveInnerBlock(block.id, 0);
      }
    }
    return;
  }

  removeInnerBlocks(removeBlocks, lessI) {
    for (let [value] of Object.entries(removeBlocks)) {
      let indexProgram = this.c.program.findIndex(
        (block) => block.id === value
      );
      this.c.program[indexProgram].remove();
      this.removeBlockFromState(value);
      this.c.graph.removeNode(value);
      lessI++;
    }
    return lessI;
  }

  removeBlockFromState(id) {
    try {
      this.c.blockState.remove(id);
    } catch (error) {
      console.error(error);
    }
  }

  replaceNodeEdgesOnRemove(idTopBlock, removeNodeId, isRemoved = true) {
    const nodeEdges = [...this.c.graph.getNodeEdges(removeNodeId)];
    const edges = [...this.c.graph.getNodeEdges(idTopBlock)];
    const length = edges.length;
    const edgesBottom = this.c.graph.getNodeEdges(nodeEdges[0]);
    let edgesToAdd = [];
    if (length === 1) {
      this.c.graph.removeEdge(idTopBlock, removeNodeId);
      this.c.graph.removeEdge(removeNodeId, nodeEdges[0]);
      edgesToAdd.push(nodeEdges[0]);
    } else if (length === 2) {
      const removedIdx = edges.findIndex((edge) => edge === removeNodeId);
      if (this.c.blockState.hasKey(nodeEdges[0])) {
        const lastHook = this.c.blockState.get(removeNodeId);
        this.c.blockState.update(nodeEdges[0], {
          arrowHook: lastHook.arrowHook,
        });
      }
      if (removedIdx == 1) {
        this.c.graph.removeEdge(idTopBlock, removeNodeId);
        if (nodeEdges.length > 0) {
          this.c.graph.removeEdge(removeNodeId, nodeEdges[0]);
          edgesToAdd.push(nodeEdges[0]);
        }
      } else {
        this.delReplacedEdgesOnRemove(idTopBlock, [removeNodeId, edges[1]]);
        edgesToAdd = [nodeEdges[0], edges[1]];
      }
    } else if (length === 3) {
      const removedIdx = edges.findIndex((edge) => edge === removeNodeId);
      if (this.c.blockState.hasKey(nodeEdges[0])) {
        const lastHook = this.c.blockState.get(removeNodeId);
        this.c.blockState.update(nodeEdges[0], {
          arrowHook: lastHook.arrowHook,
        });
      }
      if (removedIdx == 2) {
        this.delReplacedEdgesOnRemove(idTopBlock, [
          removeNodeId,
          edges[0],
          edges[2],
        ]);
        edgesToAdd.push(edges[0]);
        edgesToAdd.push(edges[1]);
        if (
          nodeEdges.length > 0 &&
          nodeEdges[0] !== null &&
          nodeEdges[0] !== undefined
        ) {
          this.c.graph.removeEdge(removeNodeId, nodeEdges[0]);
          edgesToAdd.push(nodeEdges[0]);
        } else {
          edgesToAdd.push("empty");
        }
      } else if (removedIdx == 1) {
        this.delReplacedEdgesOnRemove(idTopBlock, [
          removeNodeId,
          edges[0],
          edges[2],
        ]);
        edgesToAdd.push(edges[0]);
        if (
          nodeEdges.length > 0 &&
          nodeEdges[0] !== null &&
          nodeEdges[0] !== undefined
        ) {
          this.c.graph.removeEdge(removeNodeId, nodeEdges[0]);
          edgesToAdd.push(nodeEdges[0]);
        } else {
          edgesToAdd.push("empty");
        }
        edgesToAdd.push(edges[2]);
      } else {
        this.delReplacedEdgesOnRemove(idTopBlock, [
          removeNodeId,
          edges[1],
          edges[2],
        ]);
        edgesToAdd = [nodeEdges[0], edges[1], edges[2]];
      }
    }
    this.addReplacedEdgesOnRemove(idTopBlock, edgesToAdd);
    if (isRemoved) this.c.graph.removeNode(removeNodeId);
    if (nodeEdges.length > 0) {
      if (edgesBottom) this.c.graph.nodes.set(nodeEdges[0], edgesBottom);
    }
  }

  addReplacedEdgesOnRemove(id, edgesToAdd) {
    edgesToAdd.forEach((edge) => this.c.graph.addEdge(id, edge));
  }

  delReplacedEdgesOnRemove(id, edgesToDel) {
    edgesToDel.forEach((edge) => this.c.graph.removeEdge(id, edge));
  }

  deleteStateVars(block) {
    switch (this.c.languageOutput) {
      case "java":
        this.deleteJavaStateVars(block);
        break;
      case "javascript":
        this.deleteJavascriptStateVars(block);
        break;
    }
  }

  deleteJavaStateVars(block) {
    switch (block.type) {
      case "defineBlock":
        this.removeVariablesFromState(block);
        break;
      case "inputBlock":
        const inputsBlocks = this.c.program.filter(
          (prg) => prg.type === "inputBlock"
        );
        if (inputsBlocks.length <= 1) {
          block.delInstanceStatement("scanner");
          block.delImportStatement("import java.util.Scanner;\n");
        }
        if (block.radioOption === "defineVar" || block.userInputEnabled) {
          this.removeVariablesFromState(block);
        }
        break;
      case "codeBlock":
        if (block.isImport) {
          block.delImportStatement(
            `${block.imports[block.importValue - 1].value}\n`
          );
        }
        break;
      default:
        break;
    }
  }

  deleteJavascriptStateVars(block) {
    switch (block.type) {
      case "defineBlock":
        this.removeVariablesFromState(block);
        break;
      case "inputBlock":
        if (block.radioOption === "defineVar") {
          this.removeVariablesFromState(block);
        }
        break;
      default:
        break;
    }
  }

  removeVariablesFromState(block) {
    if (!block.parentId) {
      this.c.program[0].globalScope.remove(block.variableName);
    } else {
      const index = this.c.program.findIndex(
        (parentBlock) => parentBlock.id === block.parentId
      );
      const { type } = this.c.program[index];
      const { scopeProp } = this.c.program[index].getScopeProps(
        type,
        block.branch
      );
      this.c.program[index][scopeProp].remove(block.variableName);
    }
  }

  updateVariableState(blockDroped, isInFlow) {
    this.updateDefinedVarInFlow({ block: blockDroped, isInFlow });
    this.innerBlocks.forEach((innerBlock) => {
      this.updateDefinedVarInFlow({ block: innerBlock, isInFlow });
    });
  }

  updateDefinedVarInFlow({ block, isInFlow }) {
    const { type, code } = block;
    switch (type) {
      case "defineBlock":
        if (!Utils.isEmpty(code)) {
          this.updateVariablesFromState(block, isInFlow);
        }
        break;
      case "inputBlock":
        if (!Utils.isEmpty(code)) {
          if (block.radioOption === "defineVar") {
            this.updateVariablesFromState(block, isInFlow);
          }
        }
        break;
      case "forBlock":
        if (!Utils.isEmpty(code)) {
          if (block.radioVar === "defineVar") {
            this.updateVariablesFromState(block, isInFlow);
          }
        }
        break;
      default:
        break;
    }
  }

  updateVariablesFromState(block, isInFlow) {
    const { arrowType } = this.c.interceptedProgram;
    if (block.type === "forBlock" && block.radioVar === "defineVar") {
      const index = this.c.program.findIndex((prg) => prg.id === block.id);
      this.c.program[index].forScope.update(block.variableName, { isInFlow });
    } else if (!block.parentId) {
      if (arrowType === "out")
        this.c.program[0].globalScope.update(block.variableName, { isInFlow });
    } else {
      const index = this.c.program.findIndex(
        (parentBlock) => parentBlock.id === block.parentId
      );
      const { type } = this.c.program[index];
      const { scopeProp } = this.c.program[index].getScopeProps(
        type,
        block.blockProps.branch
      );
      this.c.program[index][scopeProp].update(block.variableName, { isInFlow });
    }
  }

  removeVarNameFromScopeOnSwap() {
    if (this.removeScopeVar) {
      const { index, scope, varName } = this.removeScopeVar;
      this.c.program[index][scope].remove(varName);
    }
    this.removeScopeVar = null;
  }

  showContextMenu(ev) {
    if (this.c.activeTour) return;
    ev.preventDefault();
    this.isEditing = false;
    const { x, y } = this.screenToWorld(ev.clientX, ev.clientY);
    if (ev.ctrlKey) {
      this.drag = false;
      this.ctrlKeyPressed = true;
      this.c.workspaceGrabed = false;
      this.drawSelectSquare(ev);
    } else {
      if (this.c.selectBlock) {
        if (
          this.c.selectBlock.isPointInRectangle(x, y) &&
          this.c.selectedTab != "1"
        ) {
          const selectContextMenu = new SelectContextMenu(this.c, "selection");
          selectContextMenu
            .filterMenu("edition", -1)
            .show(ev, { x, y, selection: this.c.selectBlock });
        } else {
          this.c.ungrabedUi();
          this.c.updateCanvas();
        }
      } else {
        let indexBlock = -1;
        this.c.program.forEach((program, index) => {
          if (program.type !== "startBlock" && program.type !== "endBlock") {
            if (program.isTouching(x, y)) {
              indexBlock = index;
            }
          }
        });
        if (indexBlock > -1) {
          this.isEditing = true;
          const selectContextMenu = new SelectContextMenu(this.c, "edition");
          selectContextMenu
            .filterMenu("selection", indexBlock)
            .show(ev, { x, y });
          this.c.ungrabedUi();
        } else {
          this.c.ungrabedUi();
          this.c.updateCanvas();
          const contextMenu = new ContextMenu(this.c, "workspace");
          contextMenu.filterMenu().show(ev, { x, y }).setContentConsoleText();
        }
      }
    }
  }

  drawSelectSquare(ev) {
    const { x, y } = this.screenToWorld(ev.clientX, ev.clientY);
    this.c.selectBlock = new SelectBlock(this.c, x, y);
    this.drag = true;
  }

  deleteBreakpoint(id) {
    const index = this.c.getBlockIndex(id);
    this.c.program[index].removeBreakpoint();
  }
}
