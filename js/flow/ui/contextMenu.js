class ContextMenu extends ContextMenuBase {
  constructor(canvas, typeMenu) {
    super(canvas, [
      {
        id: 'executionItem', title: 'Run', tooltip: 'Execution flowchart',
        subMenu: [{ id: 'runItem', title: 'Start', tooltip: 'Run program' },
        { id: 'testItem', title: 'Test', tooltip: 'Test program' },
        { id: 'stepItem', title: 'Step by step', tooltip: 'run program step by step' },
        { id: 'debugItem', title: 'Debug', tooltip: 'debug program' }]
      },
      { id: 'saveItem', title: 'Save', tooltip: 'Save flowchart' },
      { id: 'settingsItem', title: 'Settings', tooltip: 'Config flowchart' },
      {
        id: 'editItem', title: 'Edit', tooltip: 'Restore workspace - paste blocks - undo/redo',
        subMenu: [
          { id: 'restoreItem', title: 'Restore', tooltip: 'Restore to default workspace' },
          { id: 'pasteItem', title: 'Paste', tooltip: 'Paste blocks' },
          { id: 'undoItem', title: 'Undo', tooltip: 'Undo changes' },
          { id: 'redoItem', title: 'Redo', tooltip: 'Redo changes' },
        ]
      },
      { id: 'showHideConsoleItem', title: 'Show Console', tooltip: 'Show/Hide Console' },
      { id: 'createFromCodeItem', title: 'Create from code', tooltip: 'Create flow from code' },
      {
        id: 'exportItem', title: 'Export', tooltip: 'Export flowchart as jpeg/json file',
        subMenu: [{ id: 'exportJpegItem', title: 'jpeg', tooltip: 'Export flowchart as jpeg file' },
        { id: 'exportJsonItem', title: 'json', tooltip: 'Export flowchart as json file' },
        { id: 'exportSourceItem', title: 'source', tooltip: 'Export source code' }]
      },
      { id: 'reportBugItem', title: 'Report bug', tooltip: 'Report flow bug' },
      { id: 'expandShrinkItem', title: 'Expand', tooltip: 'Expand/Shrink width blocks' }
    ]);
    this.compilerConsole = document.querySelector('#compilerConsole');
    this.typeMenu = typeMenu;
  }


  setContentConsoleText() {
    const consoleItem = document.querySelector('[data-ctxmenu="showHideConsoleItem"]');
    if (consoleItem.length > 0)
      consoleItem[4].textContent = this.compilerConsole.classList.contains('hide') ? 'Show Console' : 'Hide Console';
  }

  filterMenu() {
    if (this.c.languageOutput === 'java') {
      this.menuItems = this.menuItems.map(menuItem => {
        if (menuItem.subMenu) {
          menuItem.subMenu = menuItem.subMenu.filter(subMenu => subMenu.id !== 'stepItem');
        }
        return menuItem;
      });
    }
    if (this.c.languageOutput === 'javascript') {
      this.menuItems = this.menuItems.map(menuItem => {
        if (menuItem.subMenu) {
          menuItem.subMenu = menuItem.subMenu.filter(subMenu => subMenu.id !== 'debugItem');
        }
        return menuItem;
      });
    }
    const title = this.compilerConsole.classList.contains('hide') ? 'Show Console' : 'Hide Console';
    this.menuItems[4].title = title;
    if (this.c.copyPaste.copiedBlocks.length === 0 || this.c.selectedTab === 1) {
      this.menuItems = this.menuItems.map(menuItem => {
        if (menuItem.subMenu) {
          menuItem.subMenu = menuItem.subMenu.filter(subMenu => subMenu.id !== 'pasteItem');
        }
        return menuItem;
      });
    }

    this.menuItems[this.menuItems.length - 1].title = !this.c.expanded ? 'Expand' : 'Shrink';
    return this;
  }

  handlerItems(itemId = 'defaultItem') {
    this.hideContextMenu();
    const item = {
      'runItem': () => this.run(),
      'testItem': () => this.test(),
      'saveItem': () => this.save(),
      'settingsItem': () => this.settings(),
      'showHideConsoleItem': () => this.showHideConsole(),
      'pasteItem': () => this.paste(),
      'restoreItem': () => this.restoreCanvas(),
      'undoItem': () => this.undo(),
      'redoItem': () => this.redo(),
      'stepItem': () => this.stepByStep(),
      'debugItem': () => this.debug(),
      'reportBugItem': () => this.reportBug(),
      'expandShrinkItem': () => this.expandShrink(),
      'createFromCodeItem': () => this.createFromCode(),
      'exportJpegItem': () => this.exportAsJpeg(),
      'exportJsonItem': () => this.exportAsJson(),
      'exportSourceItem': () => this.exportAsSource(),
      'defaultItem': () => { },
      'executionItem': () => { },
      'editItem': () => { },
      'exportItem': () => { }
    }
    return item[itemId]();
  }

  run() {
    if (!this.c.validRun()) return;
    this.c.run(false);
  }

  test() {
    this.c.runTests();
  }

  save() {
    this.c.flowchartStore.saveBlocksToFile(this.c.tabs[this.c.selectedTab].id);
    if (!this.c.projectCompositeId) return;
    this.c.markFlowchartAsSavedUnsaved(false);
  }

  settings() {
    flowChartEditor.settingsHandler();
  }

  showHideConsole() {
    if (this.compilerConsole.classList.contains('hide')) {
      flowChartEditor.showConsole();
    } else {
      flowChartEditor.hideConsole();
    }
  }

  restoreCanvas() {
    flowChartEditor.resetFlowchartEditor();
  }

  undo() {
    const state = this.c.undoRedoManager.undo();
    this.c.undoRedo(state);
  }

  redo() {
    const state = this.c.undoRedoManager.redo();
    this.c.undoRedo(state);
  }

  paste() {
    this.c.copyPaste.paste(this.coords);
  }

  stepByStep() {
    if (!this.c.validRun() || !Utils.isEmpty(this.c.globalBreakpoint)) return;
    new StepButton('stepBtn', 'Next').render();
    this.c.startStepByStepJavascriptCode();
  }

  debug() {
    this.c.debugFlow();
  }

  reportBug() {
    new ReportBugFlow(this.c).show();
  }

  expandShrink() {
    this.c.expandShrinkBlocks();
  }

  exportAsJpeg() {
    new Screenshot(this.c).showForm();
  }

  exportAsJson() {
    flowChartEditor.API.downloadJSONFile();
  }

  exportAsSource() {
    this.c.exportSourceCode();
  }

  createFromCode() {
  	try {
      const selectedNode = $('#tree').jstree().get_selected();
      if(selectedNode.length && selectedNode.length === 1) {
        const regex = /(USER_|ALIEN_).*[0-9]$/g;
        const nodeId = selectedNode[0].split('/')[0];
        const node = $('#tree').jstree(true).get_node(nodeId);
        if(this.c.projectCompositeId && nodeId !== this.c.projectCompositeId){
          Dialog.confirmDialog("Load from code",
        	  `<span class="prj-name color-red">Are you sure that you want to load a new flowchart?</span>`,
        	  "Yes",
        	  "confirmProjectDeletionButton",
        	  () => {
        	    this.createFromCodeHandler(nodeId);
        	  },
        	  () => { });
        	
        } else {
        	  this.createFromCodeHandler(nodeId);
        }
        
      } else {
      	  this.createFromCodeErrorMessage('There is more than one project/file selected in the file tree');
      }
  	} catch(error) {
  		 this.createFromCodeErrorMessage('There is no project selected or open, in the file tree');
  	} 
  }
  
  createFromCodeHandler(nodeId) {
  	defaultAjaxRequest
    .setUrl(`${GET_PROJECT_PROPERTIES}/${nodeId}`)
    .getJsonFromServer(data => {
      if ([400, 401, 403].includes(data)) {
    	  throw new Error();
      }
      const properties = Utils.parseJsonObject(data.properties);
      if(['java', 'javascript'].includes(properties.language.toLowerCase())) {
        this.loadCode(properties, nodeId);   	
      } else {
      	this.createFromCodeErrorMessage(`${data.properties.language} language is not supported by browxy flowchart, available languages ​​[java - javascript]`);
      }
    });
  }
  
  loadCode(properties, nodeId) {
    const path = this.getSourceMainPath(properties, nodeId);
    const packageToImport = this.getPackageToImport(properties);
    const mainSourceFile = properties.mainSourceFile || 'domain.Flowchart';
    const language =  properties.language.toLowerCase();
    const pathClass = language === 'java' ? properties.mainClass : 'domain.FlowChart';
    const projectName = language === 'java' ? mainSourceFile.substring(mainSourceFile.lastIndexOf("/")  + 1, mainSourceFile.length).split('\.')[0] : 'Flowchart';
    this.readCode({ path, packageToImport, id: nodeId, language, pathClass, name: projectName, description: this.c.mdDescriptionContent });
  }

  createFromCodeErrorMessage(message) {
  	 this.c.log(`<div style='color: red; margin-top: 5px;' >${message}</div>`, 'logFlowOutput');
     Dialog.noticeDialog({ title: "Error", text: `<span style='color:red;'>${message}</span>` });
  }

  getSourceMainPath(properties, projectCompositeId) {
    const mainSourceFile = properties.mainSourceFile.replace(/\/\/+/g, '/');
    return this.c.languageOutput === 'java' ?
      `${projectCompositeId}/source/${mainSourceFile}` :
      `${projectCompositeId}/${mainSourceFile}`;
  }

  getPackageToImport(properties) {
    const pkg = this.c.languageOutput === 'java' ?
      properties.mainSourceFile
        .substring(0, properties.mainSourceFile.lastIndexOf("/")).replaceAll('\/', '.')
      : 'domain';
    return Utils.isEmpty(pkg) ? '' : `package ${pkg.replace(/\.$/, '')};`;
  }

  readCode(props) {
  	const { path, packageToImport, id, language, pathClass, name } = props;
    FlowSpinner.mount();
    CompilerService.getTreeNodeContents(path, {
      callback: d => {
        FlowSpinner.unMount();
        const sourceCode = JSON.parse(d).content;
        this.setFlowProps(props);
        const backupProperties = this.backupProps(packageToImport);
        const palette = this.c.mainPalette;
        const wizardItems = this.c.wizardItems;
        flowChartEditor.resetFlowProps();
        setTimeout(() => {
          this.setFlowProps(backupProperties);
          new EditorFlowForm(this.c, false, packageToImport)
            .loadWithoutForm(sourceCode, id, palette, wizardItems).createWithoutForm();
        }, 100);
      }
    });
  }

  backupProps(packageToImport) {
    return {
      language: this.c.languageOutput,
      pathClass: this.c.pathClass,
      name: this.c.flowchartName,
      id: this.c.projectCompositeId,
      description: this.c.mdDescriptionContent,
      packageToImport
    }
  }

  setFlowProps(props) {
    const { id, name, language, pathClass, description, packageToImport } = props;
    this.c.projectCompositeId = id;
    this.c.languageOutput = language;
    this.c.pathClass = pathClass;
    this.c.flowchartName = name;
    this.c.mdDescriptionContent = description;
    this.c.packageToimport = packageToImport;
  }

  getStepByStepButtons() {
    return `<button id="stepBtnRun" class="step-btn step-grow-btn">
              <div class="step-btn-icon">
                ${this.getIcon('stepItem', true)}
              </div>
              <div class="step-btn-txt" style="color:green;">Next</div>
            </button>
            <button id="stepBtnStop" class="step-btn step-grow-btn">  
              <div class="step-btn-icon">
                ${this.getIcon('stopItem')}
              </div>
              <div class="step-btn-txt" style="color:red;">Stop</div>
            </button>`;
  }

  getIcon(type, isBtn = false) {
    const stepStyle = isBtn ? 'fill:green; font-size: 2em;' : 'fill:#000;'
    switch (type) {
      case 'executionItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
      <g>
        <g>
          <path d="M501.854,184.552c-2.578-8.853-11.839-13.94-20.697-11.364c-8.853,2.577-13.941,11.843-11.364,20.696
            c5.85,20.099,8.816,40.998,8.816,62.117c0,122.746-99.862,222.609-222.609,222.609c-62.884,0-122.172-26.574-164.092-72.352
            h32.882c9.22,0,16.696-7.475,16.696-16.696c0-9.22-7.475-16.584-16.696-16.584H58.007c-10.033,0-18.905,9.186-16.696,20.123
            v63.244c0,9.22,7.475,16.696,16.696,16.696s16.473-7.475,16.473-16.696v-19.755C122.124,484.444,187.305,512,256,512
            c141.158,0,256-114.842,256-256C512,231.721,508.586,207.683,501.854,184.552z"/>
        </g>
      </g>
      <g>
        <g>
          <path d="M456.348,38.957c-9.22,0-16.696,7.475-16.696,16.696V77.82C391.81,28.482,325.852,0,256,0C114.842,0,0,114.842,0,256
            c0,24.278,3.413,48.314,10.144,71.443c2.576,8.851,11.839,13.942,20.696,11.364c8.853-2.577,13.942-11.843,11.365-20.696
            c-5.849-20.095-8.814-40.992-8.814-62.111c0-122.746,99.862-222.609,222.609-222.609c62.897,0,122.174,26.568,164.092,72.348
            h-30.526c-9.22,0-16.696,7.475-16.696,16.696c0,9.22,7.475,16.696,16.696,16.696c12.023,0,59.834,0,66.783,0
            c9.22,0,16.696-7.475,16.696-16.696V55.652C473.043,46.432,465.568,38.957,456.348,38.957z"/>
        </g>
      </g>
      <g>
        <g>
          <path d="M372.978,205.915h-83.59V89.046c0-16.463-21.341-22.962-30.475-9.261L125.348,280.133
            c-7.393,11.089,0.591,25.845,13.891,25.845h83.478v116.981c0,16.414,21.423,23.005,30.586,9.26l133.565-200.348
            C394.261,220.782,386.277,205.915,372.978,205.915z M255.997,367.816v-78.423c0-9.22-7.364-16.696-16.584-16.696h-68.979v-0.001
            l85.674-128.51v78.423c0,9.22,7.475,16.584,16.696,16.584h68.979L255.997,367.816z"/>
        </g>
      </g>
      </svg>`;
      case 'runItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
        <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM7 6l8 4-8 4V6z"/>\
        </svg>`;
      case 'testItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" width="512px" height="512px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M501.1 395.7L384 278.6c-23.1-23.1-57.6-27.6-85.4-13.9L192 158.1V96L64 0 0 64l96 128h62.1l106.6 106.6c-13.6 27.8-9.2 62.3 13.9 85.4l117.1 117.1c14.6 14.6 38.2 14.6 52.7 0l52.7-52.7c14.5-14.6 14.5-38.2 0-52.7zM331.7 225c28.3 0 54.9 11 74.9 31l19.4 19.4c15.8-6.9 30.8-16.5 43.8-29.5 37.1-37.1 49.7-89.3 37.9-136.7-2.2-9-13.5-12.1-20.1-5.5l-74.4 74.4-67.9-11.3L334 98.9l74.4-74.4c6.6-6.6 3.4-17.9-5.7-20.2-47.4-11.7-99.6.9-136.6 37.9-28.5 28.5-41.9 66.1-41.2 103.6l82.1 82.1c8.1-1.9 16.5-2.9 24.7-2.9zm-103.9 82l-56.7-56.7L18.7 402.8c-25 25-25 65.5 0 90.5s65.5 25 90.5 0l123.6-123.6c-7.6-19.9-9.9-41.6-5-62.7zM64 472c-13.2 0-24-10.8-24-24 0-13.3 10.7-24 24-24s24 10.7 24 24c0 13.2-10.7 24-24 24z"/>
          </svg>`;
      case 'saveItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path d="M15.173 2h-11.173c-1.101 0-2 0.9-2 2v12c0 1.1 0.899 2 2 2h12c1.101 0 2-0.9 2-2v-10.873l-2.827-3.127zM14 8c0 0.549-0.45 1-1 1h-6c-0.55 0-1-0.451-1-1v-5h8v5zM13 4h-2v4h2v-4z"></path>
          </svg>`;
      case 'settingsItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 15.516q1.453 0 2.484-1.031t1.031-2.484-1.031-2.484-2.484-1.031-2.484 1.031-1.031 2.484 1.031 2.484 2.484 1.031zM19.453 12.984l2.109 1.641q0.328 0.234 0.094 0.656l-2.016 3.469q-0.188 0.328-0.609 0.188l-2.484-0.984q-0.984 0.703-1.688 0.984l-0.375 2.625q-0.094 0.422-0.469 0.422h-4.031q-0.375 0-0.469-0.422l-0.375-2.625q-0.891-0.375-1.688-0.984l-2.484 0.984q-0.422 0.141-0.609-0.188l-2.016-3.469q-0.234-0.422 0.094-0.656l2.109-1.641q-0.047-0.328-0.047-0.984t0.047-0.984l-2.109-1.641q-0.328-0.234-0.094-0.656l2.016-3.469q0.188-0.328 0.609-0.188l2.484 0.984q0.984-0.703 1.688-0.984l0.375-2.625q0.094-0.422 0.469-0.422h4.031q0.375 0 0.469 0.422l0.375 2.625q0.891 0.375 1.688 0.984l2.484-0.984q0.422-0.141 0.609 0.188l2.016 3.469q0.234 0.422-0.094 0.656l-2.109 1.641q0.047 0.328 0.047 0.984t-0.047 0.984z"></path>
        </svg>`;
      case 'showHideConsoleItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M4.707 17.707l6-6c0.391-0.391 0.391-1.024 0-1.414l-6-6c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414l5.293 5.293-5.293 5.293c-0.391 0.391-0.391 1.024 0 1.414s1.024 0.391 1.414 0zM12 20h8c0.552 0 1-0.448 1-1s-0.448-1-1-1h-8c-0.552 0-1 0.448-1 1s0.448 1 1 1z"></path>
        </svg>`;
      case 'restoreItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
          <path d="M5.516 14.224c-2.262-2.432-2.222-6.244 0.128-8.611 0.962-0.969 2.164-1.547 3.414-1.736l-0.069-2.077c-1.755 0.213-3.452 0.996-4.797 2.351-3.149 3.17-3.187 8.289-0.123 11.531l-1.741 1.752 5.51 0.301-0.015-5.834-2.307 2.323zM12.163 2.265l0.015 5.834 2.307-2.322c2.262 2.434 2.222 6.246-0.128 8.611-0.961 0.969-2.164 1.547-3.414 1.736l0.069 2.076c1.755-0.213 3.452-0.996 4.798-2.35 3.148-3.172 3.186-8.291 0.122-11.531l1.741-1.754-5.51-0.3z"></path>
          </svg>`;
      case 'undoItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M12.516 8.016q3.422 0 6.141 2.016t3.797 5.203l-2.344 0.75q-0.797-2.438-2.883-3.961t-4.711-1.523q-2.906 0-5.156 1.875l3.656 3.609h-9v-9l3.563 3.609q2.953-2.578 6.938-2.578z"></path>
          </svg>`;
      case 'redoItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M18.422 10.594l3.563-3.609v9h-9l3.656-3.609q-2.25-1.875-5.156-1.875-2.391 0-4.617 1.594t-2.977 3.891l-2.344-0.75q1.031-3.188 3.773-5.203t6.164-2.016q3.984 0 6.938 2.578z"></path>
          </svg>`;
      case 'pasteItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M10.5 20H2a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2h1V3l2.03-.4a3 3 0 0 1 5.94 0L13 3v1h1a2 2 0 0 1 2 2v1h-2V6h-1v1H3V6H2v12h5v2h3.5zM8 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm2 4h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2zm0 2v8h8v-8h-8z"/>
              </svg>`;
      case 'stepItem':
        return `<svg class="icon-svg" style="${stepStyle}" data-ctxmenu="${type}" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        width="515.458px" height="515.458px" viewBox="0 0 515.458 515.458" style="enable-background:new 0 0 515.458 515.458;"
        xml:space="preserve">
        <g>
        <path d="M298.794,386.711c27.805,9.522,52.357,15.587,87.633,26.427C372.875,584.374,210.952,516.371,298.794,386.711z
          M443.366,229.409c-1.826-51.415-10.882-118.86-83.017-108.292c-33.815,8.825-58.8,45.962-70.551,110.035
         c-6.454,35.229-2.701,84.678,4.912,114.32c6.951,20.889,4.587,19.605,12.058,23.572c28.916,6.514,57.542,13.725,86.693,21.078
         C423.075,369.209,447.397,258.182,443.366,229.409z M220.752,225.463c7.607-29.646,11.36-79.095,4.909-114.32
         C213.919,47.067,188.931,9.924,155.11,1.105C82.975-9.463,73.919,57.981,72.093,109.399
         c-4.031,28.768,20.294,139.802,49.911,160.711c29.149-7.353,57.771-14.558,86.696-21.078
         C216.162,245.069,213.798,246.352,220.752,225.463z M129.029,293.132c13.547,171.234,175.47,103.231,87.63-26.427
         C188.854,276.228,164.304,282.292,129.029,293.132z"/>
        </g>
        </svg>`;
      case 'debugItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M15.3 14.89l2.77 2.77a1 1 0 0 1 0 1.41 1 1 0 0 1-1.41 0l-2.59-2.58A5.99 5.99 0 0 1 11 18V9.04a1 1 0 0 0-2 0V18a5.98 5.98 0 0 1-3.07-1.51l-2.59 2.58a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41l2.77-2.77A5.95 5.95 0 0 1 4.07 13H1a1 1 0 1 1 0-2h3V8.41L.93 5.34a1 1 0 0 1 0-1.41 1 1 0 0 1 1.41 0l2.1 2.1h11.12l2.1-2.1a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41L16 8.41V11h3a1 1 0 1 1 0 2h-3.07c-.1.67-.32 1.31-.63 1.89zM15 5H5a5 5 0 1 1 10 0z"/>
                </svg>`;
      case 'reportBugItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 324.274 324.274" style="enable-background:new 0 0 324.274 324.274;" xml:space="preserve">
      <g>
       <path d="M34.419,298V22h138.696h0.841v33.411c0,8.301,6.753,15.055,15.053,15.055h33.154v88.5c2.443-0.484,4.957-0.75,7.528-0.75
         c5.087,0,9.962,0.994,14.472,2.804V64.006c0-1.326-0.526-2.598-1.464-3.536L183.694,1.464C182.755,0.527,181.484,0,180.158,0
         H27.472c-8.3,0-15.053,6.753-15.053,15.054v289.893c0,8.301,6.753,15.054,15.053,15.054h111.884
         c-1.256-6.713,1.504-13.831,7.559-17.83c2.341-1.546,4.692-2.919,7.034-4.17H34.419z"/>
       <path d="M308.487,310.515c-12.254-8.092-25.057-11.423-33.599-12.795c6.02-9.685,9.564-21.448,9.564-34.129
         c0-9.12-1.824-17.889-5.174-25.781c8.22-1.738,18.908-5.176,29.209-11.98c3.457-2.283,4.408-6.935,2.126-10.392
         c-2.283-3.456-6.936-4.407-10.392-2.125c-10.742,7.094-22.229,9.723-29.102,10.698c-3.459-4.387-7.5-8.249-12.077-11.394
         c0.859-3.081,1.294-6.265,1.294-9.509c0-17.861-13.062-32.393-29.117-32.393c-16.055,0-29.115,14.531-29.115,32.393
         c0,3.244,0.435,6.428,1.294,9.509c-4.577,3.145-8.618,7.007-12.077,11.394c-6.873-0.975-18.358-3.603-29.102-10.698
         c-3.456-2.282-8.108-1.331-10.392,2.125c-2.282,3.456-1.331,8.109,2.126,10.392c10.301,6.803,20.988,10.241,29.208,11.979
         c-3.351,7.893-5.175,16.661-5.175,25.781c0,12.681,3.544,24.444,9.563,34.129c-8.541,1.372-21.343,4.703-33.597,12.794
         c-3.456,2.283-4.408,6.935-2.126,10.392c1.442,2.184,3.83,3.368,6.266,3.368c1.419,0,2.854-0.402,4.126-1.242
         c16.62-10.975,35.036-11.269,35.362-11.272c0.639-0.002,1.255-0.093,1.847-0.245c8.877,7.447,19.884,11.861,31.791,11.861
         c11.907,0,22.914-4.415,31.791-11.861c0.598,0.153,1.22,0.244,1.865,0.245c0.183,0,18.499,0.148,35.346,11.272
         c1.272,0.84,2.707,1.242,4.126,1.242c2.434,0,4.823-1.184,6.266-3.368C312.895,317.45,311.943,312.797,308.487,310.515z
          M238.719,296.005c0,4.142-3.357,7.5-7.5,7.5c-4.142,0-7.5-3.358-7.5-7.5v-64.83c0-4.142,3.358-7.5,7.5-7.5
         c4.143,0,7.5,3.358,7.5,7.5V296.005z"/>
       <path d="M143.627,49.624h-78c-4.418,0-8,3.582-8,8c0,4.418,3.582,8,8,8h78c4.418,0,8-3.582,8-8
         C151.627,53.206,148.045,49.624,143.627,49.624z"/>
       <path d="M143.627,99.624h-78c-4.418,0-8,3.582-8,8c0,4.419,3.582,8,8,8h78c4.418,0,8-3.581,8-8
         C151.627,103.206,148.045,99.624,143.627,99.624z"/>
       <path d="M143.627,149.624h-78c-4.418,0-8,3.582-8,8c0,4.419,3.582,8,8,8h78c4.418,0,8-3.581,8-8
         C151.627,153.206,148.045,149.624,143.627,149.624z"/>
     </g>
     </svg>`;
      case 'expandShrinkItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          width="64px" height="64px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
          <line fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" x1="21" y1="0" x2="21" y2="64"/>
          <line fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" x1="43" y1="64" x2="43" y2="0"/>
          <polyline fill="none" stroke="#000000" stroke-width="2" stroke-linejoin="bevel" stroke-miterlimit="10" points="8,25 1,32 8,39"/>
          <line fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" x1="1" y1="32" x2="21" y2="32"/>
          <polyline fill="none" stroke="#000000" stroke-width="2" stroke-linejoin="bevel" stroke-miterlimit="10" points="56,39 63,32 56,25 "/>
         <line fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" x1="63" y1="32" x2="43" y2="32"/>
       </svg>`;
      case 'createFromCodeItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                 viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
            <g>
             <g>
              <path d="M249.429,214.144c-3.968-1.685-8.576-0.747-11.627,2.304l-21.333,21.333c-4.16,4.16-4.16,10.923,0,15.083
                c4.16,4.16,10.923,4.16,15.083,0l3.115-3.115V288c0,5.888,4.779,10.667,10.667,10.667S256,293.888,256.021,288v-64
                C256.021,219.691,253.419,215.787,249.429,214.144z"/>
             </g>
            </g>
            <g>
              <g>
                <path d="M313.429,214.144c-3.947-1.685-8.576-0.747-11.627,2.304l-21.333,21.333c-4.16,4.16-4.16,10.923,0,15.083
                  c4.16,4.16,10.923,4.16,15.083,0l3.115-3.115V288c0,5.888,4.779,10.667,10.667,10.667S320,293.888,320.021,288v-64
                  C320.021,219.691,317.419,215.787,313.429,214.144z"/>
              </g>
             </g>
             <g>
              <g>
                <path d="M377.429,214.144c-3.968-1.685-8.555-0.747-11.627,2.304l-21.333,21.333c-4.16,4.16-4.16,10.923,0,15.083
                  c4.16,4.16,10.923,4.16,15.083,0l3.115-3.115V288c0,5.888,4.779,10.667,10.667,10.667c5.888,0,10.667-4.779,10.688-10.667v-64
                  C384.021,219.691,381.419,215.787,377.429,214.144z"/>
              </g>
             </g>
             <g>
              <g>
                <path d="M181.333,213.333h-42.667c-5.888,0-10.667,4.779-10.667,10.667v64c0,5.888,4.779,10.667,10.667,10.667h42.667
                  c5.888,0,10.667-4.779,10.667-10.667v-64C192,218.112,187.221,213.333,181.333,213.333z M170.667,277.333h-21.333v-42.667h21.333
                  V277.333z"/>
              </g>
              </g>
              <g>
               <g>
                 <path d="M313.429,342.144c-3.947-1.664-8.576-0.747-11.627,2.304l-21.333,21.333c-4.16,4.16-4.16,10.923,0,15.083
                   c4.16,4.16,10.923,4.16,15.083,0l3.115-3.115V416c0,5.888,4.779,10.667,10.667,10.667S320,421.888,320.021,416v-64
                   C320.021,347.691,317.419,343.787,313.429,342.144z"/>
               </g>
               </g>
               <g>
                <g>
                  <path d="M377.429,342.144c-3.968-1.664-8.555-0.747-11.627,2.304l-21.333,21.333c-4.16,4.16-4.16,10.923,0,15.083
                    c4.16,4.16,10.923,4.16,15.083,0l3.115-3.115V416c0,5.888,4.779,10.667,10.667,10.667c5.888,0,10.667-4.779,10.688-10.667v-64
                    C384.021,347.691,381.419,343.787,377.429,342.144z"/>
                </g>
                </g>
                <g>
                  <g>
                   <path d="M164.096,342.144c-3.968-1.664-8.576-0.747-11.627,2.304l-21.333,21.333c-4.16,4.16-4.16,10.923,0,15.083
                     c4.16,4.16,10.923,4.16,15.083,0l3.115-3.115V416c0,5.888,4.779,10.667,10.667,10.667s10.667-4.779,10.688-10.667v-64
                     C170.688,347.691,168.085,343.787,164.096,342.144z"/>
                </g>
                </g>
                <g>
                  <g>
                    <path d="M245.333,341.333h-42.667c-5.888,0-10.667,4.779-10.667,10.667v64c0,5.888,4.779,10.667,10.667,10.667h42.667
                      c5.888,0,10.667-4.779,10.667-10.667v-64C256,346.112,251.221,341.333,245.333,341.333z M234.667,405.333h-21.333v-42.667h21.333
                      V405.333z"/>
                 </g>
                 </g>
                 <g>
                  <g>
                   <path d="M437.333,0H202.667c-1.429,0-2.837,0.299-4.139,0.832c-0.405,0.171-0.704,0.491-1.067,0.725
                    c-0.811,0.469-1.664,0.896-2.347,1.557l-128,128c-0.491,0.491-0.768,1.152-1.152,1.728c-0.384,0.576-0.875,1.067-1.131,1.707
                    c-0.533,1.301-0.832,2.688-0.832,4.117v362.667C64,507.221,68.779,512,74.667,512h362.667c5.888,0,10.667-4.779,10.667-10.667
                    V10.667C448,4.779,443.221,0,437.333,0z M192,36.416V128h-91.584L192,36.416z M426.667,490.667H85.333V149.333h117.333
                    c5.888,0,10.667-4.779,10.667-10.667V21.333h213.333V490.667z"/>
                  </g>
                  </g>
             </svg>`;
      case 'exportItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
        <path d="M15 15h-13v-9h2.595c0 0 0.689-0.896 2.17-2h-5.765c-0.553 0-1 0.449-1 1v11c0 0.553 0.447 1 1 1h15c0.553 0 1-0.447 1-1v-3.746l-2 1.645v1.101zM13.361 8.050v3.551l6.639-5.201-6.639-4.999v3.131c-8.061 0-8.061 7.968-8.061 7.968 2.282-3.748 3.686-4.45 8.061-4.45z"></path>
        </svg>`;
      case 'exportJpegItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type} "version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
           <path d="M26 28h-20v-4l6-10 8.219 10 5.781-4v8z"></path>
           <path d="M26 15c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3c1.657 0 3 1.343 3 3z"></path>
           <path d="M28.681 7.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-15.5c-1.378 0-2.5 1.121-2.5 2.5v27c0 1.378 1.122 2.5 2.5 2.5h23c1.378 0 2.5-1.122 2.5-2.5v-19.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 5.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-23c-0.271 0-0.5-0.229-0.5-0.5v-27c0-0.271 0.229-0.5 0.5-0.5 0 0 15.499-0 15.5 0v7c0 0.552 0.448 1 1 1h7v19.5z"></path>
          </svg>`;
      case 'exportJsonItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type} width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
           <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.5 5H9a2 2 0 0 0-2 2v2c0 1-.6 3-3 3 1 0 3 .6 3 3v2a2 2 0 0 0 2 2h.5m5-14h.5a2 2 0 0 1 2 2v2c0 1 .6 3 3 3-1 0-3 .6-3 3v2a2 2 0 0 1-2 2h-.5"/>
          </svg>`;
      case 'exportSourceItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type} xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
         </svg>`;
      case 'editItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type} version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 485 485" style="enable-background:new 0 0 485 485;" xml:space="preserve">
          <g>
           <polygon points="30,30 106,30 106,0 0,0 0,106 30,106   "/>
           <polygon points="379,0 379,30 455,30 455,106 485,106 485,0   "/>
           <rect x="197.16" width="91" height="30"/>
          <rect x="197.16" y="455" width="91" height="30"/>
          <polygon points="455,455 379,455 379,485 485,485 485,379 455,379  "/>
          <rect x="455" y="197" width="30" height="91"/>
          <rect y="197" width="30" height="91"/>
          <path d="M274.484,270.622l-60.103-60.104l38.661-38.661l60.104,60.103L274.484,270.622z"/>
          <path d="M25,460l68.463-19.986l-48.477-48.477L25,460z"/>
          <path d="M60.383,364.508l132.781-132.781l60.104,60.104L120.487,424.612L60.383,364.508z"/>
         </g>
       </svg>`;
      default:
        return ``;
    }
  }
}
