class SaveFlowchartCodeToFile {
  constructor() {
   this.dataFlow = {};  
   this.jsonFileManager = new JSONFileManager();
  }
  
  setDataFlow(data) {
    this.dataFlow = data;
    return this;
  }
  
  ajaxOperation(callback) {
    Utils.loader();
    $.ajax({
      data: JSON.stringify(this.dataFlow),
      dataType: 'json',
      contentType: 'application/json',
      type: "POST",
      url: UPDATE_FLOWCHART_CODE_TO_FILE, 
      success: data => {
        Utils.stopLoader();
        callback(data);
      },
      error: err => {
        Utils.stopLoader();
        let error = {};
        if(err.responseJSON) {
          error = err.responseJSON;
        } else {
            error.error = true;  
            error.message = "There was an error";
        }
        const data = error;
        callback(data);
      }
    });
  }
  
  update() {
    const { projectCompositeId, isNew } = this.dataFlow;
    if(isNew) {
      this.saveFile({ type: 'open' });  
    } else {
      CompilerService.synchronizeProject(projectCompositeId, {
        callback: d => {
          this.isOpenOrClosedProject();
        }
      });   
    }
   
  }
  
  isOpenOrClosedProject() {
    const { projectCompositeId } = this.dataFlow;
    CompilerService.isProjectOpened(projectCompositeId, {
      callback: isOpen => {
        const type = isOpen ? 'open' : 'close';
        this.saveFile({ type });    
      }
    });
  }
  
  saveFile({ type }) {
    const openSave = () => this.saveFileOpenProject();
    const closeSave = () => this.saveFileCloseProject();
    const saveType = {
      'open': openSave,
      'close': closeSave
    }
    return saveType[type]();
  }
  
  saveFileCloseProject() {
    this.dataFlow.type = 'close';
    this.ajaxOperation(data => { 
      this.getUpdatedCodeCloseProject(data);
    });
  }
  
  saveFileOpenProject() {
    this.dataFlow.type = 'open';
    this.ajaxOperation(data => {
      this.getUpdatedCodeOpenProject(data);
    });
  }
  
  getUpdatedCodeOpenProject(data) {
    const { projectCompositeId } = this.dataFlow;
    const { path, fileName } = data;
    this.saveNewContent(data, () => {
      if (document.querySelector(rightNavigation)) {
        browxyStartUp.fileOperation.renameOpenedFile(`${projectCompositeId}/${path}`, `${projectCompositeId}/${path}`, fileName);
      }
      this.reloadTab();
      Utils.stopLoader();
      flowChartEditor.showConsole(); 
      this.executeByType();
    });   
  }
  
  executeByType() {
    const { projectCompositeId, typeRun, saveFlow } = this.dataFlow;
    if(saveFlow) {
      const executeGet = () => this.saveAndRun();
      const executeCreate = () => this.saveAndRun();
      this.jsonFileManager.isJsonFile({ projectCompositeId, executeGet, executeCreate, isLoadContent: false });
    } else {
       this.runCompiler();
    }    
  }
  
  saveAndRun() {
    const { projectCompositeId } = this.dataFlow;
    const tabId = flowChartEditor.canvas.tabs[flowChartEditor.canvas.selectedTab].id;
    flowChartEditor.API
      .getBFS(flowChartEditor.canvas.graph)
      .getApiBlockProps(flowChartEditor.canvas.program, flowChartEditor.canvas.blockState, tabId)
      .saveAllApiTabs(tabId);
    this.saveJsonFile({ projectCompositeId, content: flowChartEditor.API.api }, () => {  
      flowChartEditor.canvas.log("<div style='color: green; margin-top: 5px;'>Saved Ok!</div>", 'logFlowOutput');
      flowChartEditor.canvas.markFlowchartAsSavedUnsaved(false);
      this.runCompiler();
      Utils.stopLoader(); 
    }); 
  }
  
  saveJsonFile({ projectCompositeId, content }, fn) {
    this.jsonFileManager.saveJsonFile({ projectCompositeId, content: JSON.stringify(content, null, 2) }, fn);
  }
  
  runCompiler() {
    const { projectCompositeId, typeRun } = this.dataFlow;
    switch (typeRun) {
    case 'run':
      browxyStartUp.runCompilerProject.autoRun(projectCompositeId);
      break;
    case 'debug':
      browxyStartUp.debugProject.setTypeResult('browxy_flowchart');
      browxyStartUp.debugProject.debugProject(projectCompositeId);
      break;
    case 'test':
      browxyStartUp.customTree.runTestsFromFlow(projectCompositeId);
      break;
    default:
      break;
    }  
  }
  
  reloadTab() {
    const { projectCompositeId } = this.dataFlow;
      if (document.querySelector('#tree') != undefined &&
        document.querySelector(rightNavigation) != undefined) {
        closeProjectTab(projectCompositeId);
        refreshTabTree();
      }
    }
  
  saveNewContent(data,fn) {
    const { projectCompositeId } = this.dataFlow;
    const { code, path } = data;
    const className = "com.browxy.compiler.domain.api.dwr.CompilerService";  
    const methodName = "saveFileContents";
    const args = [{
      "java.lang.String": `${projectCompositeId}/${path}`
    }, 
    {
      "java.lang.String": code
    }];
    defaultAjaxRequest.compilerAjaxPost(className, methodName, JSON.stringify(args), 
      () => { fn(); }, ErrorMessage.ajaxErrorHandler ); 
  }
  
  getUpdatedCodeCloseProject(data) {
    Utils.stopLoader();
    if(data.error) {
      Dialog.noticeDialog({ title: "Error", text: data.message });
      return;
    }
    flowChartEditor.showConsole(); 
    const { projectCompositeId, typeRun } = this.dataFlow;
    if(typeRun === 'run') {
      flowChartEditor.canvas.createLoadProgramListener(projectCompositeId);
      browxyStartUp.project.openProjectLoadedAsExample(projectCompositeId)        
    } else {
      browxyStartUp.debugProject.setTypeResult('browxy_flowchart');
      browxyStartUp.debugProject.debugProject(projectCompositeId);
    };
  }
  
}