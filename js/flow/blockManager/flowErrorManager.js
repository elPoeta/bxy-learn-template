class FlowErrorManager {
  
  constructor(canvas, type) {
    this.c = canvas;
    this.adjacencyList = {};
    this.type = type;
  }
  
  execute() {
    this.adjacencyList = this.getAdjacencyList();
    this.findUnhookedBlocks();
  }
  
  executeCustom(userReport) {
    this.userReport = userReport;
    this.adjacencyList = this.getAdjacencyList();
    const isBreak = this.findUnhookedBlocks();
    if(this.type === 'user' && !isBreak) {
      this.handleError({}); 
    }
  }
  
  getAdjacencyList() {
    return this.c.graph.getAdjacencyList();
  }
  
  findUnhookedBlocks() {
    for (let i = 0; i < this.c.program.length; i++) {
      const program = this.c.program[i];
      if (program.id !== 'start-id' && 
              (program.id === 'end-id' || !program.hooks[0].occupied)) continue;
      const nodes = this.adjacencyList[program.id];
      const dataIteration = this.iterationFail(program, nodes);
      if(dataIteration.fail) {
        this.handleError(dataIteration); 
        return true;
      }
    }
    return false;
  }
  
  iterationFail(program, nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const indexRing = this.c.program.findIndex(block => block.id === nodes[i]);
      if (indexRing < 0) continue;
      const blockRing = this.c.program[indexRing];
      const hookIndex = this.getHookIndex(program, i);
      const { passed, distance } = this.checkDistance(program, blockRing, hookIndex);
      if (!passed) {
        return { fail: true, blockHookId: program.id, blockRingId: blockRing.id, hookIndex, distance }
      }        
    }
    return { fail: false }
  }
  
  checkDistance(blockHook, blockRing, i) {
    const x = blockRing.hooks[0].x;
    const y = blockRing.hooks[0].y;
    const { passed, distance } = blockHook.getBlockDistance({ x, y, i });
    return { passed, distance };
  }
  
  handleError(data) {
    const { blockHookId = undefined, blockRingId = undefined, hookIndex = undefined, distance = undefined } = data;
    if(this.type === 'browxy') {
      this.throwErrorManager({ blockHookId, blockRingId, hookIndex, distance });
    } else {
      this.throwErrorManager({ blockHookId, blockRingId, hookIndex, distance  });
    } 
  }
  
  throwErrorManager({ blockHookId, blockRingId, hookIndex, distance }) {
    if(this.type === 'browxy') {
      this.throwAutoError({ blockHookId, blockRingId, hookIndex, distance });
    } else {
      this.throwUserError({ blockHookId, blockRingId, hookIndex, distance });
    } 
  }
  
  throwAutoError({ blockHookId, blockRingId, hookIndex, distance }) {
    const tabId = this.c.tabs[this.c.selectedTab].id;
    flowChartEditor.API
      .getBFS(this.c.graph)
      .getApiBlockProps(this.c.program, this.c.blockState, tabId)
      .saveAllApiTabs(tabId);
    ErrorMessage.logJavascriptError(this.getErrorMessage({ blockHookId, blockRingId, hookIndex, distance, comment: '' }));
    Dialog.confirmDialog(
      "Flow Unhooked Blocks",'Do you want browxy to try to fix the flowchart ?',
      "Try Fix", "confirmFilesDeletionButton", () => { this.fixFlowchart(tabId); },() => {});  
  }
  
  throwUserError({ blockHookId, blockRingId, hookIndex, distance }) {
    const tabId = this.c.tabs[this.c.selectedTab].id;
    flowChartEditor.API
      .getBFS(this.c.graph)
      .getApiBlockProps(this.c.program, this.c.blockState, tabId)
      .saveAllApiTabs(tabId);
    ErrorMessage.logJavascriptError(this.getErrorMessage({ blockHookId, blockRingId, hookIndex, distance, comment: this.userReport }));
  }
  
  fixFlowchart(tabId) {
    flowChartEditor.API.setPalette(tabId);
    flowChartEditor.API.createFlowFromAPI({ key: tabId, projectCompositeId: this.c.projectCompositeId, projectName: this.c.flowchartName, isUndoRedo: false });
    flowChartEditor.API.setTabs();
  }
  
  getErrorMessage({ blockHookId, blockRingId, hookIndex, distance, comment }) {
    const msg = this.type === 'browxy' ? 'Flow - Unhooked Blocks' : 'Flow - User report';
    return `'${JSON.stringify({
              msg,
              projectId: this.c.projectCompositeId,
              errors: {
                blockHookId,
                blockRingId,
                hookIndex,
                distance
            },
            comment,
            api: flowChartEditor.API.api
          }, null, 2)}'`;
  }
  
  getHookIndex(block, index) {
    switch (block.type) {  
      case 'whileBlock':
      case 'forBlock':
        return index === 0 ? 4 : 1;
      case 'doWhileBlock':
        return index === 0 ? 5 : 1;
      case 'ifBlock':
        return index === 0 ? 9 : index === 1 ? 4 : 3; 
      default:
        return 1;
    }
  }
  
}