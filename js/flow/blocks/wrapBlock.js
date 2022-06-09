class WrapBlock extends Block {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.bisel = 20;
    this.blockProps = { w: 120, h: 130, fullH: 130, branch: 'none', widthLine: 0 };
    this.outHookIndex = { out: 1, innerOutYes: 1, innerOutNo: 1 };
    this.lineColor = null;
    this.bgColor = null;
    this.fontColor = null;
    this.tabId = null;
    this.params = [];
    this.functionName = '';
    this.errorTxtW = 20;
    this.errorTxtH = 10;
    this.hooks = isProgram ? [
      new Hook(canvas, x + w / 2, y, w, h, false, "ring", '', 'in', this.type),
      new Hook(canvas, x + w / 2, y + h, w, h, false, 'hook', 'bottom', 'out', this.type)
    ] : [];
    this.cogwheel = isProgram ? new CogwheelBlock(canvas, x, y, w, h, 20, 10, id) : null;  
  }

  render() {
    this.resize();
    const { blockColor, fontColor, lineColor } = configEditor.flow.customizedBlocks.wrapBlock;
    const lineCol = !this.lineColor ? lineColor : this.lineColor;
    const blkCol = !this.bgColor ? blockColor : this.bgColor;
    const fontCol = !this.fontColor ? fontColor : this.fontColor;
    this.c.ctx.strokeStyle = this.isIntercepted ? "#46ea4b" :
      this.error ? "red" : (this.selected || this.highlighted) ? "blue" : lineCol;
    this.c.ctx.fillStyle = blkCol;
    this.setExpandedColor();
    this.c.ctx.save();
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x, this.y);
    this.c.ctx.lineTo(this.x + this.w - this.bisel, this.y);
    this.c.ctx.lineTo(this.x + this.w, this.y + this.bisel);
    this.c.ctx.lineTo(this.x + this.w, this.y + this.h);
    this.c.ctx.lineTo(this.x + this.bisel, this.y + this.h);
    this.c.ctx.lineTo(this.x, this.y + this.h - this.bisel);
    this.c.ctx.closePath();
    this.c.ctx.fill();
    this.c.ctx.stroke();
    
    if (!this.editing) {
      this.c.ctx.fillStyle = fontCol;
      this.c.ctx.font = `${this.fontSizeCode}px ${this.fontName}`;
      this.c.ctx.textAlign = this.isProgram ? "start" : "center";
      const { code, textW } = this.renderTextCode({ maxWidth: this.w });
      this.c.ctx.fillText(code, textW, this.y + this.h / this.textProps.verticalAlignText, this.w);
      if (this.compileError.hasError) {
        const width = this.c.ctx.measureText('Error !!').width - this.errorTxtW;
        this.drawErrorText('Error !!', this.fontSize, this.x + this.w / 2 + width, this.y + this.h + this.errorTxtH);
      }
    }
    this.renderDependencies(lineCol);
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
  
  resize() {
    if (this.isProgram && !this.grabed && !this.isLocked) {
      this.c.ctx.font = `${this.fontSizeCode}px ${this.fontName}`;
      if (this.c.expanded && this.hooks[0].occupied) {
        const w = !Utils.isEmpty(this.code) ? this.c.ctx.measureText(this.code).width + 20 : this.w;
        this.w = !Utils.isEmpty(this.code) ? w < this.w ? this.w : w : this.w;
        this.blockProps.w = this.w;
        this.lastDimension.w = this.w;
        this.grabPosition.x = (this.w / 2);
      }
      this.x = this.getFixedX(); 
    }
    if (this.isLocked) this.x = this.getFixedX();
    this.move(this.x, this.y);
  }

  move(x, y) {
    this.x = x;
    this.y = y;
    if (this.isProgram) {
      this.updateHooksMove(x, y); 
      this.updateCogwheelMove(x, y);
      this.updateBreakpointMove(x + this.w / 2, y + this.h);
    }
  }
  
  updateHooksMove(x, y) {
    this.hooks[0].x = x + this.w / 2;
    this.hooks[0].y = y;
    this.hooks[1].x = x + this.w / 2;
    this.hooks[1].y = y + this.h;
    this.hooks[1].w = this.w;
    this.hooks[1].h = this.h;
  }
  
  setColors({ bgColor, lineColor, fontColor }) {
    this.bgColor = bgColor;
    this.lineColor = lineColor;
    this.fontColor = fontColor;
  }
  
  setExpandedColor() {
    if (this.c.expanded && !this.isProgram) {
      this.c.ctx.strokeStyle = '#858585';
      this.c.ctx.fillStyle = '#dddddd';
    }
  }

  getBlockDistance(ringBlock) {
    const { x, y } = ringBlock;
    const a = this.hooks[1].x - x;
    const b = this.hooks[1].y + 70 - y;
    const distance = Math.sqrt(a * a + b * b);
    const passed = distance <= 5 && distance >= -2;
    return { passed, distance }
  }
}