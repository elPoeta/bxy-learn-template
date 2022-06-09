class CanvasFlow {
  constructor(
    IDCanvasContainer,
    canvasElement,
    canvasInfoBoxElement,
    consoleInfoBoxElement,
    consoleElement,
    consolePromptElement,
    consoleBoxElement,
    xOffset,
    yOffset
  ) {
    this.createDependencies();
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.IDCanvasContainer = IDCanvasContainer;
    this.flowContainer = document.querySelector(`#${this.IDCanvasContainer}`);
    this.flowContainer.style.height = `${window.innerHeight}px`;
    this.canvasElement = canvasElement;
    this.canvasInfoBoxElement = canvasInfoBoxElement;
    this.consoleInfoBoxElement = consoleInfoBoxElement;
    this.consoleElement = consoleElement;
    this.consolePromptElement = consolePromptElement;
    this.consoleBoxElement = consoleBoxElement;
    this.widthBox = Number(this.flowContainer.offsetWidth);
    this.heightBox = Number(this.flowContainer.offsetHeight);
    console.log("#H> ", this.heightBox);
    this.flowConsoleContainer = document.querySelector("#flowConsole");
    this.collapseGrowConsole = document.querySelector("#collapseConsole");
    this.splitX = this.flowConsoleContainer.getBoundingClientRect().width - 6;
    this.splitY = this.splitX === 300 ? 245 : 125;
    this.initialValues();
    this.render();
    this.updateCanvas = this.update;
    this.selectingCanvas = this.selecting;
    this.resizeCanvas = this.resize;
    this.runCanvas = this.run;
    this.grabGhostV = false;
    this.grabGhostH = false;
    this.isOpenedConsole = false;
    this.activeTour = false;
    this.showAxis = false;
  }

  createDependencies() {
    this.graph = new Graph();
    this.blockState = new BlockState();
    this.saveFlowchartCodeToFile = new SaveFlowchartCodeToFile();
  }

  initialValues() {
    this.tabs = [];
    this.selectedTab = 0;
    this.xScroll = 0;
    this.yScroll = 0;
    this.yScrollPalette = 0;
    this.scale = 1;
    this.scaleFactor = 0.01;
    this.grabSplit = false;
    this.isResize = false;
    this.interceptedProgram = null;
    this.workspaceGrabed = false;
    this.arrowDistance = 70;
    this.defaultAccumulator = 130;
    this.widthLine = 60;
    this.languageOutput = "java";
    this.flowchartName = "Flowchart";
    this.pathClass = "domain.Flowchart";
    this.packageToImport = "package domain;";
    this.mdDescriptionContent = "";
    this.projectName = null;
    this.showRemoveDialogBox = false;
    this.editor = null;
    this.editorErrors = null;
    this.selectBlock = null;
    this.out = "";
    this.outs = [];
    this.ctxLineWidth = 3;
    this.colors = {
      ligthBlue: "#2393d8d6",
      red: "#ff2323bf",
      background: "#FDF6E3",
    };
    this.paletteColor = this.colors.ligthBlue;
    this.scopeType = {
      GLOBAL_SCOPE: "Global scope",
      FOR_SCOPE: "For scope",
      WHILE_SCOPE: "While scope",
      DO_WHILE_SCOPE: "Do While scope",
      IF_SCOPE_RIGHT: "If branch right scope",
      IF_SCOPE_LEFT: "If branch left scope",
    };
    this.startBlockId = "start-id";
    this.endBlockId = "end-id";
    this.projectCompositeId = null;
    this.fullCode = "";
    this.globalBreakpoint = {};
    this.breakpointRows = {};
    this.editorRows = {};
    this.renderCogwheel = true;
    this.isRunningTest = false;
    this.expanded = false;
    this.pauseRenderX = false;
    this.markAsUnsaved = false;
    this.wizardItems = [];
    this.mainPalette = {
      io: ["define", "code", "input", "output"],
      loop: ["while", "doWhile", "for"],
      decision: ["if"],
      wrap: ["wrap"],
    };
  }

  render() {
    this.initCanvas();
    this.initTooltip();
    this.initConsoleCanvas();
    this.initUI();
    this.initLog();
    this.addCanvasListener();
    this.initTabs();
    this.flowchartStore = new FlowchartStore(this);
    this.undoRedoAPI = new FlowAPI(this);
    this.undoRedoManager = new UndoRedoManager(this);
    this.copyPaste = new CopyPasteBlocks(this);
    this.expandShrink = new ExpandShrink(this);
  }

  addCanvasListener() {
    window.addEventListener("resize", () => {
      this.flowContainer.style.height = `${window.innerHeight}px`;
      this.resize();
    });
    this.eventHandler = new EventHandler(this);
    window.document.addEventListener("mousemove", (event) => {
      const mouseX = event.clientX - this.xOffset;
      const mouseY = event.clientY - this.yOffset;
      if (this.grabSplit) {
        this.setConsoleState();
        flowChartEditor.hideConsole();
        if (this.grabGhostV) {
          this.selecting(false);
          this.moveVerticalGhostBar(mouseX);
        }
        if (this.grabGhostH) {
          if (event.target && event.target.style)
            event.target.style.cursor = "grabbing";
          this.selecting(false);
          this.moveHorizontalGhostBar(mouseY);
        }
      }
    });
    window.document.addEventListener("mouseup", () => {
      this.grabSplit = false;
      this.removeGhostBar();
      this.ungrabedBlocks();
    });
    this.collapseGrowConsole.addEventListener(
      "click",
      this.handleCollapseGrowConsole.bind(this)
    );
  }

  handleCollapseGrowConsole(ev) {
    const isCollapsed = this.collapseGrowConsole.getAttribute("data-collapsed");
    this.setConsoleState();
    flowChartEditor.hideConsole();
    if (isCollapsed === "true") {
      const actualWidth = +document.querySelector(`#${this.IDCanvasContainer}`)
        .offsetWidth;
      const actualHeight = +document.querySelector(`#${this.IDCanvasContainer}`)
        .offsetHeight;
      this.flowConsoleContainer.style.height = `${actualHeight - 45}px`;
      this.flowConsoleContainer.style.width = `${this.splitX}px`;
      this.flowInfoConsoleState({
        classType: "remove",
        rotate: "rotate(0deg)",
        state: false,
        title: "Hide",
      });
    } else {
      document.querySelector("#flowConsole").style.width = "40px";
      document.querySelector("#flowConsole").style.height = "25px";
      this.flowInfoConsoleState({
        classType: "add",
        rotate: "rotate(180deg)",
        state: true,
        title: "Show",
      });
    }
    this.renderConsoleByState();
  }

  flowInfoConsoleState(props) {
    const { classType, rotate, state, title } = props;
    document.querySelector("#consoleTitle").classList[classType]("hide");
    this.collapseGrowConsole.style.transform = rotate;
    this.collapseGrowConsole.setAttribute("data-collapsed", state);
    this.collapseGrowConsole.firstElementChild.innerHTML = title;
  }

  initCanvas() {
    this.canvas = document.querySelector(`#${this.canvasElement}`);
    this.canvas.width = this.widthBox;
    this.canvas.height = this.heightBox;
    this.workSpaceWidth = this.canvas.width;
    this.workSpaceHeight = this.canvas.height;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: false });
    this.tour = new Tour(this);
    this.setBackgroundColor(this.colors.background);
  }

  initConsoleCanvas() {
    this.canvasInfoBox = document.querySelector(
      `#${this.canvasInfoBoxElement}`
    );
  }

  writeConsole(text, id) {
    const consoleElement = document.querySelector(`#${id}`);
    consoleElement.insertAdjacentHTML("beforeend", text);
  }

  clearConsole(id) {
    document.querySelector(`#${id}`).innerHTML = "";
  }

  initTooltip() {
    this.tip = document.querySelector("#tip");
    this.ctxTip = tip.getContext("2d");
  }

  setBackgroundColor(color) {
    this.canvas.style.background = color;
  }

  setConsoleState() {
    this.isOpenedConsole = this.isOpenedConsole
      ? this.isOpenedConsole
      : flowChartEditor.getConsoleState();
  }

  getConsoleState() {
    return this.isOpenedConsole;
  }

  renderConsoleByState() {
    if (!this.getConsoleState()) return;
    setTimeout(() => {
      flowChartEditor.showConsole();
      this.isOpenedConsole = false;
    }, 800);
  }

  initUI(palette) {
    this.paletteManager = new PaletteManager(this);
    const jsonPalette = palette || this.paletteManager.getAllBlocks();
    this.generateNewPalette(jsonPalette);
    this.newFlowChart();
  }

  generateNewPalette(palette) {
    if (this.selectedTab === 1) palette = { wrap: ["wrap"] };
    this.paletteManager.createPalette(palette);
    this.palette = this.paletteManager.getPalette();
    if (this.selectedTab === 0) this.mainPalette = palette;
  }

  newFlowChart() {
    this.program = [
      BlockFactory.getImplementation(
        this.startBlockId,
        this,
        "startBlock",
        this.ctx.canvas.width / 2,
        20,
        120,
        60,
        `Start flowchart | OutPut code ${this.languageOutput}`,
        false,
        ""
      ),
      BlockFactory.getImplementation(
        this.endBlockId,
        this,
        "endBlock",
        this.ctx.canvas.width / 2,
        150,
        120,
        60,
        `End flowchart | OutPut code ${this.languageOutput}`,
        false,
        ""
      ),
    ];
    this.graph.addNode(this.startBlockId);
    this.graph.addNode(this.endBlockId);
    this.graph.addEdge(this.startBlockId, this.endBlockId);
    this.blockState.add(this.startBlockId, {
      type: "startBlock",
      parentId: null,
      indexArrowHook: 0,
      x: this.program[0].x,
      y: this.program[0].y,
      h: this.program[0].blockProps.h,
      w: this.program[0].blockProps.w,
      outHook: this.program[0].hooks[0].y,
      heightToAdd: 70,
      render: true,
    });
    this.blockState.add(this.endBlockId, {
      type: "endBlock",
      parentId: null,
      x: this.program[1].x,
      y: this.program[1].y,
      h: this.program[1].blockProps.h,
      w: this.program[1].blockProps.w,
      heightToAdd: 70,
      render: true,
      lastHook: "start-id",
      indexArrowHook: 0,
    });
  }

  resetToLoad(isClosedProject = false) {
    //if (!isClosedProject && !browxyStartUp.debugProject.debugToolbar)
    flowChartEditor.hideConsole();
    this.workspaceGrabed = false;
    this.isResize = false;
    this.ctxLineWidth = 3;
    this.widthLine = 60;
    this.editorErrors = null;
    this.expanded = false;
    this.fullCode = "";
    this.eventHandler.setupValues();
    this.program = [];
    this.graph.clear();
    this.blockState.clear();
  }

  newCanvasBlock(isClosedProject = false, isUndoRedo = false) {
    this.resetToLoad(isClosedProject);
    this.clearConsole("flowchartIdeEditor");
    this.newFlowChart();
    this.update();
    if (!isUndoRedo) this.undoRedoManager = new UndoRedoManager(this);
    this.undoRedoAPI = new FlowAPI(this);
    flowChartEditor.API = new FlowAPI(this);
  }

  initLog() {
    this.log = console.log;
    this.log = (text, id) => {
      this.writeConsole(text, id);
    };
  }

  setExpanded() {
    this.expanded = !this.expanded;
  }

  expandShrinkBlocks() {
    this.setExpanded();
    this.expandShrink.start();
    this.update();
  }

  markFlowchartAsSavedUnsaved(isUnSaved) {
    const color = isUnSaved ? "#d11313" : "#2393d8";
    this.markAsUnsaved = isUnSaved;
    document.querySelector(".flow-console").style.border = `3px solid ${color}`;
    if (isUnSaved && !document.querySelector("#unsaveFlowInfo")) {
      this.log(this.getUnsavedTemplate(), "logFlowOutput");
      this.addUnsaveListener();
    }
    if (!isUnSaved && document.querySelector("#unsaveFlowInfo")) {
      this.removeUnsaveListener();
      document.querySelector("#unsaveFlowInfo").remove();
    }
  }

  addUnsaveListener() {
    this.saveUnsavedBtn = document.querySelector("#toggleSaveFlow");
    this.saveUnsavedBtn.addEventListener(
      "change",
      this.saveUnsaveHandler.bind(this)
    );
  }

  saveUnsaveHandler(ev) {
    this.flowchartStore.saveBlocksToFile(this.tabs[this.selectedTab].id);
    if (!this.projectCompositeId) {
      ev.target.checked = false;
    } else {
      ev.target.setAttribute("disabled", true);
      setTimeout(() => {
        this.markFlowchartAsSavedUnsaved(false);
      }, 1500);
    }
  }

  removeUnsaveListener() {
    if (!document.querySelector("#toggleSaveFlow")) return;
    this.saveUnsavedBtn.removeEventListener(
      "change",
      this.saveUnsaveHandler.bind(this)
    );
  }
  getUnsavedTemplate() {
    return `<div id="unsaveFlowInfo" style="display:grid;grid-template-columns: repeat(3,1fr);align-items:center;margin-top:5px;justify-content:center;">
         <span style='color:red;font-weight:bold;font-size:1em;justify-self:end;'>unsaved&nbsp;&nbsp;</span>
         <label class="toggle-unsaved toggle-cross-floppy">
           <input type="checkbox" id="toggleSaveFlow" name="toggleSaveFlow" class="toggle-checkbox-unsaved">
           <div class="toggle-btn-unsaved"></div>
         </label>
         <span style='color:green;font-weight:bold;font-size:1em;justify-self:start;'>&nbsp;&nbsp;saved</span>
         <span style="grid-column:2/2;justify-self:center;margin-top: 10px;font-size:.8em;">click cross to save</span>
       </div>`;
  }

  createNewProgram(type, x, y, w, h, code = "", wrapType) {
    this.program.push(
      BlockFactory.getImplementation(
        flowChartEditor.uuid(),
        this,
        type,
        x,
        y,
        w,
        h,
        code,
        true,
        this.languageOutput,
        wrapType
      )
    );
  }

  generateChild() {
    const blocks = this.program.map((block) => block);
    return blocks.reduce((acc, block, ind, array) => {
      const childs = [];
      array.forEach((el, i) => {
        if (childs.includes(el.parentId) || el.parentId === block.id) {
          childs.push({
            id: el.id,
            type: el.type,
            props: el.blockProps,
            accumulativeHeight: el.accumulativeHeight,
            lastDimension: el.lastDimension,
          });
        }
      });
      return acc.concat({
        ...{
          id: block.id,
          parentId: block.parentId,
          type: block.type,
          props: block.blockProps,
          accumulativeHeight: block.accumulativeHeight,
          lastDimension: block.lastDimension,
        },
        childs,
      });
    }, []);
  }

  getChildren(id) {
    const blocks = this.generateChild();
    const index = blocks.findIndex((block) => block.id === id);
    return index > -1 ? blocks[index].childs : [];
  }

  getSortedChildren(id, branch) {
    const index = this.getBlockIndex(id);
    if (index < 0) return [];
    const { type } = this.program[index];
    const indexNode = branch === "NO" && type === "ifBlock" ? 2 : 1;
    let pathArr = [];
    const nodes = this.graph.getNodeEdges(id);
    if (!nodes) return [];
    if (["doWhileBlock", "forBlock", "whileBlock", "ifBlock"].includes(type)) {
      if (nodes.length > 1) {
        pathArr = this.getPath(nodes[indexNode], [nodes[indexNode]]);
        pathArr = this.getChildren(id)
          .map((child) => {
            const pos = pathArr.findIndex((p) => p === child.id);
            return { ...child, pos };
          })
          .filter((child) => child.pos !== -1);
      }
    }
    return pathArr.sort((a, b) => (a.pos > b.pos ? 1 : -1));
  }

  getPath(node, path) {
    const nodes = this.graph.getNodeEdges(node);
    if (nodes && nodes[0] !== undefined && nodes[0] !== null) {
      path.push(nodes[0]);
      this.getPath(nodes[0], path);
    }
    return path;
  }

  getAllDescendants(children, includeAll = false) {
    let all = children.length > 0 ? [...children] : [];
    const getDescendants = (children) => {
      for (let i = 0; i < children.length; i++) {
        let childs = !includeAll
          ? this.getChildren(children[i].id).filter((child) =>
              ["whileBlock", "doWhileBlock", "forBlock", "ifBlock"].includes(
                child.type
              )
            )
          : this.getChildren(children[i].id);
        getDescendants(childs);
        if (childs.length > 0) all = [...all, ...childs];
      }
    };
    getDescendants(children);
    return all;
  }

  getBlockIndex(id) {
    return this.program.findIndex((block) => block.id === id);
  }

  getMaxWidth(children) {
    const maxWidthBlock =
      children.length > 0
        ? children.reduce(
            (max, child) =>
              child.lastDimension.w > max ? child.lastDimension.w : max,
            children[0].lastDimension.w
          )
        : 0;
    const childIndex =
      children.length > 0
        ? children.reduce(
            (maxIdx, child, index) =>
              child.lastDimension.w > children[maxIdx].lastDimension.w
                ? index
                : maxIdx,
            0
          )
        : -1;
    return { maxWidthBlock, childIndex };
  }

  update(calc = true) {
    this.resizeWorkSpace();
    this.updateRenderWorkspace();
    this.updateRenderPalette();
    this.updateRenderProgram();
    this.updateRenderSelectBlock();
    this.updateRenderTour();
    this.resizeWorkSpace();
    this.calculateBranchLeftLimit(calc);
    this.zoomLevelInfo();
  }

  updateRenderWorkspace() {
    this.ctx.lineWidth = 3;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.setTransform(
      this.scale,
      0,
      0,
      this.scale,
      this.xScroll,
      this.yScroll
    );
    this.drawAxisLimit();
    this.ctx.lineWidth = this.ctxLineWidth;
    for (let i = 0; i < this.program.length; i++) {
      if (!this.program[i].grabed) {
        this.program[i].render();
      }
    }
    this.ctx.restore();
  }

  drawAxisLimit() {
    if (!this.showAxis) return;
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#ccc";
    this.ctx.moveTo(200, 0);
    this.ctx.lineTo(200, 0);
    this.ctx.lineTo(200, this.workSpaceHeight);
    this.ctx.lineTo(210, this.workSpaceHeight - 10);
    this.ctx.moveTo(200, this.workSpaceHeight);
    this.ctx.lineTo(190, this.workSpaceHeight - 10);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.moveTo(200, 0);
    this.ctx.lineTo(200, 0);
    this.ctx.lineTo(this.workSpaceWidth, 0);
    this.ctx.lineTo(this.workSpaceWidth - 10, 10);
    this.ctx.moveTo(this.workSpaceWidth, 0);
    this.ctx.lineTo(this.workSpaceWidth - 10, -10);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  updateRenderPalette() {
    this.ctx.fillStyle = this.paletteColor;
    this.ctx.fillRect(0, 0, 200, this.canvas.height);
    this.ctx.lineWidth = 3;
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, this.yScrollPalette);
    if (this.paletteManager.isReadyToRender()) {
      this.removeLoadingPalleteSpinner();
      for (let i = 0; i < this.palette.length; i++) {
        this.palette[i].render();
      }
    }
    this.ctx.restore();
  }

  updateRenderProgram() {
    this.ctx.save();
    this.ctx.setTransform(
      this.scale,
      0,
      0,
      this.scale,
      this.xScroll,
      this.yScroll
    );
    this.ctx.lineWidth = this.ctxLineWidth;
    for (let i = 0; i < this.program.length; i++) {
      if (this.program[i].grabed) {
        this.program[i].render();
      }
    }
    this.ctx.restore();
  }

  updateRenderSelectBlock() {
    if (this.selectBlock) {
      this.ctx.save();
      this.ctx.setTransform(
        this.scale,
        0,
        0,
        this.scale,
        this.xScroll,
        this.yScroll
      );
      this.selectBlock.render();
      this.ctx.restore();
    }
  }

  updateRenderTour() {
    if (this.activeTour) {
      this.ctx.save();
      this.ctx.setTransform(
        this.scale,
        0,
        0,
        this.scale,
        this.xScroll,
        this.yScroll
      );
      this.tour.renderByStep();
      this.ctx.restore();
    }
  }

  zoomLevelInfo() {
    document.querySelector(
      "#zoom-level-info-value"
    ).innerHTML = `${this.scale.toFixed(2)}x`;
  }

  moveVerticalGhostBar(mouseX) {
    this.grabGhostV = true;
    const actualWidth = +document.querySelector(`#${this.IDCanvasContainer}`)
      .offsetWidth;
    this.splitX = actualWidth - mouseX;
    if (this.splitX < 10) this.splitX = 10;
    if (this.splitX > actualWidth - 100) this.splitX = actualWidth - 100;
    document.getElementById("ghostCanvasV").style.right = this.splitX + "px";
  }

  moveHorizontalGhostBar(mouseY) {
    this.splitY = mouseY - 30;
    const actualHeight = +document.querySelector(`#${this.IDCanvasContainer}`)
      .offsetHeight;
    if (this.splitY < 90) this.splitY = 90;
    if (this.splitY > actualHeight - 20) this.splitY = actualHeight - 20;
    document.getElementById("ghostCanvasH").style.top = this.splitY + "px";
  }

  removeGhostBar() {
    if (this.grabGhostV) {
      this.grabGhostV = false;
      this.selecting(true);
      document.getElementById("ghostCanvasV").remove();
      this.resize();
    }
    if (this.grabGhostH) {
      this.grabGhostH = false;
      this.selecting(true);
      document.querySelector("#console").style.cursor = "auto";
      document.querySelector("#console").style.cursor = "auto";
      document.getElementById("ghostCanvasH").remove();
      this.resize();
    }
    this.renderConsoleByState();
  }

  resize() {
    const actualWidth = +document.querySelector(`#${this.IDCanvasContainer}`)
      .offsetWidth;
    const actualHeight = +document.querySelector(`#${this.IDCanvasContainer}`)
      .offsetHeight;
    console.log("actualHeight", actualHeight);
    this.flowConsoleContainer.style.height = `${actualHeight - 45}px`;
    this.flowConsoleContainer.style.width = `${this.splitX}px`;
    document.querySelector(".drag-console-bar-v").style.height = `${
      actualHeight - 45
    }px`;
    this.canvas.width = actualWidth - this.xOffset;
    this.canvas.height = actualHeight - this.yOffset;
    //const h = document.querySelector('.consolePromptContainer').offsetHeight + 35;
    this.canvasInfoBox.style.height = this.splitY - 85 + "px";
    document.querySelector(`#${this.consoleBoxElement}`).style.height =
      actualHeight -
      +document
        .querySelector(`#${this.canvasInfoBoxElement}`)
        .style.height.replace("px", "") -
      8 -
      4 -
      this.yOffset +
      "px";
    this.update();
  }

  resizeWorkSpace() {
    this.maxBlockWidth = {
      block: this.program[0],
      dim: this.program[0].lastDimension.w,
      branchL: this.program[0].lastDimension.w / 2,
    };
    let maxy = 0;
    let maxx = 0;
    this.program.forEach((block) => {
      const {
        y,
        h,
        type,
        outHookIndex: { out },
        lastDimension,
      } = block;
      if (out > -1 && block.hooks[out].ioType === "out") {
        if (type === "ifBlock") {
          const fullDim = lastDimension.w;
          const branchL = block.branchDimension.l;
          this.maxBlockWidth =
            maxx < fullDim
              ? { block, dim: fullDim, branchL }
              : this.maxBlockWidth;
          maxx = maxx < fullDim ? fullDim : maxx;
        } else {
          this.maxBlockWidth =
            maxx < lastDimension.w
              ? { block, dim: lastDimension.w, branchL: lastDimension.w / 2 }
              : this.maxBlockWidth;
          maxx = maxx < lastDimension.w ? lastDimension.w : maxx;
        }
      }
      if (y + h > maxy - 200) {
        maxy = y + h + 200;
      }
    });

    if (this.canvas.width <= maxx) {
      let sub = maxx - this.canvas.width;
      sub = sub <= 200 ? sub + (200 - sub) : 200;
      sub = this.canvas.width == maxx ? sub + 150 : sub;
      this.workSpaceWidth = maxx + sub;
    } else {
      this.workSpaceWidth = this.canvas.width;
    }

    if (this.canvas.height < maxy) {
      this.workSpaceHeight = maxy;
    } else {
      this.workSpaceHeight = this.canvas.height;
    }
  }

  calculateBranchLeftLimit(calc) {
    if (calc) {
      this.branchLimitLeft = { maxx: 0, move: 0 };
      const branchL = this.maxBlockWidth.branchL;
      let diff = this.program[0].x - branchL - 200;
      if (diff <= 0) {
        const add = Math.abs(diff) + 200;
        this.branchLimitLeft = { maxx: add, move: Math.abs(diff) };
      } else if (diff <= 100) {
        const z = 200 - diff;
        this.branchLimitLeft = { maxx: z, move: Math.abs(diff) };
      }
      this.centerBlocks();
    }
  }

  ungrabedBlocks() {
    if (!this.selectBlock) {
      this.program = this.program.map((block) => {
        block.grabed = false;
        block.selected = false;
        return block;
      });
      this.ungrabedUi();
      this.update();
    }
  }

  ungrabedUi() {
    this.workspaceGrabed = false;
    this.selectBlock = null;
  }

  centerStartBlock() {
    const xPoint = this.ctx.canvas.width / 2;
    const startPoint = this.program[0].x;
    if (startPoint > xPoint) {
      this.xScroll -= startPoint - xPoint;
      this.yScroll = 0;
      this.update();
    }
  }

  centerBlocks(isZooming = false) {
    const widthBeforeUpdate = this.workSpaceWidth;
    this.update(false);
    if (
      widthBeforeUpdate === this.workSpaceWidth &&
      !isZooming &&
      this.branchLimitLeft.move === 0
    )
      return;
    if (this.branchLimitLeft.move > 0) {
      this.program = this.program.map((block) => {
        const blockState = this.blockState.get(block.id);
        if (blockState !== null) {
          block.x += this.branchLimitLeft.move;
          block.move(block.x, block.y);
          this.blockState.update(block.id, { x: block.x, y: block.y });
        }
        return block;
      });
      this.update();
    }
  }

  selecting(state) {
    if (!state) {
      document.getElementById("selecting").innerHTML =
        "body{-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;}";
    } else {
      document.getElementById("selecting").innerHTML = "";
    }
  }

  interpreter(isHighlight = false) {
    const runType = Utils.isEmpty(this.globalBreakpoint)
      ? "highlightBlock"
      : "breakpoint";
    const isMarkAsUnsavedBeforeRun = this.markAsUnsaved;
    this.outs = [];
    this.importsStateCollection = new BlockState();
    this.currentTab = 0;
    this.countHighlightLines = 1;
    const tabBeforeRun = this.selectedTab;
    this.clearCompileErrors();
    try {
      this.tabs.forEach((tab, index) => {
        if (tab.type !== "f_repo") {
          this.currentTab = index;
          this.loadTabByIndex(index);
          this.collectImportsState();
          const node = this.getFirstNode();
          const troncalNodes = [node];
          this.getTroncalNodes(node, troncalNodes);
          const generateCode = new GenerateCode(
            this,
            troncalNodes,
            isHighlight,
            runType,
            this.countHighlightLines
          );
          generateCode.visitNodes();
          this.countHighlightLines = generateCode.countHighlightLines;
          this.outs.push({
            tabId: tab.id,
            code: generateCode.output,
            fakeOutput: generateCode.fakeOutput,
          });
        }
      });
    } catch (e) {
      console.error(e.message);
      this.log(
        `<div style='color: red; margin-top: 5px;'>${e.message}</div>`,
        "logFlowOutput"
      );
      return [];
    } finally {
      this.isRunningTest = false;
    }
    this.openAndLoadTabByIndex(tabBeforeRun, false);
    this.markFlowchartAsSavedUnsaved(isMarkAsUnsavedBeforeRun);
    return this.outs;
  }

  setBreakpointsEditorRows() {
    if (this.languageOutput !== "javascript") return;
    let code = this.interpreter(true);
    code = this.getJavasciptTemplate(code);
    code = this.getBeautifyCode(code).replace(/\n\s*\n/g, "\n");
    const jsInterpreter = new ParseJsInterpreter(new AstJsVisitor());
    const body = acorn.parse(code, {
      ecmaVersion: 5,
      preserveParens: true,
      locations: true,
    }).body;
    jsInterpreter.interpret(body);
    this.breakpointRows = jsInterpreter.getEditorLocationRows();
  }

  clearCompileErrors() {
    this.editorErrors = null;
    this.program.forEach((block) => block.clearCompileError());
    this.tabs = this.tabs.map((tab) => {
      const { id, api } = tab;
      api.program[id].blocks = api.program[id].blocks.map((block) => {
        delete block.compileError;
        return block;
      });
      tab.api = api;
      tab.hasError = false;
      return tab;
    });
  }

  collectImportsState() {
    const scanState = this.program[0].importsAndInstancesState.get("scanner");
    if (scanState !== null) {
      this.importsStateCollection.update("scanner", {
        name: "scanner",
        value: "new Scanner(System.in)",
        declaration: "Scanner",
        declarationType: "Class",
        used: false,
      });
    }
    const importsState = this.importsStateCollection.get("import");
    const actualTabImport =
      this.program[0].importsAndInstancesState.get("import");
    if (actualTabImport) {
      actualTabImport.value.forEach((val) => {
        const value = !importsState
          ? new Set([val])
          : new Set([...importsState.value, val]);
        this.importsStateCollection.update("import", {
          name: "import",
          value,
          declarationType: "import",
        });
      });
    }
  }

  getTroncalNodes(node, troncalNodes) {
    const edges = this.graph.getNodeEdges(node);
    if (edges === null || edges.length < 1) return;
    troncalNodes.push(edges[0]);
    this.getTroncalNodes(edges[0], troncalNodes);
  }

  getFirstNode() {
    const edge = this.graph.getNodeEdges(this.startBlockId)[0];
    if (this.isRunningTest) return edge;
    return edge;
  }

  getErrorCompiler(result) {
    if (!this.editor) return;
    if (result.compilationErrors != null) {
      const errors = Object.entries(result.compilationErrors)[0][1];
      this.editorErrors = errors;
      this.setAndShowEditorAnnotations(errors);
      const errorRows = this.getCompilerCodeError(errors);
      this.setCompilerBlockError(errorRows);
    } else {
      console.error("unparsed errors ", result.unparsedErrorResult);
    }
  }

  setAndShowEditorAnnotations(annotations) {
    this.editor.session.setAnnotations(annotations);
  }

  getCompilerCodeError(errors) {
    const errorMap = new Map();
    errors.forEach((error) => {
      const { row, text } = error;
      if (errorMap.has(row)) {
        const values = errorMap.get(row);
        const newValues = { ...values, errors: [...values.errors, text] };
        errorMap.set(row, newValues);
      } else {
        const { id, tabIndex } = this.javaEditorLines.rows[row] || {
          id: null,
          tabIndex: null,
        };
        if (id) errorMap.set(row, { id, tabIndex, errors: [text] });
      }
    });
    return [...errorMap];
  }

  setCompilerBlockError(errorRows) {
    this.currentTab = 0;
    const tabBeforeRun = this.selectedTab;
    this.tabs.forEach((tab, index) => {
      this.currentTab = index;
      this.loadTabByIndex(index);
      errorRows.forEach((errorRow) => {
        const [row, values] = errorRow;
        const { id, tabIndex, errors } = values;
        this.setFlowErrors({ id, tabIndex, errors });
      });
    });
    this.openAndLoadTabByIndex(tabBeforeRun, false);
  }

  setFlowErrors({ id, tabIndex, errors }) {
    const index = this.getBlockIndex(id);
    if (index < 0) return false;
    this.tabs[this.selectedTab].isOpened = true;
    this.tabs[this.selectedTab].hasError = true;
    this.program[index].compileError = {
      hasError: true,
      errorMessages: errors,
    };
  }

  run(fromServer, command = "") {
    let doNotUseThisName = null;
    try {
      if (!command.length) {
        if (document.querySelector(`#${this.IDCanvasContainer}`)) {
          this.clearConsole("flowchartIdeEditor");
          this.clearConsole("logFlowOutput");
        }
        this.logDescription();
        this.setBreakpointsEditorRows();
        doNotUseThisName = this.interpreter(
          !Utils.isEmpty(this.globalBreakpoint)
        );
      } else {
        doNotUseThisName = command;
      }
      const executeCommand = (() => {
        if (!command.length) {
          this.languageToRun(doNotUseThisName, fromServer);
        } else {
          if (doNotUseThisName.toLowerCase() === "--run") {
            this.run(true);
          } else if (doNotUseThisName.toLowerCase() === "--help") {
            const helpTemplate = `<h2 style='margin: 5px 0;'># HELP</h2>
                  <hr/>
                  <h3 style='margin: 5px 0;'>Help: <span style='color: #b42c2c'>--help</span></h3>
                  <h3 style='margin: 5px 0;'>New flowchart: <span style='color: #b42c2c'>--new</span></h3>
                  <h3 style='margin: 5px 0;'>Run program: <span style='color: #b42c2c'>--run</span></h3>
                  <h3 style='margin: 5px 0;'>Save flowchart: <span style='color: #b42c2c'>--save</span></h3>
                  <h3 style='margin: 5px 0;'>View Description: <span style='color: #b42c2c'>--desc</span></h3>
                  <h3 style='margin: 5px 0;'>Force reload description: <span style='color: #b42c2c'>--rld-desc</span></h3>
                  <h3 style='margin: 5px 0;'>Clear output console: <span style='color: #b42c2c'>--clear</span></h3>
                  <h3 style='margin: 5px 0;'>Report flow bugs: <span style='color: #b42c2c'>--report-bug</span></h3>
                  <h3 style='margin: 5px 0;'>Clear scope console: <span style='color: #b42c2c'>--clear-scope</span></h3>
                  <h3 style='margin: 5px 0;'>Filter scope: <span style='color: #b42c2c'>?step=1,2,16 | to show all ?step=0</span></h3>
                  <h3 style='margin: 5px 0;'>Take screenshot: <span style='color: #b42c2c'>--screenshot</span></h3>
                  <h3 style='margin: 5px 0;'>Send task to course: <span style='color: #b42c2c'>--send</span></h3>`;
            this.log(helpTemplate, "logFlowOutput");
          } else if (doNotUseThisName.toLowerCase() === "--new") {
            flowChartEditor.settingsHandler();
          } else if (doNotUseThisName.toLowerCase() === "--clear") {
            this.clearConsole("logFlowOutput");
          } else if (doNotUseThisName.toLowerCase() === "--clear-scope") {
            this.clearConsole("scope");
          } else if (doNotUseThisName.toLowerCase() === "--save") {
            this.flowchartStore.saveBlocksToFile(
              this.tabs[this.selectedTab].id
            );
          } else if (doNotUseThisName.toLowerCase() === "--desc") {
            this.logDescription();
          } else if (doNotUseThisName.toLowerCase() === "--rld-desc") {
            if (!this.projectCompositeId) return;
            flowChartEditor.checkMDFile(this.projectCompositeId, true);
          } else if (
            /\?step=(,?[\d*\,?\d])+$/.test(
              doNotUseThisName
                .toLowerCase()
                .replace(/ +?/g, "")
                .replace(/,\s*$/, "")
            )
          ) {
            this.filterStep(
              doNotUseThisName
                .toLowerCase()
                .replace(/ +?/g, "")
                .replace(/,\s*$/, "")
            );
          } else if (doNotUseThisName.toLowerCase().includes("--test-dev")) {
            TEST_DEV_FLOWS.runTestsFlowChart(doNotUseThisName.toLowerCase());
            this.update();
          } else if (doNotUseThisName.toLowerCase() === "--report-bug") {
            new ReportBugFlow(this).show();
          } else if (doNotUseThisName.toLowerCase() === "--screenshot") {
            new Screenshot(this).showForm();
          } else if (doNotUseThisName.toLowerCase() === "--export") {
            flowChartEditor.API.downloadJSONFile();
          } else if (doNotUseThisName.toLowerCase() === "--send") {
            if (!this.projectCompositeId) {
              this.log(
                "<div style='color: #b42c2c'>This project does not belong to any course<div>",
                "logFlowOutput"
              );
              return;
            }
            // browxyStartUp.customTree.submitToCourse(
            //   this.projectCompositeId,
            //   false
            // );
          } else if (doNotUseThisName.toLowerCase() === "--axis") {
            this.showAxis = !this.showAxis;
            this.update();
          } else if (doNotUseThisName.toLowerCase() === "--cogwheel") {
            this.renderCogwheel = !this.renderCogwheel;
            this.update();
          } else {
            this.log(
              `<p style="color: blue; font-style: italic;">${doNotUseThisName}</p>`,
              "logFlowOutput"
            );
            this.log(`<p>${eval(doNotUseThisName)}</p>`, "logFlowOutput");
          }
        }
      })();
    } catch (e) {
      if (e.message == "Unexpected token )") {
        this.log(
          "<div style='color: #b42c2c'>Invalid condition in if, while or do while block!<div>",
          "logFlowOutput"
        );
      } else if (e.message.search("is not defined") != -1) {
        this.log(
          "<div style='color: #b42c2c'>Variable " + e.message + "!</div>",
          "logFlowOutput"
        );
      } else if (
        e.message == "Unexpected end of input" ||
        e.message == "Cannot read property 'charAt' of undefined"
      ) {
        this.log(
          "<div style='color: #b42c2c'>Invalid code! Please make sure that all blocks are connected correctly.</div>",
          "logFlowOutput"
        );
      } else {
        this.log(
          "<div style='color: #b42c2c'>" + e.message + "</div>",
          "logFlowOutput"
        );
      }
    }
  }

  runTests() {
    if (!this.hasProjectId("To execute tests you must run program first"))
      return;
    this.isRunningTest = true;
    const output = this.interpreter(false);
    this.isRunningTest = false;
    const { beautyCode } = this.getCodeBeautyAndRender(
      output,
      "getCode",
      "innerFlowchartIdeEditor",
      "editor"
    );
    const { beautyCode: fakeCode } = this.getCodeBeautyAndRender(
      output,
      "getFakeCode",
      "fakeFlowEditor",
      "fakeEditor"
    );
    this.processFakeBreakpointLines();
    this.saveProgramOnTest(output, beautyCode);
  }

  debugFlow() {
    if (!this.hasProjectId("To debug flowchart you must run program first"))
      return;
    const { output, beautyCode } = this.processEditorFlowBeforeDebug();
    this.startDebug(output, beautyCode);
  }

  processEditorFlowBeforeDebug() {
    const output = this.interpreter(false);
    const { beautyCode } = this.getCodeBeautyAndRender(
      output,
      "getCode",
      "innerFlowchartIdeEditor",
      "editor"
    );
    const { beautyCode: fakeCode } = this.getCodeBeautyAndRender(
      output,
      "getFakeCode",
      "fakeFlowEditor",
      "fakeEditor"
    );
    this.processFakeBreakpointLines();
    Object.keys(this.globalBreakpoint).forEach((id) =>
      this.addJavaBreakpoint({ id })
    );
    return { output, beautyCode };
  }

  startDebug(output, beautyCode) {
    this.saveProgramOnDebug(output, beautyCode);
  }

  hasProjectId(message) {
    if (!this.projectCompositeId) {
      this.log(
        `<div style='color: red; margin-top: 5px;'>${message}</div>`,
        "logFlowOutput"
      );
      Dialog.noticeDialog({ title: "Message", text: message });
      return false;
    }
    return true;
  }

  filterStep(query) {
    query = query.split("=");
    const args = query[1].split(",");
    const steps = document.querySelectorAll("[data-step]");
    steps.forEach((item) => {
      const dataStep = item.getAttribute("data-step");
      if (args[0] !== "0" && !args.includes(dataStep)) {
        item.classList.add("hide");
      } else {
        item.classList.remove("hide");
      }
    });
  }

  restoreScale() {
    this.xScroll = 0;
    this.yScroll = 0;
    this.yScrollPalette = 0;
    this.scale = 1;
  }

  logDescription() {
    this.clearConsole("markDownDesc");
    document.querySelector("#markDownDesc").style.overflow = "auto";
    if (!Utils.isEmpty(this.mdDescriptionContent)) {
      this.log(
        `<input class="toggle-step visually-step-hidden" id="markDownCheck" type='checkbox'/>
        <label class="label-step" for="markDownCheck">Description</label><div id="innerMarkDownDesc" class="markdown-body">`,
        "markDownDesc"
      );
      document.querySelector("#innerMarkDownDesc").innerHTML = marked(
        this.mdDescriptionContent
      );
    }
  }

  logLoadingSpinner() {
    this.clearConsole("markDownDesc");
    this.log(
      `<span class="loader-blocks">L &nbsp; ading</span>`,
      "markDownDesc"
    );
    document.querySelector("#markDownDesc").style.overflow = "unset";
  }

  loadingPalleteSpinner() {
    document
      .querySelector("body")
      .insertAdjacentHTML(
        "beforeend",
        `<span id="palleteSpinner" class="loader-blocks loader-blocks-pos">L &nbsp; ading</span>`
      );
  }

  removeLoadingPalleteSpinner() {
    if (document.querySelector("#palleteSpinner"))
      document.querySelector("#palleteSpinner").remove();
  }

  languageToRun(doNotUseThisName, fromServer) {
    if (!doNotUseThisName.length) return;
    const { beautyCode } = this.getCodeBeautyAndRender(
      doNotUseThisName,
      "getCode",
      "innerFlowchartIdeEditor",
      "editor"
    );
    switch (this.languageOutput) {
      case "java":
        const { beautyCode: fakeCode } = this.getCodeBeautyAndRender(
          doNotUseThisName,
          "getFakeCode",
          "fakeFlowEditor",
          "fakeEditor"
        );
        this.processFakeBreakpointLines();
        this.runCodeServer(doNotUseThisName, beautyCode);
        break;
      case "javascript":
        if (fromServer) {
          this.runCodeServer(doNotUseThisName, beautyCode);
        } else {
          this.runJavascriptCode(beautyCode);
        }
        break;
    }
  }

  getCodeBeautyAndRender(code, typeGet, selectorId, editor) {
    const out = this[typeGet](code);
    const beautyCode = this.getBeautifyCode(out);
    this.renderAceEditor({
      code: this.beautyCodeFixed(beautyCode).replace(/\n\s*\n/g, "\n"),
      selectorId,
      editor,
    });
    return { beautyCode };
  }

  getBeautifyCode(code) {
    return js_beautify(code, {
      indent_size: 2,
      brace_style: "none, preserve-inline",
    }).replace(/[+-]?\d+(\.\d+)?\s(f|L)/g, (line) => line.replace(/\s+/g, ""));
  }

  beautyCodeFixed(beautyCode) {
    let str = beautyCode.split("\n");
    if (str[0] === "//java" || str[0] === "//javascript") {
      str.shift();
    }
    return str.join("\n");
  }

  getCode(doNotUseThisName) {
    let code = "";
    if (this.languageOutput === "java") {
      this.log(
        `<div id="innerFlowchartIdeEditor"></div>`,
        "flowchartIdeEditor"
      );
      code += this.getJavaTemplateClass(doNotUseThisName, "code");
    } else {
      this.clearConsole("flowchartIdeEditor");
      this.log(
        `<div id="innerFlowchartIdeEditor"></div>`,
        "flowchartIdeEditor"
      );
      code = this.getJavasciptTemplate(doNotUseThisName);
    }
    this.resizeLogConsole();
    return code;
  }

  getFakeCode(doNotUseThisName) {
    return this.getJavaTemplateClass(doNotUseThisName, "fakeOutput");
  }

  resizeLogConsole() {
    document
      .querySelectorAll(".split-console")
      .forEach((el) => (el.style.height = "48%"));
    document.querySelector(".console-editor").style.display = "block";
    document.querySelector(".console-editor").style.border = "1px solid #444";
  }

  runCodeServer(doNotUseThisName, beautyCode) {
    let cleanCode = "";
    if (!this.projectCompositeId) {
      cleanCode = this.getDefaultTemplateCode();
      this.codeToRun = this.getBeautifyCode(
        this.getCleanCodeByLanguage(doNotUseThisName, "code")
      );
      // browxyStartUp.runCompilerProject.runProjectFromCode(
      //   cleanCode,
      //   true,
      //   this.flowchartName
      // );
      flowChartEditor.isCreatedFromFlow = true;
      this.createFromRunCodeProgramListener();
    } else {
      cleanCode = this.getCleanCodeByLanguage(doNotUseThisName, "code");
      if (this.markAsUnsaved) {
        Dialog.confirmDialog(
          "Save flowchart",
          "Do you want to save the flowchart before running it ?",
          "Save",
          "CancelFlowSave",
          () => {
            this.saveRunJavaFromCode({
              code: cleanCode,
              isNew: false,
              typeRun: "run",
              saveFlow: true,
            });
          },
          () => {
            this.saveRunJavaFromCode({
              code: cleanCode,
              isNew: false,
              typeRun: "run",
              saveFlow: false,
            });
          }
        );
      } else {
        const projectCompositeId = this.projectCompositeId;
        CompilerService.isProjectOpened(projectCompositeId, {
          callback: (isOpen) => {
            flowChartEditor.showConsole();
            if (!isOpen) {
              this.createLoadProgramListener(projectCompositeId);
              // browxyStartUp.project.openProjectLoadedAsExample(
              //   projectCompositeId
              // );
            } else {
              this.saveRunJavaFromCode({
                code: cleanCode,
                isNew: false,
                typeRun: "run",
                saveFlow: true,
              });
            }
          },
        });
      }
    }
    this.setFullCode(cleanCode);
  }

  saveProgramOnDebug(output, beautyCode) {
    const cleanCode = this.getCleanCodeByLanguage(output, "code");
    if (this.markAsUnsaved) {
      Dialog.confirmDialog(
        "Save flowchart",
        "Do you want to save the flowchart before running it ?",
        "Save",
        "CancelFlowSave",
        () => {
          this.saveRunJavaFromCode({
            code: cleanCode,
            isNew: false,
            typeRun: "debug",
            saveFlow: true,
          });
        },
        () => {
          this.saveRunJavaFromCode({
            code: cleanCode,
            isNew: false,
            typeRun: "debug",
            saveFlow: false,
          });
        }
      );
    } else {
      //  browxyStartUp.debugProject.setTypeResult("browxy_flowchart");
      // browxyStartUp.debugProject.debugProject(this.projectCompositeId);
    }
    this.setFullCode(cleanCode);
  }

  saveProgramOnTest(output, beautyCode) {
    const cleanCode = this.getCleanCodeByLanguage(output, "code");
    if (this.markAsUnsaved) {
      Dialog.confirmDialog(
        "Save flowchart",
        "Do you want to save the flowchart before running it ?",
        "Save",
        "CancelFlowSave",
        () => {
          this.saveRunJavaFromCode({
            code: cleanCode,
            isNew: false,
            typeRun: "test",
            saveFlow: true,
          });
        },
        () => {
          this.saveRunJavaFromCode({
            code: cleanCode,
            isNew: false,
            typeRun: "test",
            saveFlow: false,
          });
        }
      );
    } else {
      // browxyStartUp.customTree.runTestsFromFlow(this.projectCompositeId);
    }
    this.setFullCode(cleanCode);
  }

  getDefaultTemplateCode() {
    return this.languageOutput === "java"
      ? this.getBeautifyCode(`//java
    ${this.packageToImport}\n
    public class ${this.flowchartName} {
    public static void main(String[] args) {
      //FLOW CODE HERE...   
    }
    }`)
      : this.getBeautifyCode(`//javascript
    function main() {
      //FLOW CODE HERE...   
    }
    main();`);
  }

  getCleanCodeByLanguage(code, outCodeType) {
    const langCode =
      this.languageOutput === "java"
        ? this.getJavaTemplateClass(code, outCodeType)
        : this.getJavasciptTemplate(code, true);
    return this.getBeautifyCode(langCode).replace(/\n\s*\n/g, "\n");
  }

  saveRunJavaFromCode({ code, isNew, typeRun, saveFlow }) {
    this.saveFlowchartCodeToFile
      .setDataFlow({
        projectCompositeId: this.projectCompositeId,
        code,
        isNew,
        typeRun,
        saveFlow,
      })
      .update();
  }

  runJavascriptCode(beautyCode) {
    beautyCode.replace(/\n\s*\n/g, "\n");
    if (Utils.isEmpty(this.globalBreakpoint)) {
      setTimeout(() => {
        const myInterpreter = new InterpreterJs(this, beautyCode);
        myInterpreter.runCode();
      }, 30);
    } else {
      try {
        new StepButton("breakBtn", "Continue").render();
        this.renderAceEditor({
          code: this.beautyCodeFixed(
            beautyCode
              .replace(/highlightBlock\(.+\);/gi, "")
              .replace(/\n\s*\n/g, "\n")
          ),
          selectorId: "innerFlowchartIdeEditor",
          editor: "editor",
        });
        setTimeout(() => {
          const myInterpreter = new InterpreterJs(this, beautyCode);
          myInterpreter.addButtonListeners();
          myInterpreter.runStepByStepCode();
        }, 30);
      } catch (error) {
        this.log(
          `<div style='color: #b42c2c'>${error.message}</div>`,
          "logFlowOutput"
        );
        document.querySelector("#stepByStep-btnContainer").remove();
      }
    }
  }

  startStepByStepJavascriptCode() {
    try {
      this.setBreakpointsEditorRows();
      this.clearConsole("logFlowOutput");
      let code = this.interpreter(true);
      code = this.getCode(code);
      const beautyCode = this.getBeautifyCode(code).replace(/\n\s*\n/g, "\n");
      this.renderAceEditor({
        code: this.beautyCodeFixed(
          beautyCode
            .replace(/highlightBlock\(.+\);/gi, "")
            .replace(/\n\s*\n/g, "\n")
        ),
        selectorId: "innerFlowchartIdeEditor",
        editor: "editor",
      });
      setTimeout(() => {
        const myInterpreter = new InterpreterJs(this, beautyCode);
        myInterpreter.addButtonListeners();
      }, 30);
    } catch (error) {
      this.log(
        `<div style='color: #b42c2c'>${error.message}</div>`,
        "logFlowOutput"
      );
      document.querySelector("#stepByStep-btnContainer").remove();
    }
  }

  validRun() {
    if (document.querySelector("#stepByStep-btnContainer")) {
      this.log(
        "<div style='color: red; margin-top: 5px;'>program is already running!!</div>",
        "logFlowOutput"
      );
      return false;
    }
    return true;
  }

  getJavaTemplateClass(outs, outCodeType) {
    const importJavaCode = this.getJavaImports();
    const instanceJavaObjects = this.getInstanceJavaObjects();
    const javaFunctionCode = this.getJavaFunctionCode(outs, outCodeType);
    return `${this.packageToImport}\n
    ${importJavaCode}
    public class ${this.flowchartName} {
    public static void main(String[] args) {
    ${instanceJavaObjects}${outs[0][outCodeType]}
    }
    ${javaFunctionCode}
    }`;
  }

  getJavaFunctionCode(tabCode, outCodeType) {
    let output = "";
    tabCode.forEach((tab) => {
      if (tab.tabId != "0") {
        const index = this.tabs[1].api.program["1"].blocks.findIndex(
          (block) => block.vars.tabId === tab.tabId
        );
        if (index > -1) {
          const repoCode = this.tabs[1].api.program["1"].blocks[index].code;
          output += `\npublic static ${repoCode} {
          ${tab[outCodeType]} 
          }\n`;
        }
      }
    });
    return output;
  }

  getJavaImports() {
    const importState = this.importsStateCollection.get("import");
    return !importState
      ? ""
      : [...importState.value].reduce((a, b) => a + b, "");
  }

  getInstanceJavaObjects() {
    const scanState = this.importsStateCollection.get("scanner");
    let scanner = "";
    if (scanState !== null) {
      scanner = `java.util.Scanner scanner = new java.util.Scanner(System.in);\n`;
      this.importsStateCollection.update("scanner", { used: true });
    }
    return scanner;
  }

  getJavasciptTemplate(tabCode, fromServer = false) {
    const redefineFunctions = fromServer
      ? `var GET = readLine;
            var PRINT = print;
            var PRINTLN = print;`
      : "";
    return `function main() {
    ${tabCode[0].code}
    }
    ${this.getJavascriptFunctionCode(tabCode)}
    ${redefineFunctions}
    main();`;
  }

  getJavascriptFunctionCode(tabCode) {
    let output = "";
    tabCode.forEach((tab) => {
      if (tab.tabId != "0") {
        const index = this.tabs[1].api.program["1"].blocks.findIndex(
          (block) => block.vars.tabId === tab.tabId
        );
        if (index > -1) {
          const repoCode = this.tabs[1].api.program["1"].blocks[index].code;
          output += `function ${repoCode} {\n${tab.code}}\n`;
        }
      }
    });
    return output;
  }

  renderAceEditor({ code, selectorId, editor }) {
    if (editor === "fakeEditor") this.createFakeEditorContainer();
    const modelist = ace.require("ace/ext/modelist");
    this[editor] = ace.edit(selectorId);
    const extension = this.languageOutput === "java" ? ".java" : ".js";
    const mode = modelist.getModeForPath(extension).mode;
    ace.config.set(
      "basePath",
      "assets/javascripts/third-party/ace/src-min-noconflict"
    );
    ace.require("ace/ext/language_tools");
    this[editor].getSession().setMode(mode);
    this[editor].setTheme(`ace/theme/eclipse`);
    this[editor].setShowPrintMargin(false);
    this[editor].setAutoScrollEditorIntoView(true);
    this[editor].setOptions({
      minLines: 20,
      maxLines: Infinity,
      fontSize: `20px`,
    });
    this[editor].$blockScrolling = Infinity;
    this[editor].session.setValue(code);
    this[editor].setReadOnly(true);
    this[editor].resize(true);
    this.processBreakPoint();
  }

  processBreakPoint() {
    this.editor.on("guttermousedown", this.toggleBreakpointEditor.bind(this));
    if (Utils.isEmpty(this.editorRows)) return;
    for (const key in this.editorRows) {
      if (Object.hasOwnProperty.call(this.editorRows, key)) {
        const row = this.editorRows[key];
        this.editor.session.setBreakpoint(row);
      }
    }
  }

  toggleBreakpointEditor(e) {
    const target = e.domEvent.target;
    if (target.className.indexOf("ace_gutter-cell") == -1) {
      return;
    }
    if (!this.editor.isFocused()) {
      return;
    }
    if (e.clientX > 25 + target.getBoundingClientRect().left) {
      return;
    }
    const row = e.getDocumentPosition().row;
    const breakpoints = e.editor.session.getBreakpoints(row, 0);
    this.toggleBreakpointEditorByLanguage(e, row, breakpoints);
    e.stop();
  }

  toggleBreakpointEditorByLanguage(e, row, breakpoints) {
    switch (this.languageOutput) {
      case "java":
        this.toggleBreakpointEditorJava(e, row, breakpoints);
        break;
      case "javascript":
        this.toggleBreakpointEditorJavascript(e, row, breakpoints);
        break;
      default:
        break;
    }
  }

  toggleBreakpointEditorJavascript(e, row, breakpoints) {
    const breakpointRow = Array.from(Object.entries(this.breakpointRows))
      .map((point) => point[1])
      .filter((o) => o.row === row)
      .reduce((a, o) => o, {});
    if (Utils.isEmpty(breakpointRow)) return;
    this.toggleBreakpoints(e, row, breakpointRow, breakpoints);
  }

  toggleBreakpointEditorJava(e, row, breakpoints) {
    this.toggleBreakpoints(e, row, row, breakpoints);
  }

  toggleBreakpoints(e, row, breakpointRow, breakpoints) {
    if (typeof breakpoints[row] === typeof undefined) {
      this.processBreakpointFromTo(
        breakpointRow,
        "addBreakpointFromEditorToFlow"
      );
      e.editor.session.setBreakpoint(row);
    } else {
      this.processBreakpointFromTo(
        breakpointRow,
        "removeBreakpointFromEditorToFlow"
      );
      e.editor.session.clearBreakpoint(row);
    }
  }

  processBreakpointFromTo(data, typeProcess) {
    switch (this.languageOutput) {
      case "java":
        this[`${typeProcess}Java`](data);
        break;
      case "javascript":
        this[`${typeProcess}Javascript`](data);
        break;
      default:
        break;
    }
  }

  addBreakpointFromEditorToFlowJavascript(breakpointRow) {
    const { id, tabIndex, row } = breakpointRow;
    this.editorRows[row] = row;
    this.breakpointFromEditorToFlow(id, tabIndex, "add");
  }

  addBreakpointFromEditorToFlowJava(row) {
    this.processBreakpointToDebugProject(row, "add");
    if (!this.javaEditorLines.rows[row]) return;
    const { id, tabIndex } = this.javaEditorLines.rows[row];
    this.breakpointFromEditorToFlow(id, tabIndex, "add");
  }

  removeBreakpointFromEditorToFlowJavascript(breakpointRow) {
    const { id, tabIndex, row } = breakpointRow;
    delete this.editorRows[row];
    this.breakpointFromEditorToFlow(id, tabIndex, "remove");
  }

  removeBreakpointFromEditorToFlowJava(row) {
    if (!this.javaEditorLines.rows[row]) return;
    const { id, tabIndex } = this.javaEditorLines.rows[row];
    this.breakpointFromEditorToFlow(id, tabIndex, "remove");
    this.processBreakpointToDebugProject(row, "clear");
  }

  breakpointFromEditorToFlow(id, tabIndex, type) {
    if (tabIndex === this.selectedTab) {
      const action = type === "add" ? "addBreakpoint" : "removeBreakpoint";
      const index = this.getBlockIndex(id);
      this.program[index][action]();
      this.update();
    } else {
      const hasBreakpoint = type === "add";
      const tabId = this.tabs[tabIndex].id;
      const blocks = this.tabs[tabIndex].api.program[tabId].blocks;
      const index = blocks.findIndex((blk) => blk.id === id);
      this.tabs[tabIndex].api.program[tabId].blocks[index].breakpoint =
        hasBreakpoint;
      this.processGlobalBrekpoint(id, type);
    }
  }

  processGlobalBrekpoint(id, type) {
    if (type === "add") {
      this.globalBreakpoint[id] = id;
    } else {
      this.removeGlobalBreakpointById(id);
    }
  }

  addBreakpointFromFlowToEditorJavascript(index) {
    if (!this.editor) return;
    if (index < 3) return;
    const { id } = this.program[index];
    const { row } = this.breakpointRows[id] || "";
    if (Utils.isEmpty(row)) {
      this.program[index].removeBreakpoint();
      return;
    }
    this.editor.session.setBreakpoint(row);
    this.editorRows[row] = row;
  }

  addBreakpointFromFlowToEditorJava(index) {
    if (!this.editor) return;
    if (index < 3) return;
    const { id } = this.program[index];
    this.addJavaBreakpoint({ id });
  }

  addJavaBreakpoint({ id }) {
    const { row } = this.javaEditorLines.ids[id] || "";
    if (Utils.isEmpty(row)) {
      const index = this.getBlockIndex(id);
      if (index < 0) return;
      this.program[index].removeBreakpoint();
      return;
    }
    this.editor.session.setBreakpoint(row);
    this.processBreakpointToDebugProject(row, "add");
  }

  removeBreakpointFromFlowToEditorJavascript(id) {
    if (!this.editor) return;
    const { row } = this.breakpointRows[id] || "";
    if (Utils.isEmpty(row)) return;
    const breakpoints = this.editor.session.getBreakpoints(row, 0);
    if (typeof breakpoints[row] === typeof undefined) return;
    this.editor.session.clearBreakpoint(row);
    delete this.editorRows[row];
  }

  removeBreakpointFromFlowToEditorJava(id) {
    if (!this.editor) return;
    const { row } = this.javaEditorLines.ids[id] || "";
    if (Utils.isEmpty(row)) return;
    const breakpoints = this.editor.session.getBreakpoints(row, 0);
    if (typeof breakpoints[row] === typeof undefined) return;
    this.editor.session.clearBreakpoint(row);
    this.processBreakpointToDebugProject(row, "clear");
  }

  processBreakpointToDebugProject(row, typeProcess) {
    this.addClearEditorRows(row, typeProcess);
    // if (!browxyStartUp.compiler.currentDebugExecutionId) {
    //   typeProcess =
    //     typeProcess === "add" ? "addRowBreakpoint" : "deleteRowBreakpoint";
    //   browxyStartUp.debugProject[typeProcess](
    //     this.projectCompositeId,
    //     this.pathClass,
    //     row
    //   );
    // } else {
    //   typeProcess =
    //     typeProcess === "add"
    //       ? ["setRuntimeBreakPoint", "setRuntimeBreakPointOnTable"]
    //       : ["clearRuntimeBreakPoint", "clearRuntimeBreakPointOnTable"];
    //   browxyStartUp.debugProject[typeProcess[0]](this.pathClass, row);
    //   if (typeProcess[1] === "setRuntimeBreakPointOnTable") {
    //     browxyStartUp.debugProject[typeProcess[1]]({
    //       projectId: this.projectCompositeId,
    //       pathClass: this.pathClass,
    //       editorRow: row,
    //     });
    //   } else {
    //     browxyStartUp.debugProject[typeProcess[1]](this.pathClass, row);
    //   }
    // }
  }

  addClearEditorRows(row, typeProcess) {
    if (typeProcess === "add") {
      this.editorRows[row] = row;
    } else {
      delete this.editorRows[row];
    }
  }

  addGlobalBreakpoint(blockId, breakpointId) {
    this.globalBreakpoint[blockId] = breakpointId;
  }

  removeGlobalBreakpointById(id) {
    delete this.globalBreakpoint[id];
  }

  highlightBlock(id, tabIndex) {
    this.unLightBlock();
    tabIndex = Number(tabIndex);
    if (tabIndex !== this.selectedTab) {
      this.openAndLoadTabByIndex(tabIndex);
    }
    const index = this.getBlockIndex(id);
    if (index < 0) return false;
    this.unLightBlock();
    this.program[index].highlighted = true;
    this.scrollOnStepByStep(index);
    this.reRender();
  }

  unLightBlock() {
    this.program = this.program.map((block) => {
      block.highlighted = false;
      return block;
    });
  }

  scrollOnStepByStep(index) {
    this.xScroll = 0;
    this.yScroll = 0;
    this.update();
    const { x, y } = this.eventHandler.worldToScreen(
      this.program[index].x,
      this.program[index].y
    );
    const yPoint = this.canvas.height;
    const xPoint = this.canvas.width - 200;
    if (y < yPoint) {
      this.yScroll = 0;
    } else {
      this.yScroll = yPoint / 2 - y + 200;
    }
    if (x < xPoint) {
      this.xScroll = 0;
    } else {
      this.xScroll = xPoint / 2 - x + 200;
    }
  }

  reRender() {
    this.program.forEach((block) => {
      block.move(block.x, block.y);
      block.render();
    });
    this.update();
  }

  processFakeBreakpointLines() {
    const lines = this.fakeEditor.session.doc.getAllLines();
    this.javaEditorLines = { rows: {}, ids: {} };
    let index = 0;
    while (index < this.fakeEditor.session.getLength()) {
      const line = this.fakeEditor.session.getLine(index);
      const start = line.indexOf("/*");
      const end = line.indexOf("*/");
      if (start > -1 && end > -1) {
        const lineFound = line.substring(start + 3, end - 1);
        const blockProps = Utils.parseJsonObject(lineFound);
        const { id, tabIndex } = blockProps;
        this.javaEditorLines.rows[index] = { id, tabIndex };
        this.javaEditorLines.ids[id] = { row: index, tabIndex };
      }
      index++;
    }
    document.querySelector("#fakeFlowEditor").remove();
  }

  createFakeEditorContainer() {
    if (document.querySelector("#fakeFlowEditor"))
      document.querySelector("#fakeFlowEditor").remove();
    const div = document.createElement("div");
    div.setAttribute("id", "fakeFlowEditor");
    div.style.display = "none";
    document.querySelector("body").appendChild(div);
  }

  setProjectCompositeId(projectCompositeId, runFromNull = false) {
    this.projectCompositeId = projectCompositeId;
    flowChartEditor.runFromNull = runFromNull;
  }

  setFullCode(code) {
    this.fullCode = code;
  }

  isChangeFullCode(newCode) {
    return this.fullCode !== newCode;
  }

  createLoadProgramListener(projectId) {
    // const broadCastFlowCode = (ev) => {
    //   ev.target.removeEventListener("loadFlowCode", broadCastFlowCode);
    //   browxyStartUp.runCompilerProject.autoRun(projectId);
    // };
    // window.addEventListener("loadFlowCode", broadCastFlowCode);
  }

  createFromRunCodeProgramListener() {
    const broadCastFlowCode = (ev) => {
      ev.target.removeEventListener("newRunFromCode", broadCastFlowCode);
      this.saveRunJavaFromCode({
        code: this.codeToRun,
        isNew: true,
        typeRun: "run",
        saveFlow: true,
      });
      this.paletteManager.setReadyToRender(true);
      this.logDescription();
    };
    window.addEventListener("newRunFromCode", broadCastFlowCode);
  }

  setApiUndoRedoManager() {
    this.undoRedoAPI = new FlowAPI(this);
    this.undoRedoAPI
      .getBFS(this.graph)
      .getApiBlockProps(
        this.program,
        this.blockState,
        this.tabs[this.selectedTab].id
      );
  }

  getApiUndoRedoManager() {
    this.setApiUndoRedoManager();
    return this.undoRedoAPI.api;
  }

  undoRedo(state) {
    this.undoRedoManager.setIsUndoRedo();
    this.undoRedoAPI.api = state;
    this.undoRedoAPI.createFlowFromAPI({
      key: this.tabs[this.selectedTab].id,
      projectCompositeId: this.projectCompositeId,
      projectName: this.flowchartName,
      isUndoRedo: true,
    });
    this.undoRedoManager.setIsUndoRedo();
  }

  initTabs(palette = {}) {
    this.setInitialTabs([
      { id: "0", name: "main", type: "main", selected: true },
      { id: "1", name: "functions", type: "f_repo", selected: false },
    ]);
    this.updateTabs();
  }

  setInitialTabs(intialValues) {
    this.tabs = [];
    this.selectedTab = 0;
    intialValues.forEach((props) => {
      const { id, name, type, selected } = props;
      const api = this.parseStringApi("[]", id);
      api.program[id].name = name;
      api.program[id].type = type;
      this.tabs.push({
        id,
        name,
        type,
        api,
        scale: 1,
        xScroll: 0,
        yScroll: 0,
        yScrollPalette: 0,
        isOpened: true,
        selected,
        hasError: false,
      });
    });
  }

  copyTabState(tabId) {
    this.tabAPI = new FlowAPI(this, true);
    this.tabAPI
      .getBFS(this.graph)
      .getApiBlockProps(this.program, this.blockState, tabId);
  }

  createTab(id, name, type, stringApi, isOpen = false) {
    this.updateTabsApiBeforeChange();
    const api = this.parseStringApi(stringApi, id);
    this.tabs.push({
      id,
      name,
      type,
      api,
      scale: 1,
      xScroll: 0,
      yScroll: 0,
      yScrollPalette: 0,
      isOpened: true,
      selected: isOpen,
      hasError: false,
    });
    const tabIndex = isOpen ? this.tabs.length - 1 : this.selectedTab;
    if (isOpen) this.tabs[this.selectedTab].selected = false;
    this.selectTab(tabIndex, isOpen);
  }

  parseStringApi(stringApi, tabId) {
    return {
      langOut: this.languageOutput,
      program: {
        [tabId]: {
          blocks: Utils.parseJsonObject(stringApi),
          blocksOutside: [],
        },
      },
    };
  }

  unSelectTabs() {
    this.tabs = this.tabs.map((tab) => {
      tab.selected = false;
      return tab;
    });
  }

  selectTab(index, isOpen = false) {
    this.selectedTab = index;
    this.tabs[index].selected = true;
    this.updateTabs();
    this.update();
    if (isOpen) this.loadTab();
  }

  updateTabsApiBeforeChange() {
    this.copyTabState(this.tabs[this.selectedTab].id);
    this.tabs[this.selectedTab].api = { ...this.tabAPI.api };
    this.tabs[this.selectedTab].scale = this.scale;
    this.tabs[this.selectedTab].xScroll = this.xScroll;
    this.tabs[this.selectedTab].yScroll = this.yScroll;
    this.tabs[this.selectedTab].yScrollPalette = this.yScrollPalette;
  }

  updateTabs() {
    this.selectBlock = null;
    const template = this.tabs
      .map(
        (tab, index) =>
          `${
            tab.isOpened
              ? `${
                  this.selectedTab === index
                    ? `<div id=${tab.id} class="tab-selected ${
                        tab.hasError ? "tab-error" : ""
                      }" title="${tab.name}" data-tabs="canvasTab">${tab.name}${
                        tab.type !== "main" && tab.type !== "f_repo"
                          ? `<span data-closetabs="${tab.id}" style="cursor: pointer; position: relative; color: #ff0000; top: -10px; right: -5px;">x</span>`
                          : ""
                      }</div>`
                    : `<div id=${tab.id} class="tab ${
                        tab.hasError ? "tab-error" : ""
                      }" title="${
                        tab.name
                      }" data-tabs="canvasTab"><span data-tabs="canvasTab" id="tabName-${
                        tab.id
                      }">${tab.name}</span>${
                        tab.type !== "main" && tab.type !== "f_repo"
                          ? `<span data-closetabs="${tab.id}" style="cursor: pointer; position: relative; color: #8c3c3c; top: -10px; right: -5px;">x</span>`
                          : ""
                      }</div>`
                }`
              : ""
          }`
      )
      .join("");
    document.querySelector("#tabs").innerHTML = template;
    this.addTabListener();
  }

  addTabListener() {
    this.tabElements = document.querySelectorAll('[data-tabs="canvasTab"]');
    this.tabCloseElements = document.querySelectorAll("[data-closetabs]");
    this.tabElements.forEach((element) =>
      element.addEventListener("click", this.handlerTabs.bind(this), false)
    );
    this.tabCloseElements.forEach((element) =>
      element.addEventListener("click", this.handlerCloseTabs.bind(this), false)
    );
  }

  handlerTabs(ev) {
    ev.stopPropagation();
    const target = ev.target;
    const id =
      target.tagName.toLowerCase() === "div"
        ? target.getAttribute("id")
        : target.tagName.toLowerCase() === "span"
        ? target.getAttribute("id").split("-")[1]
        : -1;
    const index = this.tabs.findIndex((tab) => tab.id === id);
    if (index < 0) return;
    if (this.tabs[index].selected) return;
    this.loadTabByIndex(index);
  }

  handlerCloseTabs(ev) {
    ev.stopPropagation();
    const id = ev.target.getAttribute("data-closetabs");
    const index = this.tabs.findIndex((tab) => tab.id === id);
    if (index < 2) return;
    let selectedTab = this.selectedTab;
    this.tabs[index].selected = false;
    this.tabs[index].isOpened = false;
    if (this.tabs[index].id === this.tabs[this.selectedTab].id) {
      this.tabs.forEach((tab, idx) => {
        if (tab.isOpened && idx < index) selectedTab = idx;
      });
    }
    this.updateTabsApiBeforeChange();
    this.selectTab(selectedTab);
    this.loadTab();
  }

  openAndLoadTabByIndex(index, hasError) {
    for (let i = 0; i < this.tabs.length; i++) {
      this.tabs[i].selected = false;
    }
    this.tabs[index].isOpened = true;
    if (hasError) {
      this.tabs[index].hasError = true;
    }
    this.loadTabByIndex(index);
  }

  loadTabByIndex(index) {
    this.updateTabsApiBeforeChange();
    this.selectTab(index);
    this.unSelectTabs();
    this.tabs[index].selected = true;
    this.loadTab();
  }

  loadTab() {
    const isMarkAsUnsavedBeforeLoad = this.markAsUnsaved;
    this.updatePalette();
    const tabApi = new FlowAPI(this, true);
    tabApi.api = this.tabs[this.selectedTab].api;
    this.setScaleAndScroll({
      scale: this.tabs[this.selectedTab].scale,
      xScroll: this.tabs[this.selectedTab].xScroll,
      yScroll: this.tabs[this.selectedTab].yScroll,
      yScrollPalette: this.tabs[this.selectedTab].yScrollPalette,
    });
    tabApi.createFlowFromAPI({
      key: this.tabs[this.selectedTab].id,
      projectCompositeId: this.projectCompositeId,
      projectName: this.flowchartName,
      isUndoRedo: true,
    });
    this.setFunctionScope();
    this.markFlowchartAsSavedUnsaved(isMarkAsUnsavedBeforeLoad);
  }

  updatePalette() {
    this.generateNewPalette(this.mainPalette);
    this.update();
  }

  setScaleAndScroll({ scale, xScroll, yScroll, yScrollPalette }) {
    this.scale = scale;
    this.xScroll = xScroll;
    this.yScroll = yScroll;
    this.yScrollPalette = yScrollPalette;
  }

  setFunctionScope() {
    this.scopeType.GLOBAL_SCOPE =
      this.selectedTab === 0 ? "Global scope" : "Function scope";
    if (this.selectedTab !== 0 && this.selectedTab !== 1) {
      const idx = this.tabs[1].api.program["1"].blocks.findIndex(
        (block) => block.vars.tabId === this.tabs[this.selectedTab].id
      );
      if (idx < 0) return false;
      const params = this.tabs[1].api.program["1"].blocks[idx].vars.params;
      params.forEach((param) => {
        this.addParamToScope(param);
      });
    }
  }

  addParamToScope(params) {
    const { name, declarationType, declaration } = params;
    this.program[0].globalScope.update(name, {
      id: Date.now().toString(),
      name: name,
      value: "",
      declaration: declarationType,
      declarationType: declaration,
      scope: `${this.scopeType.GLOBAL_SCOPE} (param)`,
      isInFlow: true,
    });
    if (declaration === "Class") {
      this.program[0].importsAndInstancesState.update("scanner", {
        name: "scanner",
        value: "new Scanner(System.in)",
        declaration: "Scanner",
        declarationType: "Class",
        used: false,
      });
    }
  }

  setEndBlock() {
    this.findParentBlocks().forEach((parent) => {
      const branchR = this.getParentLastChildBlock(parent, "YES");
      if (branchR !== null) {
        const { child, indexParent } = branchR;
        this.program[indexParent].endCodeBlock.push(
          { id: child.id, branch: "YES" },
          { id: "+++", branch: "---" }
        );
      }
      if (parent.type === "ifBlock") {
        const branchL = this.getParentLastChildBlock(parent, "NO");
        if (branchL !== null) {
          const { child, indexParent } = branchL;
          if (this.program[indexParent].endCodeBlock.length > 0) {
            this.program[indexParent].endCodeBlock[1] = {
              id: child.id,
              branch: "NO",
            };
          } else {
            this.program[indexParent].endCodeBlock.push(
              { id: "+++", branch: "---" },
              { id: child.id, branch: "NO" }
            );
          }
        }
      }
    });
  }

  findParentBlocks() {
    return this.program.filter((block) =>
      ["whileBlock", "doWhileBlock", "forBlock", "ifBlock"].includes(block.type)
    );
  }

  getParentLastChildBlock(parent, branch) {
    const children = this.getSortedChildren(parent.id, branch);
    if (children.length > 0) {
      const child = children[children.length - 1];
      const indexParent = this.getBlockIndex(parent.id);
      if (indexParent !== -1) {
        return { child, indexParent };
      }
    }
    return null;
  }

  exportSourceCode() {
    const { src, fileExtension } = this.getSourceCode();
    const beautyCode = this.getBeautifyCode(src);
    const filename = `${this.flowchartName.toLowerCase()}_${new Date().toISOString()}.${fileExtension}`;
    this.createSourceCodeDownloadLink(filename, beautyCode).click();
  }

  getSourceCode() {
    const code = this.interpreter(false);
    switch (this.languageOutput.toLowerCase()) {
      case "java":
        return {
          src: this.getJavaTemplateClass(code, "code"),
          fileExtension: "java",
        };
      case "javascript":
        return { src: this.getJavasciptTemplate(code), fileExtension: "js" };
      default:
        return { src: "", fileExtension: "txt" };
    }
  }

  createSourceCodeDownloadLink(filename, data) {
    const dataUri = `data:application/octet-stream;charset=utf-8,${encodeURIComponent(
      data
    )}`;
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataUri);
    anchor.setAttribute("download", filename);
    return anchor;
  }
}
