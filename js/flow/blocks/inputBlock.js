class InputBlock extends IOBlock {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.five = 5;
    this.twenty = 20;
    this.ten = 10;
    this.seventeen = 17;
    this.textProps.substring = 8;
    this.textProps.startText = 12;
  }

  render() {
    this.resize();
    const { blockColor, fontColor, lineColor } = !this.colors ? 
            configEditor.flow.customizedBlocks.inputBlock : this.colors;
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
    this.c.ctx.moveTo(this.x - this.ten, this.y + this.five);
    this.c.ctx.lineTo(this.x + this.seventeen, this.y + this.five);
    this.c.ctx.stroke();
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x + this.seventeen - 1, this.y + this.five);
    this.c.ctx.lineTo(this.x + this.five, this.y - 1);
    this.c.ctx.stroke();
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x + this.seventeen - 1, this.y + this.five);
    this.c.ctx.lineTo(this.x + this.five, this.y + this.ten + 1);
    this.c.ctx.stroke();

    if (!this.editing) {
      this.c.ctx.fillStyle = (this.c.tabs[this.c.selectedTab].id == '1' && !this.isProgram) ? '#858585' : fontColor;
      this.c.ctx.font = `${this.fontSizeCode}px ${this.fontName}`;
      this.c.ctx.textAlign = this.isProgram ? "start" : "center";
      const { code, textW } = this.renderTextCode({ maxWidth: this.w - this.twenty - 2 });
      this.c.ctx.fillText(code, textW, this.y + this.h / this.textProps.verticalAlignText, this.w - this.twenty - 2);
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
  
  handlerRadioOption() {
    const radios = document.querySelectorAll('input[name="optionType"]');
    radios.forEach(radio => {
      radio.addEventListener('change', e => {
        const option = e.target.value;
        const selectContainer = document.querySelector('#selectContainer');
        const defineContainer = document.querySelector('#defineContainer');
        switch (option) {
          case 'selectVar':
            defineContainer.classList.add('hide');
            selectContainer.classList.remove('hide');
            break;
          case 'defineVar':
            selectContainer.classList.add('hide');
            defineContainer.classList.remove('hide');
            break;
        }
      });
    });
  }
}