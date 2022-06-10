class FlowAPI {
  constructor(canvas, isFromTab) {
    this.c = canvas;
    this.tree = null;
    this.isCreatedFromFlow = false;
    this.isFromTab = isFromTab || false;
    this.api = {};
    this.initApi();
    this.jsonFileManager = new JSONFileManager();
  }

  initApi() {
    this.api.langOut = this.c.languageOutput;
    this.api.wizardItems = this.c.wizardItems;
    this.api.palette = this.c.mainPalette;
    this.api.colors = configEditor.flow.customizedBlocks;
    this.api.program = {};
  }

  getBFS(graph) {
    this.tree = graph
      .breadthFirstSearch(this.c.startBlockId)
      .filter((g) => g !== this.c.endBlockId);
    return this;
  }

  getApiBlockProps(blocks, blockState, apiId) {
    const programs = [];
    this.tree.forEach((node) => {
      const state = blockState.get(node);
      const index = blocks.findIndex((block) => block.id === node);
      if (index > -1) {
        programs.push(
          this.getStateBlock(blocks[index], state, this.c.languageOutput)
        );
      }
    });
    const blocksOutside = this.getBlocksOutside(blocks, blockState, apiId);
    this.api.program[apiId] = {
      blocks: programs,
      blocksOutside,
      tab: {
        name: !this.c.tabs.length
          ? "main"
          : this.c.tabs[this.c.selectedTab].name,
        type: !this.c.tabs.length
          ? "main"
          : this.c.tabs[this.c.selectedTab].type,
      },
    };
    return this;
  }

  saveAllApiTabs(tabId) {
    this.c.tabs.forEach((tab) => {
      if (tab.id != tabId) {
        const newTabBlocks = this.deleteTabProps(
          tab.api.program[tab.id].blocks
        );
        this.api.program[tab.id] = {
          blocks: newTabBlocks,
          blocksOutside: tab.api.program[tab.id].blocksOutside,
          tab: {
            name: tab.name,
            type: tab.type,
          },
        };
      }
    });
  }

  deleteTabProps(blocks) {
    return blocks.map((block) => {
      delete block.compileError;
      delete block.colors;
      delete block.breakpoint;
      return block;
    });
  }

  getStateBlock(block, state, language) {
    const keys = this.getVarPropsByLanguage(language, block.type);
    const stateBlock = {
      id: block.id,
      type: block.type.replace("Block", ""),
      hook: state.arrowHook || undefined,
      prev: state.lastHook || undefined,
      code: block.code,
      wizard: {
        droppedElements: block.droppedElements,
        wizardCode: block.wizardCode,
      },
    };
    if (this.isFromTab) {
      stateBlock.compileError = block.compileError;
      if (block.colors) stateBlock.colors = block.colors;
      stateBlock.breakpoint = block.breakpoint ? true : false;
    }
    if (keys.length > 0) stateBlock.vars = {};
    keys.forEach((key) => {
      stateBlock.vars[key] = block[key];
    });
    return stateBlock;
  }

  getBlocksOutside(blocks, blockState, apiId) {
    const blocksOutside = [];
    const outBlocks = blocks.filter((block) => !block.hooks[0].occupied);
    outBlocks.forEach((block) => {
      const tree = this.c.graph.breadthFirstSearch(block.id);
      let index = blocks.findIndex((blk) => block.id === blk.id);
      if (index > -1) {
        const state = {};
        const stateBlock = this.getStateBlock(
          blocks[index],
          state,
          this.c.languageOutput
        );
        stateBlock.x = blocks[index].x;
        stateBlock.y = blocks[index].y;
        stateBlock.ring = "not-occupied";
        stateBlock.hasChildren = tree && tree.length > 0;
        blocksOutside.push(stateBlock);
      }
      if (tree && tree.length > 0) {
        tree.forEach((node) => {
          let index = blocks.findIndex((blk) => node === blk.id);
          if (index > -1 && blocks[index].isLocked) {
            const state = blockState.get(node);
            const stateBlock = this.getStateBlock(
              blocks[index],
              state,
              this.c.languageOutput
            );
            (stateBlock.ring = "locked"), blocksOutside.push(stateBlock);
          }
        });
      }
    });
    return blocksOutside;
  }

  getVarPropsByLanguage(language, type) {
    switch (language) {
      case "java":
        return type === "defineBlock"
          ? [
              "declaration",
              "declarationType",
              "arraySizeOne",
              "arraySizeTwo",
              "variableName",
              "variableValue",
            ]
          : type === "inputBlock"
          ? [
              "declaration",
              "declarationType",
              "variableName",
              "variableValue",
              "radioOption",
              "userInputEnabled",
              "externalVariableId",
            ]
          : type === "outputBlock"
          ? ["expression", "radioOption"]
          : type === "codeBlock"
          ? ["importValue", "isImport"]
          : type === "forBlock"
          ? [
              "initialValue",
              "radioVar",
              "radioOption",
              "variableName",
              "variableValue",
              "variableCompareValue",
              "operation",
            ]
          : type === "wrapBlock"
          ? [
              "wrapType",
              "tabId",
              "bgColor",
              "lineColor",
              "fontColor",
              "params",
              "functionName",
              "returnFunctionType",
              "returnType",
            ]
          : [];
      case "javascript":
        return type === "defineBlock"
          ? [
              "declaration",
              "declarationType",
              "arraySizeOne",
              "arraySizeTwo",
              "variableName",
              "variableValue",
            ]
          : type === "inputBlock"
          ? [
              "declaration",
              "declarationType",
              "variableName",
              "variableValue",
              "radioOption",
              "operation",
              "expression",
            ]
          : type === "outputBlock"
          ? ["expression", "radioOption"]
          : type === "forBlock"
          ? [
              "initialValue",
              "radioVar",
              "radioOption",
              "variableName",
              "variableValue",
              "variableCompareValue",
            ]
          : type === "wrapBlock"
          ? [
              "wrapType",
              "tabId",
              "bgColor",
              "lineColor",
              "fontColor",
              "params",
              "functionName",
              "returnType",
            ]
          : [];
      default:
        return [];
    }
  }

  createFlowFromAPI({ key, projectCompositeId, projectName, isUndoRedo }) {
    this.newFlowchart({ projectCompositeId, projectName, isUndoRedo });
    if (Utils.isEmpty(this.api)) return;
    const { langOut, program, wizardItems, colors = {} } = this.api;
    this.c.languageOutput = langOut;
    this.c.wizardItems = wizardItems ? wizardItems : [];
    this.setConfigBlockColors(colors);
    this.createProgramInsideTree(program, langOut, key);
    this.createProgramOutsideTree(program, langOut, key);
  }

  setConfigBlockColors(colors) {
    if (Utils.isEmpty(colors)) return;
    configEditor.flow.setFromUserConfig(colors);
  }

  createProgramInsideTree(program, langOut, k) {
    for (const [key, value] of Object.entries(program[k])) {
      if (key === "blocks") {
        value.forEach((props) => {
          const { id, hook, prev } = props;
          let { type } = props;
          type = `${type}Block`;
          let { w, h } = this.getWidthAndHeigthBlock(type);
          w /= 1.5;
          h /= 1.5;
          const wrapType = type !== "wrapBlock" ? "" : props.vars.wrapType;
          this.createNewProgram(id, type, 0, 0, w, h, "", wrapType);
          const indexHook = this.c.program.findIndex(
            (block) => block.id === prev
          );
          const indexRing = this.c.program.length - 1;
          const hookArrowIndex = this.getIndexHook(
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
          this.c.program[indexRing].compileError =
            this.isFromTab && props.compileError
              ? props.compileError
              : { hasError: false, errorMessages: [] };
          this.c.program[indexRing].colors =
            this.isFromTab && props.colors ? props.colors : null;
          if (this.isFromTab && props.breakpoint) {
            this.c.program[indexRing].addBreakpoint();
          }
          this.c.interceptedProgram = {
            programRing: this.c.program[indexRing],
            programHook: this.c.program[indexHook],
            arrowType: hook,
          };
          this.c.eventHandler.dropInterceptedProgram();
          this.copyVariableProps(indexRing, props, langOut);
          this.copyWizardItems(indexRing, props, langOut);
          this.c.updateCanvas();
        });
      }
    }
    this.copyCode(k);
    this.getBlocksWithScope();
  }

  createProgramOutsideTree(program, langOut, k) {
    const outsideBlocks = [];
    for (const [key, value] of Object.entries(program[k])) {
      if (key === "blocksOutside") {
        value.forEach((props) => {
          const { id, ring } = props;
          let { type } = props;
          type = `${type}Block`;
          let { w, h } = this.getWidthAndHeigthBlock(type);
          w /= 1.5;
          h /= 1.5;
          const wrapType = type !== "wrapBlock" ? "" : props.vars.wrapType;
          this.createNewProgram(id, type, 0, 0, w, h, "", wrapType);
          if (ring === "not-occupied") {
            const { x, y, hasChildren } = props;
            const indexRing = this.c.program.length - 1;
            this.c.program[indexRing].x = x;
            this.c.program[indexRing].y = y;
            this.c.program[indexRing].colors =
              this.isFromTab && props.colors ? props.colors : null;
            if (hasChildren) this.createGraphNode(this.c.program[indexRing]);
            this.copyVariableProps(indexRing, props, langOut);
            outsideBlocks.push({ index: indexRing, ring });
            this.c.updateCanvas();
          } else {
            const { hook, prev } = props;
            const indexHook = this.c.program.findIndex(
              (block) => block.id === prev
            );
            const indexRing = this.c.program.length - 1;
            const hookArrowIndex = this.getIndexHook(
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
            this.c.program[indexRing].colors =
              this.isFromTab && props.colors ? props.colors : null;
            this.c.interceptedProgram = {
              programRing: this.c.program[indexRing],
              programHook: this.c.program[indexHook],
              arrowType: hook,
            };
            this.c.eventHandler.dropInterceptedProgram();
            this.copyVariableProps(indexRing, props, langOut);
            this.copyWizardItems(indexRing, props, langOut);
            outsideBlocks.push({ index: indexRing, ring });
            this.c.updateCanvas();
          }
        });
      }
    }
    this.copyCode(k);
    this.getBlocksWithScope();
    outsideBlocks.forEach((block) => {
      const { index, ring } = block;
      if (ring === "not-occupied") {
        this.c.program[index].hooks[0].occupied = false;
        this.c.blockState.update(this.c.program[index].id, { render: false });
        if (this.c.program[index].type === "doWhileBlock") {
          this.c.eventHandler.traverseInnerBlocks(this.c.program[index].id);
          this.c.eventHandler.moveInnerBlocks(this.c.program[index]);
        }
      } else {
        this.c.program[index].isLocked = true;
        this.c.program[index].hooks[0].isLocked = true;
        this.c.blockState.update(this.c.program[index].id, { render: false });
      }
    });
    this.c.updateCanvas();
  }

  createGraphNode(block) {
    this.c.graph.addNode(block.id);
    this.c.blockState.update(block.id, {
      arrowHook: "out",
      arrowType: "out",
      branch: "none",
      h: block.h,
      lastHook: "",
      render: false,
      type: block.type,
      w: block.w,
      x: block.x,
      y: block.y,
    });
  }

  newFlowchart({ projectCompositeId, projectName, isUndoRedo }) {
    const description = this.c.mdDescriptionContent;
    const code =
      this.c.editor !== null ? this.c.editor.session.getValue() : null;
    const fullCode = this.c.fullCode;
    const errors = this.c.editorErrors !== null ? this.c.editorErrors : null;
    this.c.newCanvasBlock(false, isUndoRedo);
    this.c.projectCompositeId = projectCompositeId;
    this.c.flowchartName = projectName;
    if (this.isFromTab || isUndoRedo) {
      this.c.mdDescriptionContent = description;
      this.c.logDescription();
      if (code) {
        this.c.log(
          `<div id="innerFlowchartIdeEditor"></div>`,
          "flowchartIdeEditor"
        );
        this.c.renderAceEditor({
          code,
          selectorId: "innerFlowchartIdeEditor",
          editor: "editor",
        });
        if (errors) {
          this.c.editorErrors = errors;
          this.c.setAndShowEditorAnnotations(errors);
        }
        this.c.fullCode = fullCode;
      }
    }
  }

  createNewProgram(id, type, x, y, w, h, code, wrapType) {
    this.c.program.push(
      BlockFactory.getImplementation(
        id,
        this.c,
        type,
        x,
        y,
        w,
        h,
        code,
        true,
        this.c.languageOutput,
        wrapType
      )
    );
  }

  getWidthAndHeigthBlock(type) {
    switch (type) {
      case "ifBlock":
        return { w: 60, h: 60 };
      default:
        return { w: 120, h: 60 };
    }
  }

  getIndexHook(typeBlock, typeArrow) {
    const types = ["out", "bottom-inner-out-yes", "bottom-inner-out-no"];
    switch (typeBlock) {
      case "codeBlock":
      case "defineBlock":
      case "inputBlock":
      case "outputBlock":
      case "wrapBlock":
        return 1;
      case "forBlock":
      case "whileBlock":
        return types.includes(typeArrow) ? 4 : 1;
      case "doWhileBlock":
        return types.includes(typeArrow) ? 5 : 1;
      case "ifBlock":
        return types.includes(typeArrow)
          ? 9
          : typeArrow === "inner-out-yes"
          ? 4
          : 3;
      default:
        return 0;
    }
  }

  copyVariableProps(indexRing, props, language) {
    const { type } = this.c.program[indexRing];
    const blockProps = this.getVarPropsByLanguage(language, type);
    blockProps.forEach((prop) => {
      this.c.program[indexRing][prop] = props.vars[prop] || "";
    });
  }

  copyCode(k) {
    const { program } = this.api;
    for (const [key, value] of Object.entries(program[k])) {
      if (key === "blocks" || key === "blocksOutside") {
        value.forEach((props) => {
          const { id, code } = props;
          const index = this.c.program.findIndex((block) => block.id === id);
          if (index < 0) return;
          this.c.program[index].code = code;
        });
      }
    }
    this.c.updateCanvas();
  }

  copyWizardItems(indexRing, props, language) {
    if (!props.wizard) return;
    const { wizardCode, droppedElements } = props.wizard;
    this.c.program[indexRing].wizardCode = wizardCode;
    this.c.program[indexRing].droppedElements = droppedElements;
  }

  setTabs() {
    this.c.markFlowchartAsSavedUnsaved(false);
    if (Utils.isEmpty(this.api)) return;
    const { program, langOut } = this.api;
    for (const [k, val] of Object.entries(program)) {
      if (k != 0 && k != 1) {
        const api = { langOut, program: { [k]: program[k] } };
        this.c.tabs.push({
          id: k,
          name: program[k].tab.name,
          type: program[k].tab.type,
          api,
          scale: 1,
          xScroll: 0,
          yScroll: 0,
          yScrollPalette: 0,
          isOpened: false,
          selected: false,
        });
      } else {
        this.c.tabs[k].api = { langOut, program: { [k]: program[k] } };
      }
    }
    this.c.markFlowchartAsSavedUnsaved(false);
  }

  setPalette(index) {
    if (Utils.isEmpty(this.api)) return;
    const paletteTab =
      this.api.program[index].tab.palette ||
      this.c.paletteManager.getAllBlocks();
    const palette = this.api.palette || paletteTab;
    this.c.generateNewPalette(palette);
    this.c.paletteManager.setReadyToRender(true);
  }

  getBlocksWithScope() {
    for (let i = 0; i < this.c.program.length; i++) {
      const { type } = this.c.program[i];
      if (
        [
          "startBlock",
          "whileBlock",
          "forBlock",
          "doWhileBlock",
          "ifBlock",
        ].includes(type)
      ) {
        this.setScopeVars(i, type);
      }
    }
  }

  setScopeVars(i, type) {
    switch (type) {
      case "startBlock":
        this.setGlobalScope(i);
        break;
      case "whileBlock":
        this.setWileAndDoWhileScope(i, "whileScope");
        break;
      case "forBlock":
        this.setForScope(i);
        break;
      case "doWhileBlock":
        this.setWileAndDoWhileScope(i, "doWhileScope");
        break;
      case "ifBlock":
        this.setIfScope(i);
        break;
      default:
        break;
    }
  }

  setGlobalScope(i) {
    for (let j = 0; j < this.c.program.length; j++) {
      const blk = this.c.program[j];
      if (!Utils.isEmpty(blk.code)) {
        if ("codeBlock" === blk.type && blk.isImport) {
          this.setImports(0, blk.code);
        } else if (!blk.parentId) {
          if (
            "defineBlock" === blk.type ||
            ("inputBlock" === blk.type &&
              (blk.radioOption === "defineVar" || blk.userInputEnabled))
          ) {
            this.addVariableToScope({
              i,
              j,
              scopeProp: "globalScope",
              scope: this.c.scopeType.GLOBAL_SCOPE,
              isInFlow: true,
            });
            if (
              Utils.isEmpty(blk.variableValue) ||
              ("inputBlock" === blk.type && blk.userInputEnabled)
            ) {
              this.c.program[i].importsAndInstancesState.update("scanner", {
                name: "scanner",
                value: "new Scanner(System.in)",
                declaration: "Scanner",
                declarationType: "Class",
                used: false,
              });
            }
          }
        }
      }
    }
  }

  setForScope(i) {
    if (this.c.program[i].radioVar === "defineVar") {
      this.addVariableToScope({
        i,
        j: i,
        scopeProp: "forScope",
        scope: this.c.scopeType.FOR_SCOPE,
        isInFlow: true,
      });
    }
    this.setLoopScope(i, "forScope");
  }

  setWileAndDoWhileScope(i, scopeProp) {
    this.setLoopScope(i, scopeProp);
  }

  setLoopScope(i, scopeProp) {
    const block = this.c.program[i];
    const children = this.c.getChildren(block.id);
    const scope =
      block.type === "whileBlock"
        ? this.c.scopeType.WHILE_SCOPE
        : block.type === "forBlock"
        ? this.c.scopeType.FOR_SCOPE
        : this.c.scopeType.DO_WHILE_SCOPE;
    this.iterateChildrenScope(i, scope, scopeProp, children);
  }

  setIfScope(i) {
    const block = this.c.program[i];
    const scopeYes = this.c.scopeType.IF_SCOPE_RIGHT;
    const scopePropYes = "ifScopeBranchRight";
    const scopeNo = this.c.scopeType.IF_SCOPE_LEFT;
    const scopePropNo = "ifScopeBranchLeft";
    const childrenBranchYes = this.c.getSortedChildren(block.id, "YES");
    const childrenBranchNo = this.c.getSortedChildren(block.id, "NO");
    this.iterateChildrenScope(i, scopeYes, scopePropYes, childrenBranchYes);
    this.iterateChildrenScope(i, scopeNo, scopePropNo, childrenBranchNo);
  }

  iterateChildrenScope(i, scope, scopeProp, children) {
    children.forEach((child) => {
      const { type, id } = child;
      const j = this.c.program.findIndex((b) => b.id === id);
      if (
        "defineBlock" === type ||
        ("inputBlock" === type &&
          (this.c.program[j].radioOption === "defineVar" ||
            this.c.program[j].userInputEnabled))
      ) {
        this.addVariableToScope({ i, j, scopeProp, scope, isInFlow: true });
        if (
          Utils.isEmpty(this.c.program[j].variableValue) ||
          ("inputBlock" === type && this.c.program[j].userInputEnabled)
        ) {
          this.c.program[0].importsAndInstancesState.update("scanner", {
            name: "scanner",
            value: "new Scanner(System.in)",
            declaration: "Scanner",
            declarationType: "Class",
            used: false,
          });
        }
      }
    });
  }

  setImports(i, impVal) {
    const importVarState =
      this.c.program[i].importsAndInstancesState.get("import");
    const value = !importVarState
      ? new Set([impVal])
      : new Set([...importVarState.value, impVal]);
    this.c.program[i].importsAndInstancesState.update("import", {
      name: "import",
      value,
      declarationType: "import",
    });
  }

  addVariableToScope({ i, j, scopeProp, scope, isInFlow }) {
    const blk = this.c.program[j];
    if (blk.type === "inputBlock" && blk.radioOption === "selectVar") return;
    this.c.program[i][scopeProp].update(blk.variableName, {
      id: blk.id,
      name: blk.variableName,
      value: blk.variableValue,
      declaration: blk.declaration,
      declarationType: blk.declarationType,
      scope,
      isInFlow,
    });
  }

  isJsonFile({ projectCompositeId, projectName }) {
    const executeGet = (data) =>
      this.getJsonFileContent({ projectCompositeId, projectName, data });
    const executeCreate = () =>
      this.createJsonFile({ projectCompositeId, projectName });
    this.jsonFileManager.isJsonFile({
      projectCompositeId,
      executeGet,
      executeCreate,
      isLoadContent: true,
    });
  }

  getJsonFileContent({ projectCompositeId, projectName, data }) {
    flowChartEditor.getProjectName(projectCompositeId);
    flowChartEditor.getMdDescriptionContent(projectCompositeId);
    const content = JSON.parse(data).content;
    this.api = Utils.parseJsonObject(content);
    this.setPalette("0");
    this.createFlowFromAPI({
      key: "0",
      projectCompositeId,
      projectName,
      isUndoRedo: false,
    });
    this.setTabs();
    this.c.centerStartBlock();
  }

  createJsonFile({ projectCompositeId, projectName }) {
    const content = this.jsonFileManager.getFlowchartJsonContent(
      this.c.languageOutput
    );
    this.saveJsonFile({ projectCompositeId, content }, () => {
      browxyStartUp.fileOperation.renameOpenedFile(
        `${projectCompositeId}/flowchart.json`,
        `${projectCompositeId}/flowchart.json`,
        "flowchart.json"
      );
      this.newFlowchart({ projectCompositeId, projectName, isUndoRedo: false });
      Utils.stopLoader();
    });
  }

  saveJsonFile({ projectCompositeId, content }, fn) {
    this.jsonFileManager.saveJsonFile(
      { projectCompositeId, content: JSON.stringify(content, null, 2) },
      fn
    );
  }

  downloadJSONFile() {
    const tabId = this.c.tabs[this.c.selectedTab].id;
    this.getBFS(this.c.graph)
      .getApiBlockProps(this.c.program, this.c.blockState, tabId)
      .saveAllApiTabs(tabId);
    this.jsonFileManager
      .createDownloadLink(
        `${this.c.flowchartName.toLowerCase()}_${new Date().toISOString()}.json`,
        JSON.stringify(this.api, null, 2)
      )
      .click();
  }
}
