class CopyPasteBlocks {
  constructor(canvas) {
    this.c = canvas;
    this.setValues();
  }

  setValues() {
    this.copiedBlocks = [];
    this.pasteBlocks = [];
    this.previusBlockState = null;
  }

  copyFromEditionMenu(index) {
    this.setValues();
    this.copiedBlocks = [{ ...this.c.program[index], copyID: 'copyID' }];
    this.copyInnerBlocks(this.c.program[index].id);
    this.previusBlockState = Utils.parseBlocksStateToJson(Utils.parseBlocksStateToString(this.c.blockState));
    this.c.log("<div style='color: green; margin-top: 5px; margin-left: 5px;'>Block/s copied!</div>", 'logFlowOutput');
  }

  copyInnerBlocks(edgeId, from = 1) {
    const nodeEdges = this.c.graph.getNodeEdges(edgeId);
    for (let i = from; i < (nodeEdges && nodeEdges.length); i++) {
      if (nodeEdges[i]) {
        if (nodeEdges[i] === 'empty') continue;
        const index = this.c.program.findIndex(block => block.id === nodeEdges[i]);
        if (index <= -1) continue;
        const block = { ...this.c.program[index], copyID: 'copyID' };
        this.copiedBlocks.push(block);
        this.copyInnerBlocks(block.id, 0);
      }
    }
    return;
  }

  createStateFromCopy() {
    this.setNewCopyId();
    this.pasteBlocks = [];
    this.copiedBlocks.forEach((block, idx) => {
      if (idx === 0) {
        const state = {};
        const stateBlock = this.getStateBlock(block, state, this.c.languageOutput);
        stateBlock.x = 210;
        stateBlock.y = 0;
        stateBlock.ring = 'not-occupied';
        this.pasteBlocks.push(stateBlock);
      } else {
        const state = this.previusBlockState.get(block.id);
        const stateBlock = this.getStateBlock(block, state, this.c.languageOutput);
        stateBlock.ring = 'locked';
        this.pasteBlocks.push(stateBlock);
      }
    });
    this.pasteBlocks = this.pasteBlocks.map((block, idx) => {
      if (idx !== 0) {
        const index = this.copiedBlocks.findIndex(b => b.id === block.prev);
        block.prev = this.copiedBlocks[index].copyID;
      }
      return block;
    });
  }

  getStateBlock(block, state, language) {
    const stateBlock = flowChartEditor.API.getStateBlock(block, state, language);
    stateBlock.id = block.copyID;
    return stateBlock;
  }
  
  paste(coords) {
    this.createStateFromCopy();
    const outsideBlocks = [];
    this.pasteBlocks.forEach(props => {
      const { id, ring } = props;
      let { type } = props;
      type = `${type}Block`;
      const { w, h } = flowChartEditor.API.getWidthAndHeigthBlock(type);
      const wrapType = type !== 'wrapBlock' ? '' : props.vars.wrapType;
      flowChartEditor.API.createNewProgram(id, type, 0, 0, w, h, "", wrapType);
      if (ring === 'not-occupied') {
        const indexRing = this.c.program.length - 1;
        this.c.program[indexRing].x = coords.x;
        this.c.program[indexRing].y = coords.y;
        if (this.pasteBlocks.length > 1) flowChartEditor.API.createGraphNode(this.c.program[indexRing]);
        outsideBlocks.push({ index: indexRing, ring });
        this.c.updateCanvas();
      } else {
        const { hook, prev } = props;
        const indexHook = this.c.program.findIndex(block => block.id === prev);
        const indexRing = this.c.program.length - 1;
        const hookArrowIndex = flowChartEditor.API.getIndexHook(this.c.program[indexHook].type, hook);
        this.c.program[indexRing].x = this.c.eventHandler.setXOnDrop(this.c.program[indexRing], this.c.program[indexHook], hook);
        this.c.program[indexRing].y = this.c.program[indexHook].hooks[hookArrowIndex].y;
        this.c.interceptedProgram = { programRing: this.c.program[indexRing], programHook: this.c.program[indexHook], arrowType: hook };
        this.c.eventHandler.dropInterceptedProgram();
        outsideBlocks.push({ index: indexRing, ring });
        this.c.updateCanvas();
      }
    });
    outsideBlocks.forEach(block => {
      const { index, ring } = block;
      if (ring === 'not-occupied') {
        this.c.program[index].hooks[0].occupied = false;
      } else {
        this.c.program[index].isLocked = true;
        this.c.program[index].hooks[0].isLocked = true;
        this.c.blockState.update(this.c.program[index].id, { render: false });
      }
    });
    this.c.log("<div style='color: green; margin-top: 5px; margin-left: 5px;'>Block/s pasted!</div>", 'logFlowOutput');
    this.c.updateCanvas();
  }
  
  setNewCopyId() {
    this.copiedBlocks = this.copiedBlocks.map(block => {
      block.copyID = flowChartEditor.uuid();
      return block;
    });
  }
  
  createWrapCopy() {
    this.setNewCopyId();
    this.pasteBlocks = [];
    this.copiedBlocks.forEach(block => {
      const state = this.previusBlockState.get(block.id);
      const stateBlock = this.getStateBlock(block, state, this.c.languageOutput);
      this.pasteBlocks.push(stateBlock);
    });
    this.pasteBlocks = this.pasteBlocks.map((block, idx) => {
      if (idx !== 0) {
        const index = this.copiedBlocks.findIndex(b => b.id === block.prev);
        block.prev = this.copiedBlocks[index].copyID;
      }
      return block;
    });
    this.pasteBlocks[0].prev = 'start-id';
    this.pasteBlocks[0].hook = "out";
    return JSON.stringify(this.pasteBlocks);
  }
  
  copySelectedBlocks(path, blocks) {
    path.forEach(node => {
      const index = blocks.findIndex(block => block.id === node);
      if (index > -1) {
        this.copiedBlocks.push({ ...this.c.program[index], copyID: 'copyID' });
      }
    });
    this.previusBlockState = Utils.parseBlocksStateToJson(Utils.parseBlocksStateToString(this.c.blockState));
  }
}