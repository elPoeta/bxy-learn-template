class ContainerBlock extends Block {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.isEditable = false;
    this.fontSize = 20;
    this.radiusX = 30;
    this.radiusY = 60;
    this.ellipseW = w / 2;
    this.ellipseH = h / 2;
  }

  render() {
    this.resize();
    const { blockColor, fontColor, lineColor } = !this.colors ? 
            configEditor.flow.customizedBlocks[this.type] : this.colors;
    this.setRenderColor({ blockColor, lineColor });
    this.c.ctx.save();
    this.c.ctx.scale(this.scale, this.scale);
    this.c.ctx.beginPath();
    this.c.ctx.ellipse(this.x + this.ellipseW, this.y + this.ellipseH, this.radiusX, this.radiusY, Math.PI / 2, 0, 2 * Math.PI);
    this.c.ctx.fill();
    this.c.ctx.stroke();
    this.c.ctx.fillStyle = fontColor;
    this.c.ctx.font = `bold ${this.fontSize}px ${this.fontName}`;
    if (this.editable) {
      this.c.ctx.font = `bold 16px ${this.fontName}`;
      this.code = this.getFunctionCode(); 
      this.c.ctx.fillStyle = fontColor;
      this.c.ctx.textAlign = "start";
      const { code, textW } = this.renderTextCode({ maxWidth: this.w });
      this.c.ctx.fillText(code, textW, this.y + this.h / 1.7, this.w);
    }
    else {
      this.c.ctx.textAlign = "center";
      this.c.ctx.fillText(LANGUAGE_FLOW[CURRENT_LANG][this.type], this.x + this.w / 2, this.y + this.h / this.textProps.verticalAlignText);
    }
    this.renderDependencies(lineColor);
    this.c.ctx.restore();
  }
  
  resize() {
    if (this.editable && !this.grabed ) {
      this.c.ctx.font = `bold 16px ${this.fontName}`;
      if (this.c.expanded) {
        const w = !Utils.isEmpty(this.code) ? this.c.ctx.measureText(this.code).width + 20 : this.w;
        this.w = !Utils.isEmpty(this.code) ? w < this.w ? this.w : w : this.w;
        this.ellipseW = this.w / 2;
        this.radiusY = this.ellipseW;
        this.blockProps.w = this.w;
        this.lastDimension.w = this.w;
        this.grabPosition.x = (this.w / 2);
      } 
    }
    if (this.type === 'endBlock') this.x = this.getFixedX();
    this.move(this.x, this.y);
  }
  
  
  renderHooks(lineColor) {
    this.hooks = this.hooks.map(hook => {
      hook.render();
      hook.selected = this.selected;
      hook.lineColor = lineColor;
      return hook;
    });
  }
  
  getFunctionCode() {
    const index = this.c.tabs[1].api.program['1'].blocks.findIndex(block => block.vars.tabId === this.c.tabs[this.c.selectedTab].id);
    if (index > -1) {
      return this.c.tabs[1].api.program['1'].blocks[index].code;
    }
    return 'function()';
  }
}