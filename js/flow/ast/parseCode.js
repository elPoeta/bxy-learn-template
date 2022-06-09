class ParseCode {
  constructor(props) {
    const { canvas, ast, projectCompositeId, palette, wizardItems, packageToImport } = props;
    this.c = canvas;
    this.language = this.c.languageOutput;
    this.wizardItems = wizardItems;
    this.name = this.c.flowchartName;
    this.ast = ast;
    this.api = {};
    this.previusId = 'start-id';
    this.projectCompositeId = projectCompositeId;
    this.palette = palette;
    this.packageToImport = packageToImport;
    this.initApi();
  }

  initApi() {
    this.api.langOut = this.language;
    this.api.name = this.name;
    this.api.wizardItems = this.wizardItems;
    this.api.palette = this.palette;
    this.api.colors = configEditor.flow.customizedBlocks;
    this.api.projectCompositeId = this.projectCompositeId;
    this.api.program = {};
    return this;
  }

  setRepoFunction() {
    const { blockColor, fontColor, lineColor } = configEditor.flow.customizedBlocks.wrapBlock;
    for (let [k, val] of Object.entries(this.ast)) {
      val = val.map(v => {
        if(v.typeBlock === 'wrapBlock') {
          v = this.getCustomColor({ val: v, blockColor, fontColor, lineColor });
        }   
        return v;
      });
      if (k !== '0' && k !== '1') { 
        this.ast["1"].push(val[0]);
      }
    }
    this.genAPIBlock();
    return this;
  }

  getCustomColor({ val, blockColor, fontColor, lineColor }) {
    val.bgColor = blockColor;
    val.fontColor = fontColor;
    val.lineColor = lineColor;
    return val;
  }

  genAPIBlock() {
    for (const [k, val] of Object.entries(this.ast)) {
      this.previusId = 'start-id';
      const tabName = k === '0' ? 'main' : k === '1' ? 'functions' : val[0].functionName;
      const tabType = k === '0' ? 'main' : k === '1' ? 'f_repo' : 'f_body';
      const programs = [];
      val.forEach(block => {
        if (k !== '1') {
          if (block.id !== 'none')
            programs.push(this.getProps(block));
        } else {
          programs.push(this.getProps(block));
        }
      });
      this.setPrograms(programs, k, tabName, tabType);
    }
    this.runAPI();
  }

  getProps(block) {
    const keys = flowChartEditor.API.getVarPropsByLanguage(this.language, block.typeBlock);
    const stateBlock = {
      id: block.id !== 'none' ? block.id : flowChartEditor.uuid(),
      type: block.typeBlock.replace('Block', ''),
      hook: block.hook,
      prev: block.previus !== 'none' ? block.previus : this.previusId,
      code: block.code
    }
    if (keys.length > 0) stateBlock.vars = {};
    keys.forEach(key => {
      stateBlock.vars[key] = block[key];
    });
    this.previusId = stateBlock.id;
    return stateBlock;
  }

  setPrograms(programs, apiId, tabName, tabType) {
    this.api.program[apiId] = {
      blocks: programs,
      blocksOutside: [],
      tab: {
        name: tabName,
        type: tabType
      }
    }
  }

  runAPI() {
    this.setFlowAPI();
    this.createFlowFromAPI();
    this.setFlowAPI();
    this.setTabs();
    this.setInputExternalVariableId();
    this.logDescription();
    this.c.centerStartBlock();
  }

  setFlowAPI() {
    flowChartEditor.API.api = this.api;
  }

  createFlowFromAPI() {
    flowChartEditor.API.createFlowFromAPI({ key: "0", projectCompositeId: this.projectCompositeId, projectName: this.name, isUndoRedo: false });
  }

  setTabs() {
    flowChartEditor.API.setPalette("0");
    flowChartEditor.API.setTabs();
    flowChartEditor.canvas.update();
    this.c.packageToImport = this.packageToImport;
  }

  setInputExternalVariableId() {
    flowChartEditor.canvas.program = flowChartEditor
       .canvas.program.map(block => {
          if(block.type === 'inputBlock') block.setExternalVariableId();
          return block;
       });   
  }
  
  logDescription() {
    this.c.logDescription();
  }
}
