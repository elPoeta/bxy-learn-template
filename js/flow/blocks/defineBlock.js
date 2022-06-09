class DefineBlock extends IOBlock {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.eleven = 11;
    this.four = 4;
    this.two = 2;
    this.sixteen = 16;
    this.twelve = 12;
    this.twenty = 20;
    this.twentyEight = 28;
    this.twentyTwo = 22;
    this.six = 6;
    this.ten = 10;
    this.thirtyFour = 34;
    this.eighteen = 18;
    this.textProps.substring = 8;
    this.textProps.startText = 14;
  }

  render() {
    this.resize();
    const { blockColor, fontColor, lineColor } = !this.colors ?
            configEditor.flow.customizedBlocks.defineBlock : this.colors;
    this.setRenderColor({ blockColor, lineColor });
    this.c.ctx.save();
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x + this.twenty, this.y);
    this.c.ctx.lineTo(this.x + this.w, this.y);
    this.c.ctx.lineTo(this.x + this.w - this.twenty, this.y + this.h);
    this.c.ctx.lineTo(this.x, this.y + this.h);
    this.c.ctx.closePath();
    this.c.ctx.fill();
    this.c.ctx.stroke();
    
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x - this.sixteen, this.y + this.twentyEight);
    this.c.ctx.lineTo(this.x + this.twelve - 1, this.y + this.twentyEight);
    this.c.ctx.stroke();
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x + this.twelve - 1, this.y + this.twentyEight)
    this.c.ctx.lineTo(this.x - this.two - 2, this.y + this.twentyTwo - 4);
    this.c.ctx.stroke();
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x + this.twelve - 1, this.y + this.twentyEight);
    this.c.ctx.lineTo(this.x - this.four - 2, this.y + this.thirtyFour + 4);
    this.c.ctx.stroke();

    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x + this.w - this.eleven, this.y + this.h - this.twentyEight);
    this.c.ctx.lineTo(this.x + this.w + this.eighteen + 1, this.y + this.h - this.twentyEight);
    this.c.ctx.stroke();
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x + this.w - this.eleven + 2, this.y + this.h - this.twentyEight);
    this.c.ctx.lineTo(this.x + this.w - this.eleven + 2, this.y + this.h - this.twentyEight);
    this.c.ctx.lineTo(this.x + this.w + this.four, this.y + this.h - this.twentyTwo + 4);
    this.c.ctx.stroke();
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x + this.w - this.eleven + 2, this.y + this.h - this.twentyEight);
    this.c.ctx.lineTo(this.x + this.w - this.eleven + 2, this.y + this.h - this.twentyEight);
    this.c.ctx.lineTo(this.x + this.w + this.six, this.y + this.h - this.thirtyFour - 4);
    this.c.ctx.stroke();
    
    if (!this.editing) {
      this.c.ctx.fillStyle = (this.c.tabs[this.c.selectedTab].id == '1' && !this.isProgram) ? '#858585' : fontColor;
      this.c.ctx.font = `${this.fontSizeCode}px ${this.fontName}`;
      this.c.ctx.textAlign = this.isProgram ? "start" : "center";
      const { code, textW } = this.renderTextCode({ maxWidth: this.w - this.twenty });
      this.c.ctx.fillText(code, textW, this.y + this.h / this.textProps.verticalAlignText,this.w - this.twenty);
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