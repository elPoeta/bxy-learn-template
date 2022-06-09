class CustomBlock {
  constructor() {
    this.customizedBlocks = this.getDefaultColors();
    this.isChange = false;
  }

  getDefaultColors() {
    return {
      startBlock: { blockColor: '#c8e6c9', fontColor: '#000000', lineColor: '#000000' },
      endBlock: { blockColor: '#81c784', fontColor: '#000000', lineColor: '#000000' },  
      defineBlock: { blockColor: '#feda6a', fontColor: '#000000', lineColor: '#000000' },
      codeBlock: { blockColor: '#f59742', fontColor: '#000000', lineColor: '#000000' },
      inputBlock: { blockColor: '#62d5ad', fontColor: '#000000', lineColor: '#000000' },
      outputBlock: { blockColor: '#9ec5fe', fontColor: '#000000', lineColor: '#000000' },
      whileBlock: { blockColor: '#d59f70', fontColor: '#000000', lineColor: '#000000' },
      forBlock: { blockColor: '#c5a894', fontColor: '#000000', lineColor: '#000000' },
      doWhileBlock: { blockColor: '#ddccc4', fontColor: '#000000', lineColor: '#000000' },
      ifBlock: { blockColor: '#c5b3e6', fontColor: '#000000', lineColor: '#000000' },
      wrapBlock: { blockColor: '#adb5bd', fontColor: '#000000', lineColor: '#000000' },
    }
  }

  setConfig(customizedBlocks, renderCogwheel) {
    flowChartEditor.canvas.renderCogwheel = renderCogwheel;
    this.customizedBlocks = customizedBlocks;
  }

  setFromUserConfig(customizedBlocks) {
    this.customizedBlocks = Utils.isEmpty(customizedBlocks) ? this.getDefaultColors() : customizedBlocks;  
    if(flowChartEditor.workspaceChange) {
      flowChartEditor.canvas.update();
    }
  }
  
  restoreDefault() {
    this.compareChanges(this.getDefaultColors());
    this.customizedBlocks = this.getDefaultColors();
  }
  
  compareChanges(customizedBlocks) {
    if(this.isChange) return;
    for(const p in this.customizedBlocks){
        for(const key in this.customizedBlocks[p]){
          if(this.customizedBlocks[p][key] !== customizedBlocks[p][key]){
            this.isChange = true;  
            return;
          }
      }
    }
    this.isChange = false;
    return;
  }
  
  save() {
    if(!this.isChange) return;
    defaultAjaxRequest
    .setUrl(SAVE_CONFIG_EDITOR)
    .saveConfigEditor('flow', JSON.stringify(this.customizedBlocks));
  }

}
