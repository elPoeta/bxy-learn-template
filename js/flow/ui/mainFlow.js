class FlowChart {
  constructor() {
    this.canvas = null;
    this.API = null;
    this.flowAstAPI = {};
    this.workspaceChange = false;
    this.isCreatedFromFlow = false;
    this.topCompiler = document.querySelector("#bxy_compiler__top_container");
    //this.editorContainerWorkspace = document.querySelector('#bxy_compiler__editor-container');
    this.flowContainerWorkspace = document.querySelector("#flowContainer");
    this.horizontalDragBar = document.querySelector("#horizontalDragBar");
    this.verticalDragBar = document.querySelector("#verticalDragBar");
    //this.compilerConsole = document.querySelector('#compilerConsole');
    // this.sideNavigation = document.querySelector('#sideNavigation');
    // this.widthRight = document.querySelector('#bxy_compiler');
    //this.switchButton = document.querySelector('#switchButton');
    //this.switchButton.addEventListener('click', this.switchWorkspaceHandler.bind(this));
    this.btnLanguageFlow = document.querySelector("#flowTooltipLang");
    this.btnLanguageFlow.addEventListener(
      "click",
      this.changeLanguageHandler.bind(this)
    );
    this.flowLangCheckBox = document.querySelector("#langFlow");
    this.btnSettingsFlow = document.querySelector("#flowSettings");
    this.canvasToolContainer = document.querySelector("#canvasToolContainer");
    this.btnSettingsFlow.addEventListener(
      "click",
      this.settingsHandler.bind(this)
    );
    //this.storeRight = this.widthRight.style.right;
    //this.hideWorkspace.bind(this);
    //this.showEditorWorkspace.bind(this);
    //this.showConsole.bind(this);
    //this.hideConsole.bind(this);
    this.consoleState = false;
    this.runFromNull = false;
  }

  createCanvas() {
    this.canvas = new CanvasFlow(
      "flowContainer",
      "canvas",
      "canvas-info-box",
      "console-info-box",
      "console",
      "console-prompt",
      "console-box",
      0,
      40
    );
    this.flowSettings = new FlowSettings(this.canvas);
    this.canvas.resize();
    this.API = new FlowAPI(this.canvas);
    // tabbedEditor.loadConfiguration();
    this.canvas.markFlowchartAsSavedUnsaved(this.canvas.markAsUnsaved);
    this.dispatchNewFlowIdEvent();
    this.canvas.paletteManager.setReadyToRender(true);
    this.canvas.flowInfoConsoleState({
      classType: "remove",
      rotate: "rotate(0deg)",
      state: false,
      title: "Hide",
    });
    this.canvas.resize();
  }

  switchWorkspaceHandler(ev, isOpenProject = false) {
    this.workspaceChange = !this.workspaceChange;
    if (this.workspaceChange) {
      this.storeRight = this.widthRight.style.right;
      this.storeTopCompiler = this.topCompiler.style.bottom;
      this.storeHorizontalDragBar = this.horizontalDragBar.style.bottom;
      this.storeCompilerConsole = this.compilerConsole.style.height;
      this.hideManagerEditorWorkspaceElements("add");
      this.widthRight.style.right = 0;
      this.compilerConsole.classList.add("hide");
      this.flowContainerWorkspace.classList.remove("hide");
      this.canvasToolContainer.classList.remove("hide");
      this.resizeContainer(3);
      if (!this.canvas) {
        this.canvas = new CanvasFlow(
          "flowContainer",
          "canvas",
          "canvas-info-box",
          "console-info-box",
          "console",
          "console-prompt",
          "console-box",
          0,
          40
        );
        this.flowSettings = new FlowSettings(this.canvas);
        this.canvas.resize();
        this.API = new FlowAPI(this.canvas);
        tabbedEditor.loadConfiguration();
        if (!isOpenProject) this.canvas.activeTour = true;
      } else {
        if (!isOpenProject) this.getSelectedFolder();
      }
      this.canvas.markFlowchartAsSavedUnsaved(this.canvas.markAsUnsaved);
      this.dispatchNewFlowIdEvent();
      this.canvas.paletteManager.setReadyToRender(!isOpenProject);
      this.canvas.flowInfoConsoleState({
        classType: "remove",
        rotate: "rotate(0deg)",
        state: false,
        title: "Hide",
      });
      this.canvas.resize();
    } else {
      this.hideWorkspace();
    }
  }

  resizeContainer(count = 1) {
    if (typeof count !== "number" || count <= 0) return;
    const bxyHederHeight =
      document.querySelector(".bxy_site__header").offsetHeight;
    const bxyCompilerHeaderHeight = document.querySelector(
      ".bxy_compiler__header"
    ).offsetHeight;
    const height =
      window.innerHeight - bxyHederHeight - bxyCompilerHeaderHeight;
    document.querySelector("#flowContainer").style = `height: ${height}px;`;
    return this.resizeContainer(count - 1);
  }

  hideWorkspace(isOpenProgram = false) {
    if (isOpenProgram) this.workspaceChange = !this.workspaceChange;
    this.hideConsole();
    this.flowContainerWorkspace.classList.add("hide");
    this.canvasToolContainer.classList.add("hide");
    this.topCompiler.style.bottom = this.storeTopCompiler;
    this.hideManagerEditorWorkspaceElements("remove");
    this.widthRight.style.right = this.storeRight;
    this.compilerConsole.classList.remove("hide");
    this.horizontalDragBar.style.bottom = this.storeHorizontalDragBar;
    this.compilerConsole.style.height = this.storeCompilerConsole;
    tabbedEditor.resize();
  }

  hideManagerEditorWorkspaceElements(type) {
    [
      "editorContainerWorkspace",
      "horizontalDragBar",
      "verticalDragBar",
      "sideNavigation",
    ].forEach((el) => this[el].classList[type]("hide"));
  }

  showEditorWorkspace() {
    if (this.sideNavigation.classList.contains("hide")) {
      this.hideWorkspace(true);
    } else {
      this.hideWorkspace();
    }
  }

  showConsole(isOpenProject = false) {
    if (isOpenProject) {
      this.switchWorkspaceHandler(null, isOpenProject);
    } else {
      this.dispatchNewFlowIdEvent();
      this.horizontalDragBar.classList.remove("hide");
      this.compilerConsole.classList.remove("hide");
      const isCollapsed =
        this.canvas.collapseGrowConsole.getAttribute("data-collapsed");
      const rigthW =
        isCollapsed === "true"
          ? 0
          : +document.querySelector("#flowConsole").offsetWidth;
      this.horizontalDragBar.style = `left: 200px; right: ${rigthW}px;`;
      this.compilerConsole.style = `left: 200px; right: ${rigthW}px; background: #F0F0F0;`;
    }
    this.setConsoleState(true);
  }

  dispatchNewFlowIdEvent() {
    window.dispatchEvent(new Event("newFlowId"));
  }

  hideConsole() {
    //this.horizontalDragBar.classList.add("hide");
    //this.compilerConsole.classList.add("hide");
    //this.horizontalDragBar.style = "left: 0; right: 0;";
    //this.compilerConsole.style =
    //"left: 0; right:0; background: #F0F0F0; z-index: 20;";
    // this.setConsoleState(false);
  }

  setConsoleState(state) {
    this.consoleState = state;
  }

  getConsoleState() {
    return this.consoleState;
  }

  changeLanguageHandler(ev) {
    this.flowLangCheckBox.checked = !this.flowLangCheckBox.checked;
    CURRENT_LANG = this.flowLangCheckBox.checked ? "ES" : "EN";
    for (let i = 0; i < this.canvas.palette.length; i++) {
      const type = this.canvas.palette[i].type;
      this.canvas.palette[i].code = LANGUAGE_FLOW[CURRENT_LANG][type];
    }
    this.canvas.update();
  }

  settingsHandler(ev, indexActiveTab = 0) {
    this.flowSettings.render(indexActiveTab);
  }

  uuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  resetFlowchartEditor(count = 3) {
    if (document.querySelector("#containerMenuContext")) {
      document
        .querySelector("body")
        .removeChild(document.querySelector("body").childNodes[0]);
    }
    setTimeout(() => {
      this.resizeContainer(count);
      this.canvas.paletteManager.setReadyToRender(true);
      this.canvas.resize();
      this.canvas.restoreScale();
      this.canvas.update();
    }, 100);
  }

  setProjectProps(project) {
    if (
      !this.canvas.projectCompositeId ||
      this.canvas.projectCompositeId !== project.id.compositeId
    ) {
      if (this.runFromNull) {
        this.runFromNull = false;
        this.canvas.projectCompositeId = project.id.compositeId;
        this.canvas.pathClass = this.getPathOfMainClass(project);
        return;
      }
      this.canvas.languageOutput =
        project.projectProperties.language.toLowerCase();
      this.resetFlowProps();
      this.canvas.projectCompositeId = project.id.compositeId;
      this.openLoaders();
      this.API = new FlowAPI(this.canvas);
      const projectName = this.getNameFlow(project);
      this.canvas.pathClass = this.getPathOfMainClass(project);
      this.API.isJsonFile({
        projectCompositeId: project.id.compositeId,
        projectName,
        isLoadContent: true,
      });
    } else {
      this.canvas.pathClass = this.getPathOfMainClass(project);
    }
  }

  openLoaders() {
    this.canvas.logLoadingSpinner();
    this.canvas.loadingPalleteSpinner();
  }

  getNameFlow(project) {
    const mainClass = project.projectProperties.mainClass || "Flowchart";
    const splitMainClass = mainClass.split(".");
    return splitMainClass[splitMainClass.length - 1];
  }

  getPathOfMainClass(project) {
    const name = this.getNameFlow(project);
    const mainClass = project.projectProperties.mainClass || `domain.${name}`;
    return mainClass;
  }

  getMdDescriptionContent(compositeId) {
    if (this.isCreatedFromFlow) {
      this.isCreatedFromFlow = false;
      return;
    }
    this.checkMDFile(compositeId);
  }

  checkMDFile(compositeId, isRld = false) {
    defaultAjaxRequest
      .setUrl(IS_FLOWCHART_FILE)
      .courseTreeOperation(
        { projectCompositeId: compositeId, fileName: "description.md" },
        (data) => {
          if (data.error) {
            Dialog.noticeDialog({ title: "Message", text: data.message });
            Utils.stopLoader();
            return;
          }
          if (data) {
            this.loadMDFileContent(compositeId);
          } else {
            this.canvas.mdDescriptionContent = isRld
              ? "### file description.md does not exist"
              : "";
            this.canvas.logDescription();
          }
        }
      );
  }

  loadMDFileContent(compositeId) {
    const urlFile = `${compositeId}/description.md`;
    CompilerService.getTreeNodeContents(urlFile, {
      callback: (d) => {
        const content = JSON.parse(d).content;
        this.canvas.mdDescriptionContent = content;
        this.canvas.logDescription();
      },
    });
  }

  getSelectedFolder() {
    try {
      const selectedNode = $("#tree").jstree().get_selected();
      if (selectedNode.length && selectedNode.length === 1) {
        const regex = /(USER_|ALIEN_).*[0-9]$/g;
        const nodeId = selectedNode[0].split("/")[0];
        const node = $("#tree").jstree(true).get_node(nodeId);
        if (node.state.disabled) return;
        if (regex.test(nodeId)) {
          if (
            !this.canvas.projectCompositeId ||
            nodeId !== this.canvas.projectCompositeId
          ) {
            if (this.unsavedFlowchart()) {
              Dialog.confirmDialog(
                "Save flowchart",
                "You have an open unsaved flowchart project. Do you want to save the flowchart before opening a new one?",
                "Save",
                "CancelFlowSave",
                () => {
                  this.saveAndOpen(nodeId);
                },
                () => {
                  this.switchToSelectedProject(nodeId);
                }
              );
            } else {
              this.switchToSelectedProject(nodeId);
            }
          } else {
            this.canvas.paletteManager.setReadyToRender(true);
          }
        }
      }
    } catch (err) {
      this.canvas.paletteManager.setReadyToRender(true);
    }
  }

  saveAndOpen(nodeId) {
    const tabId = this.canvas.tabs[this.canvas.selectedTab].id;
    this.API.getBFS(this.canvas.graph)
      .getApiBlockProps(this.canvas.program, this.canvas.blockState, tabId)
      .saveAllApiTabs(tabId);
    this.saveJsonFile(
      {
        projectCompositeId: this.canvas.projectCompositeId,
        content: this.API.api,
      },
      () => {
        this.canvas.markFlowchartAsSavedUnsaved(false);
        this.switchToSelectedProject(nodeId);
        Utils.stopLoader();
      }
    );
  }

  saveJsonFile({ projectCompositeId, content }, fn) {
    const jsonFileManager = new JSONFileManager();
    jsonFileManager.saveJsonFile(
      { projectCompositeId, content: JSON.stringify(content, null, 2) },
      fn
    );
  }

  switchToSelectedProject(nodeId) {
    this.canvas.paletteManager.setReadyToRender(false);
    const node = $("#tree").jstree(true).get_node(nodeId);
    if (!node.state.disabled) {
      $("#tree")
        .jstree(true)
        .open_node(nodeId, (data) => {
          CompilerService.synchronizeProject(nodeId, {
            callback: (d) => {
              this.getProjectProperties(nodeId);
              this.canvas.projectName = node.text;
              this.writeProjectNameOnDocument();
            },
          });
        });
    }
  }

  getProjectProperties(nodeId) {
    defaultAjaxRequest
      .setUrl(`${GET_PROJECT_PROPERTIES}/${nodeId}`)
      .getJsonFromServer((data) => {
        if ([400, 401, 403].includes(data)) {
          throw new Error("An error was ocurred.");
        }
        const properties = Utils.parseJsonObject(data.properties);
        if (properties.enableFlowchart)
          this.setProjectProps(
            this.getProjectPropsOnSelectedFolder(nodeId, properties)
          );
      });
  }

  getProjectPropsOnSelectedFolder(nodeId, properties) {
    return {
      id: {
        compositeId: nodeId,
      },
      projectProperties: {
        mainClass: properties.mainClass,
        language: properties.language,
      },
    };
  }

  getProjectName(nodeId) {
    const startTime = new Date().getTime();
    const intervalGetNode = setInterval(() => {
      if ($("li#" + nodeId).length != 0) {
        const node = $("#tree").jstree("get_node", nodeId);
        if (node.text || (new Date().getTime() - startTime) / 1000 > 60) {
          clearInterval(intervalGetNode);
          this.canvas.projectName = node && node.text ? node.text : "Flowchart";
          this.writeProjectNameOnDocument();
        }
      }
    }, 5);
  }

  writeProjectNameOnDocument() {
    const flowProjectName = document.querySelector("#flowProjectName");
    if (!flowProjectName) return;
    if (!this.canvas.projectName) {
      flowProjectName.innerHTML = "";
      flowProjectName.title = "";
    } else {
      flowProjectName.innerHTML = this.canvas.projectName;
      flowProjectName.title = this.canvas.projectName;
    }
  }

  resetFlowProps() {
    this.resetFlowLogs();
    this.canvas.projectCompositeId = null;
    this.canvas.projectName = null;
    this.canvas.packageToImport = "package domain;";
    this.writeProjectNameOnDocument();
    ["markDownDesc", "scope", "flowchartIdeEditor", "logFlowOutput"].forEach(
      (id) => this.canvas.clearConsole(id)
    );
    this.canvas.generateNewPalette({});
    this.canvas.newCanvasBlock(true);
    this.canvas.initTabs();
    this.canvas.paletteManager.setReadyToRender(false);
    this.canvas.update();
  }

  resetFlowLogs() {
    this.canvas.editor = null;
    this.canvas.mdDescriptionContent = "";
    this.canvas.globalBreakpoint = {};
    this.canvas.breakpointRows = {};
    this.canvas.editorRows = {};
    this.canvas.xScroll = 0;
    this.canvas.yScroll = 0;
    this.resizeLogConsole();
    if (document.querySelector("#stepByStep-btnContainer")) {
      document.querySelector("#stepByStep-btnContainer").remove();
    }
  }

  unsavedFlowchart() {
    return (
      this.canvas &&
      this.canvas.projectCompositeId !== null &&
      this.canvas.markAsUnsaved &&
      !this.runFromNull
    );
  }

  resizeLogConsole() {
    document.querySelector(".console-editor").style.display = "none";
    document
      .querySelectorAll(".split-console")
      .forEach((el) => (el.style.height = "99%"));
  }
}
