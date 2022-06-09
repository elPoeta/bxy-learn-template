class CodeBlock extends IOBlock {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.textProps.startText = 4;
  }

  render() {
    this.resize();
    const { blockColor, fontColor, lineColor } = !this.colors ? 
            configEditor.flow.customizedBlocks.codeBlock : this.colors;
    this.setRenderColor({ blockColor, lineColor });
    this.c.ctx.save();
    this.c.ctx.beginPath();
    this.c.ctx.rect(this.x, this.y, this.w, this.h);
    this.c.ctx.fillRect(this.x, this.y, this.w, this.h);
    this.c.ctx.stroke();

    if (!this.editing) {
      this.c.ctx.fillStyle = (this.c.tabs[this.c.selectedTab].id == '1' && !this.isProgram) ? '#858585' : fontColor;
      this.c.ctx.font = `${this.fontSizeCode}px ${this.fontName}`;
      this.c.ctx.textAlign = this.isProgram ? "start" : "center";
      const { code, textW } = this.renderTextCode({ maxWidth: this.w });
      this.c.ctx.fillText(code, textW, this.y + this.h / this.textProps.verticalAlignText, this.w);
      if (this.compileError.hasError) {
        const width = this.c.ctx.measureText('Error !!').width - this.errorTxtW;
        this.drawErrorText('Error !!', this.fontSize, this.x + this.w / 2  + width , this.y + this.h + this.errorTxtH);
      } 
    }
    this.renderDependencies(lineColor);
    this.c.ctx.restore();
  }

  renderHooks(lineColor) {
    this.hooks = this.hooks.map(hook => {
      hook.render();
      hook.selected = this.selected;
      hook.highlighted = this.highlighted;
      hook.error = this.error;
      hook.isIntercepted = this.isIntercepted;
      hook.isLocked = this.isLocked;
      hook.lineColor = lineColor;
      return hook;
    });
  }
}