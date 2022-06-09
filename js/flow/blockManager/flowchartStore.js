class FlowchartStore {
  constructor(canvas) {
    this.c = canvas;
  }

  saveBlocksToFile(tabId) {
    if(!this.c.hasProjectId('The flowchart does not yet belong to any project, to save the flowchart you must first run the program')) return;
    flowChartEditor.API
      .getBFS(this.c.graph)
      .getApiBlockProps(this.c.program, this.c.blockState, tabId)
      .saveAllApiTabs(tabId);
    flowChartEditor.API
      .saveJsonFile({ projectCompositeId: this.c.projectCompositeId, content: flowChartEditor.API.api }, () => {  
        this.c.log("<div style='color: green; margin-top: 5px;'>Saved Ok!</div>", 'logFlowOutput');
        Utils.stopLoader(); 
    });
    
  }
  
  getActualState() {
    const { zoomIndex, zoomLevel, lastZoomOperation } = this.c.zoomFlowchart;
    return {
      lastZoomOperation,
      zoomIndex,
      zoomLevel,
      arrowDistance: this.c.arrowDistance,
      defaultAccumulator: this.c.defaultAccumulator,
      withLine: this.c.widthLine,
      eventWidthLine: this.c.eventHandler.widthLine,
      eventWidthLoopLine: this.c.eventHandler.widthLoopLine,
      eventDoWhileDefaultAccum: this.c.eventHandler.doWhileDefaultAccum,
      eventInnerPlusHeight: this.c.eventHandler.innerPlusHeight,
      eventIncrementOutLine: this.c.eventHandler.incrementOutLine,
      eventIncrementHeightRightLine: this.c.eventHandler.incrementHeightRightLine,
      eventIncrementHeightLeftLine: this.c.eventHandler.incrementHeightLeftLine,
      eventIncrementLeftRing: this.c.eventHandler.incrementLeftRing,
      eventIncrementRightRing: this.c.eventHandler.incrementRightRing,
      eventAddToHeight: this.c.eventHandler.addToHeight,
      blocks: this.blocksToString(this.c.program),
      graph: this.c.graph.getAdjacencyList(),
      blockState: this.variableStateToString(this.c.blockState), 
      variableState: this.variableScopeToString()
    }
  }
  
  saveBlocksToLocalStorage() {
    if(this.c.zoomFlowchart.getZoomX() !== 0) {
      this.c.log("<div style='color: red; margin-top: 5px;'>Not Saved, zoom level must be zero</div>", 'logFlowOutput');
      return;
    } 
    const { languageOutput, flowchartName, blocksSaved, graphSaved, blockStateSaved, variableStateSaved } = this.flowchartToString();
    const id = this.c.program[0].id
    const blocks = JSON.parse(localStorage.getItem('BLOCK_STORE')) || [];
    const index = blocks.findIndex(block => block.id === id);
    if (index > -1) {
      blocks[index] = {
        ...blocks[index],
        languageOutput,
        flowchartName,
        blocks: blocksSaved,
        graph: graphSaved,
        blockState: blockStateSaved,
        variableState: variableStateSaved
      }
    } else {
      blocks.push({
        id,
        languageOutput,
        flowchartName,
        blocks: blocksSaved,
        graph: graphSaved,
        blockState: blockStateSaved,
        variableState: variableStateSaved
      });
    }
    const size = this.getBlockSize({ id, languageOutput, flowchartName, blocksSaved, graphSaved, blockStateSaved, variableStateSaved });
    const storageSpaceRemaining = this.getLocalStorageSpaceRemaining();
    if (storageSpaceRemaining < size) {
      this.c.log("<div style='color: red; margin-top: 5px;'>Not Saved, the local storage capacity has been exceeded</div>", 'logFlowOutput');
      return;
    }
    localStorage.setItem('BLOCK_STORE', JSON.stringify(blocks));
    this.c.log("<div style='color: green; margin-top: 5px;'>Saved Ok!</div>", 'logFlowOutput');
  }

  flowchartToString() {
    const { program, graph, blockState, languageOutput, flowchartName } = this.c;
    try {
      const blocksSaved = this.blocksToString(program);
      const graphSaved = this.graphToString(graph);
      const blockStateSaved = this.variableStateToString(blockState);
      const variableStateSaved = this.variableScopeToString();
      return { languageOutput, flowchartName, blocksSaved, graphSaved, blockStateSaved, variableStateSaved };
    } catch (error) {
      console.error('Error flow to string ', error);
      this.c.log("<div style='color: red; margin-top: 5px;'>Saved fail!</div>", 'logFlowOutput');
    }
  }

  blocksToString(program) {
    const keys = ['c', 'importsAndInstancesState', 'globalScope', 'forScope', 'whileScope', 'ifScopeBranchRight', 'ifScopeBranchLeft', 'doWhileScope'];
    return JSON.stringify(program, (key, value) => {
      if (keys.includes(key)) {
        return {};
      }
      return value;
    });
  }
  
  variableScopeToString() {
    const stateVar = {};
    this.c.program.forEach(block => {
      switch (block.type) {
        case 'startBlock':
          if (!block.globalScope.isEmpty()) {
            stateVar[block.id] = [{ type: 'globalScope', scope: this.variableStateToString(block.globalScope) }];
          }
          if (!block.importsAndInstancesState.isEmpty()) {
            stateVar[block.id] = stateVar[block.id] ?
              [...stateVar[block.id], { type: 'importsAndInstancesState', scope: this.variableStateToString(block.importsAndInstancesState) }] :
              [{ type: 'importsAndInstancesState', scope: this.variableStateToString(block.importsAndInstancesState) }];
          }
          break;
        case 'whileBlock':
          if (!block.whileScope.isEmpty()) {
            stateVar[block.id] = [{ type: 'whileScope', scope: this.variableStateToString(block.whileScope) }];
          }
          break;
        case 'forBlock':
          if (!block.forScope.isEmpty()) {
            stateVar[block.id] = [{ type: 'forScope', scope: this.variableStateToString(block.forScope) }];
          }
          break;
        case 'doWhileBlock':
          if (!block.doWhileScope.isEmpty()) {
            stateVar[block.id] = [{ type: 'doWhileScope', scope: this.variableStateToString(block.doWhileScope) }];
          }
          break;
        case 'ifBlock':
          if (!block.ifScopeBranchRight.isEmpty()) {
            stateVar[block.id] = [{ type: 'ifScopeBranchRight', scope: this.variableStateToString(block.ifScopeBranchRight) }];
          }
          if (!block.ifScopeBranchLeft.isEmpty()) {
            stateVar[block.id] = stateVar[block.id] ?
              [...stateVar[block.id], { type: 'ifScopeBranchLeft', scope: this.variableStateToString(block.ifScopeBranchLeft) }] :
              [{ type: 'ifScopeBranchLeft', scope: this.variableStateToString(block.ifScopeBranchLeft) }]
          }
          break;
        default:
          break;
      }
    });
    return JSON.stringify(stateVar);
  }

  variableStateToString(variableState) {
    return JSON.stringify(variableState.state,(key, value) => {
      if(value instanceof Map) {
        return {
          dataType: 'Map',
          value: [...value],
        };
      } else if(value instanceof Set) {
        return {
          dataType: 'Set',
          value: [...value],
        };
      }else {
        return value;
      }
    });
  }

  blockStateToString(blockState) {
    return JSON.stringify(blockState.toArray());
  }

  graphToString(graph) {
    return JSON.stringify(graph.getAdjacencyList());
  }

  loadBlockToLocalStorage(id) {
    const blocksStore = this.getBlocksFromLocalStorage();
    const index = blocksStore.findIndex(block => block.id === id);
    if(index < 0) {
      this.c.log("<div style='color: red; margin-top: 5px;'>Load fail!</div>", 'logFlowOutput');
      return;
    }
    try {
      const languageOutput = blocksStore[index].languageOutput;
      const flowchartName = blocksStore[index].flowchartName;
      const blocksParse = this.getBlocksToJson(blocksStore[index].blocks);
      const graphParse = this.getBlocksToJson(blocksStore[index].graph);
      const blockStateParse = this.getBlocksStateToJson(blocksStore[index].blockState);
      const variableStateParse = this.getBlocksToJson(blocksStore[index].variableState);
      const programs = this.generateProgram(blocksParse, languageOutput);
      const programsWithScope = this.setVariableScope(programs, variableStateParse);
      this.c.loadFlow(languageOutput, flowchartName, programsWithScope, graphParse, blockStateParse, variableStateParse);
    } catch (error) {
      console.error('Error flow to json ', error);
      this.c.log("<div style='color: red; margin-top: 5px;'>Load fail!</div>", 'logFlowOutput');
    }
  }

  getBlocksFromLocalStorage() {
    const blocksStoreFromStorage = localStorage.getItem('BLOCK_STORE') || '[]';
    try {
      return JSON.parse(blocksStoreFromStorage);
    } catch (error) {
      console.error('Error flow to json ', error);
      this.c.log("<div style='color: red; margin-top: 5px;'>Load fail!</div>", 'logFlowOutput');
    }
  }

  getBlocksToJson(block) {
    return JSON.parse(block);
  }

  getBlocksStateToJson(blockState) {
    return JSON.parse(blockState, (key, value) => {
      if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
          return new Map(value.value);
        }
        if (value.dataType === 'Set') {
          return new Set(value.value);
        }
      }
      return value;
    });
  }

  generateProgram(blocksParse, languageOutput) {
    let newProgram = [];
    blocksParse.forEach(block => {
      let insert;
      delete block.c;
      const { id, type, x, y, w, h, code } = block;
      const language = (type !== 'startBlock' && type !== 'endBlock') ? languageOutput : '';
      const isProgram = (type !== 'startBlock' && type !== 'endBlock') ? true : false;
      insert = BlockFactory.getImplementation(id, this.c, type, x, y, w, h, code, isProgram, language);
      for (let property in block) {
        if (property === 'hooks') continue;
        insert[property] = block[property];
      }
      block.hooks.forEach((hook, index) => {
        insert.hooks[index] = Object.assign(insert.hooks[index], this.setHookProps(hook));
      });
      newProgram.push(insert);
    });
    return newProgram;
  }

  setHookProps(hook) {
    return {
      ioType: hook.ioType,
      outLineHeight: hook.outLineHeight,
      hookLineHeight: hook.hookLineHeight,
      incrementBottomLine: hook.incrementBottomLine,
      incrementHeightLeftLine: hook.incrementHeightLeftLine,
      incrementHeightRightLine: hook.incrementHeightRightLine,
      incrementLeftLine: hook.incrementLeftLine,
      incrementRightLine: hook.incrementRightLine,
      incrementWidthLeftLine: hook.incrementWidthLeftLine,
      incrementWidthRightLine: hook.incrementWidthRightLine,
      occupied: hook.occupied,
      radius: hook.radius,
      diagonalArrowLeft: hook.diagonalArrowLeft,
      diagonalArrowRight: hook.diagonalArrowRight,
      plusDoWhileH: hook.plusDoWhileH,
      plusLoopH: hook.plusLoopH
    }
  }

  setVariableScope(programs, variableStateParse) {
    return programs.map(block => {
      switch (block.type) {
        case 'startBlock':
          block.globalScope = new BlockState();
          block.importsAndInstancesState = new BlockState();
          return this.getBlockWithScope(block, variableStateParse);
        case 'whileBlock':
          block.whileScope = new BlockState();
          return this.getBlockWithScope(block, variableStateParse);
        case 'forBlock':
          block.forScope = new BlockState();
          return this.getBlockWithScope(block, variableStateParse);
        case 'doWhileBlock':
          block.doWhileScope = new BlockState();
          return this.getBlockWithScope(block, variableStateParse);
        case 'ifBlock':
          block.ifScopeBranchRight = new BlockState();
          block.ifScopeBranchLeft = new BlockState();
          return this.getBlockWithScope(block, variableStateParse);
        default:
          return block;
      }
    });
  }

  getBlockWithScope(block, variableStateParse) {
    if (variableStateParse[block.id] && variableStateParse[block.id].length > 1) {
      const typeScope1 = variableStateParse[block.id][0].type;
      const scope1 = variableStateParse[block.id][0].scope;
      const typeScope2 = variableStateParse[block.id][1].type;
      const scope2 = variableStateParse[block.id][1].scope;
      block[typeScope1].state = this.getBlocksStateToJson(scope1);
      block[typeScope2].state = this.getBlocksStateToJson(scope2);
    } else if (variableStateParse[block.id] && variableStateParse[block.id].length > 0) {
      const typeScope = variableStateParse[block.id][0].type;
      const scope = variableStateParse[block.id][0].scope;
      block[typeScope].state = this.getBlocksStateToJson(scope);
    }
    return block;
  }
  
  removeBlockFromLocalStorage(id) {
    try {
      let blocksStore = this.getBlocksFromLocalStorage();
      blocksStore = blocksStore.filter(block => block.id !== id);
      localStorage.setItem('BLOCK_STORE', JSON.stringify(blocksStore));
      this.c.log("<div style='color: green; margin-top: 5px;'>Block removed Ok!</div>", 'logFlowOutput');
    } catch (error) {
      this.c.log("<div style='color: red; margin-top: 5px;'>Block removed fail!</div>", 'logFlowOutput');
      return false;
    }
    return true;
  }
  
  getUsedLocalStorageSpace() {
    return +Object.keys(localStorage)
      .map(key => localStorage.hasOwnProperty(key) && !isNaN((localStorage[key].length * 16) / (8 * 1024)) ?
        (localStorage[key].length * 16) / (8 * 1024) : 0)
      .reduce((a, b) => a + b, 0)
      .toFixed(2);
  }

  getLocalStorageSpaceRemaining() {
    const localStorageSpace = this.getUsedLocalStorageSpace();
    return +(5120 - localStorageSpace).toFixed(2);
  }

  getBlockSize(block) {
    const blockToString = JSON.stringify(block);
    const size = (blockToString.length * 16) / (8 * 1024);
    return +size.toFixed(2);
  }

}