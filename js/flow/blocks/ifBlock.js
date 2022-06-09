class IfBlock extends Block {
    constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
        super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
        this.blockProps = { w: 240, h: 270, fullH: 270, defaultLongBranch: 60, branch: 'none', widthLine: 80 };
        this.lastDimension = { w: 240, h: 0 };
        this.branchDimension = { r: 120, l: 120 };
        this.widthBeforeExpand = 240;
        this.grabPosition = { x: 0, y: (h / 2) };
        this.hookLineWidth = 60;
        this.hookLineHeight = 60;
        this.outLineHeight = 60;
        this.incrementOutLine = 60;
        this.incrementHeightLeftLine = 60;
        this.incrementHeightRightLine = 60;
        this.incrementLeftRing = 0;
        this.incrementRightRing = 0;
        this.heightRightLine = 0;
        this.heightLeftLine = 0;
        this.outHookIndex = { out: 9, innerOutYes: 4, innerOutNo: 3 };
        this.leftBranchHeight = 0;
        this.rightBranchHeight = 0;
        this.plusRing = 10;
        this.plusBottom = 20;
        this.widthLine = 60;
        this.factorX = 0;
        this.yhtext = 20;
        this.wLang = 5;
        this.errorTxtW = 30;
        this.errorTxtH = 35;
        this.textProps = { startText: 10, verticalAlignText: 33, horizontalAlignText: 19, substring: 10 }
        this.hooks = isProgram ? [
            new Hook(canvas, x, y, w, h, false, "ring", '', 'in', type),
            new Hook(canvas, x, y, w, h, false, "hook", 'arms-left-top', 'join', type),
            new Hook(canvas, x, y, w, h, false, "hook", 'arms-rigth-top', 'join', type),
            new Hook(canvas, (this.x - this.w) - this.outLineHeight + this.incrementOutLine, this.y + this.h, w, h, false, "hook", 'bottom', 'inner-out-no', type),
            new Hook(canvas, (this.x + this.w) + this.outLineHeight + this.incrementOutLine, this.y + this.h, w, h, false, "hook", 'bottom', 'inner-out-yes', type),
            new Hook(canvas, (this.x - this.w) - this.hookLineHeight, this.y + 10 + h + this.hookLineHeight, w, h, true, "ring", '', 'inner-in', type),
            new Hook(canvas, (this.x + this.w) + this.hookLineHeight, this.y + 10 + h + this.hookLineHeight, w, h, true, "ring", '', 'inner-in', type),
            new Hook(canvas, (this.x - this.w) - this.hookLineHeight, this.y + 20 + h + this.hookLineHeight, w, h, false, "hook", 'arms-left-bottom', 'join', type),
            new Hook(canvas, (this.x + this.w) + this.hookLineHeight, this.y + 20 + h + this.hookLineHeight, w, h, false, "hook", 'arms-rigth-bottom', 'join', type),
            new Hook(canvas, x, this.y + 20 + h + this.outLineHeight + this.incrementOutLine, w, h, false, "hook", 'bottom', 'out', type)
        ] : [];
        this.cogwheel = isProgram ? new CogwheelBlock(canvas, x, y, w, h, 5, 25, id) : null;   
        this.ifScopeBranchRight = new BlockState();
        this.ifScopeBranchLeft = new BlockState();
    }

    render() {
        this.resize();
        const { blockColor, fontColor, lineColor } = !this.colors ? 
                configEditor.flow.customizedBlocks.ifBlock : this.colors;
        this.setRenderColor({ blockColor, lineColor });
        this.c.ctx.save();
        this.c.ctx.beginPath();
        this.c.ctx.moveTo(this.x, this.y);
        this.c.ctx.lineTo(this.x + this.w, this.y + this.h);
        this.c.ctx.lineTo(this.x, this.y + this.h * 2);
        this.c.ctx.lineTo(this.x - this.w, this.y + this.h);
        this.c.ctx.closePath();
        this.c.ctx.fill();

        this.c.ctx.stroke();

        if (!this.editing) {
            this.c.ctx.fillStyle = (this.c.tabs[this.c.selectedTab].id == '1' && !this.isProgram) ? '#858585' : fontColor;
            this.c.ctx.font = `${this.fontSizeCode}px ${this.fontName}`;
            this.c.ctx.textAlign = this.isProgram ? "start" : "center";
            const { textW, code } = this.renderTextCode({ horizontalText: this.textProps.horizontalAlignText, maxWidth: this.w * 1.8 });
            this.c.ctx.fillText(code, textW, this.y + this.h / 2 + this.textProps.verticalAlignText, this.w * 1.8);
        }

        if ((this.x + this.w > 200) && (!this.grabed)) {
          this.c.ctx.fillStyle = '#000000';
          this.c.ctx.font = `bold ${this.fontSize - 8}px ${this.fontName}`;
          this.c.ctx.textAlign = "center";
          this.c.ctx.fillText(LANGUAGE_FLOW[CURRENT_LANG].no, this.x - this.w - this.c.ctx.measureText(LANGUAGE_FLOW[CURRENT_LANG].no).width, this.y + this.h + this.yhtext);
          this.c.ctx.fillText(LANGUAGE_FLOW[CURRENT_LANG].yes, this.x + this.w + this.c.ctx.measureText(LANGUAGE_FLOW[CURRENT_LANG].yes).width - this.wLang, this.y + this.h + this.yhtext);
          if (this.compileError.hasError) {
            const width = this.c.ctx.measureText('Error !!').width - this.errorTxtW;
            this.drawErrorText('Error !!', this.fontSizeCode, this.x + this.w + width, this.y + this.h + this.errorTxtH);
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

    resize() {
      this.c.ctx.font = `${this.fontSize}px ${this.fontName}`;
      if (this.isProgram && !this.grabed && !this.isLocked) {
        if (this.c.expanded && this.hooks[0].occupied) {
            const w = !Utils.isEmpty(this.code) ? this.c.ctx.measureText(this.code).width : this.w;
            this.w = !Utils.isEmpty(this.code) ? w < this.w + 60 ? this.w : w - 60 : this.w;
            this.blockProps.w = (this.w * 2) + (this.hookLineWidth * 2);
            this.lastDimension.w = this.widthBeforeExpand + (this.w * 2) + (this.hookLineWidth * 2) - 240;
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
        this.updateBreakpointMove(x, y + this.h * 2);
      }
    }

    updateHooksMove(x, y) {
      this.hooks[0].x = x;
      this.hooks[0].y = y;
      this.hooks[0].w = this.w;
      this.hooks[0].h = this.h;
      this.hooks[1].x = x;
      this.hooks[1].y = y;
      this.hooks[1].w = this.w;
      this.hooks[1].h = this.h;
      this.hooks[1].incrementWidthLeftLine = this.incrementWidthLeftLine;
      this.hooks[2].x = x;
      this.hooks[2].y = y;
      this.hooks[2].w = this.w;
      this.hooks[2].h = this.h;
      this.hooks[2].incrementWidthRightLine = this.incrementWidthRightLine;
      this.hooks[3].x = (x - this.w) - this.hookLineHeight + this.incrementWidthLeftLine;
      this.hooks[3].y = y + this.outLineHeight;
      this.hooks[3].w = this.w;
      this.hooks[3].h = this.h;
      this.hooks[4].x = (x + this.w) + this.hookLineHeight + this.incrementWidthRightLine;
      this.hooks[4].y = y + this.outLineHeight;
      this.hooks[4].w = this.w;
      this.hooks[4].h = this.h;
      this.hooks[5].x = (x - this.w) - this.hookLineHeight + this.incrementWidthLeftLine;
      this.hooks[5].y = y + this.plusRing + this.h + this.hookLineHeight + this.incrementLeftRing;
      this.hooks[5].w = this.w;
      this.hooks[5].h = this.h;
      this.hooks[6].x = (x + this.w) + this.hookLineHeight + this.incrementWidthRightLine;
      this.hooks[6].y = y + this.plusRing + this.h + this.hookLineHeight + this.incrementRightRing;
      this.hooks[6].w = this.w;
      this.hooks[6].h = this.h;
      this.hooks[7].x = (x - this.w) - this.hookLineHeight + this.incrementWidthLeftLine;
      this.hooks[7].y = y + this.plusBottom + this.h + this.hookLineHeight + this.heightLeftLine;
      this.hooks[7].w = this.w;
      this.hooks[7].h = this.h;
      this.hooks[7].hookLineHeight = this.incrementHeightLeftLine;
      this.hooks[7].incrementWidthLeftLine = -this.incrementWidthLeftLine;
      this.hooks[8].x = (x + this.w) + this.hookLineHeight + this.incrementWidthRightLine;
      this.hooks[8].y = y + this.plusBottom + this.h + this.hookLineHeight + this.heightRightLine;
      this.hooks[8].w = this.w;
      this.hooks[8].h = this.h;
      this.hooks[8].hookLineHeight = this.incrementHeightRightLine;
      this.hooks[8].incrementWidthRightLine = -this.incrementWidthRightLine;
      this.hooks[9].x = x;
      this.hooks[9].y = this.y + this.plusBottom + this.h + this.hookLineHeight + this.incrementOutLine;
      this.hooks[9].w = this.w;
      this.hooks[9].h = this.h;
    }
    
    isTouching(x, y) {
      if ((((this.x < x) && (x < this.x + this.w)) ||
           ((this.x - this.w < x) && (x < this.x - this.w + this.w))) &&
           (((this.y < y) && (y < this.y + this.h)) ||
           ((this.y + this.w < y) && (y < this.y + this.w + this.h)))) {
        let ok = true;
        if (ok) return true;
        else return false;
      } else {
         return false;
        }
    }

    updateHeight(props) {
      const { leftBranchHeight, rightBranchHeight, incrementOutLine, incrementHeightLeftLine, incrementHeightRightLine, incrementLeftRing, incrementRightRing, heightLeftLine, heightRightLine } = props;
      this.incrementOutLine = incrementOutLine;
      this.incrementHeightRightLine = incrementHeightRightLine;
      this.incrementHeightLeftLine = incrementHeightLeftLine;
      this.incrementLeftRing = incrementLeftRing;
      this.incrementRightRing = incrementRightRing;
      this.heightLeftLine = heightLeftLine;
      this.heightRightLine = heightRightLine;
      this.leftBranchHeight = leftBranchHeight;
      this.rightBranchHeight = rightBranchHeight;
      this.setAccumulativeHeight();
    }

    setAccumulativeHeight() {
      this.accumulativeHeight = this.leftBranchHeight >= this.rightBranchHeight ? this.leftBranchHeight : this.rightBranchHeight;
      this.lastDimension.h = this.accumulativeHeight;
      this.blockProps.fullH = this.blockProps.h + this.accumulativeHeight;
    }
    
    updateWidth(branchWidthYes, branchWidthNo, plusIfWYes, plusIfWNo) {
      this.incrementWidthRightLine = branchWidthYes;
      this.incrementWidthLeftLine = branchWidthNo > 0 ? (-1 * branchWidthNo) : branchWidthNo;
      this.branchDimension = { r: this.incrementWidthRightLine + this.w + this.hookLineWidth + plusIfWYes, l: Math.abs(this.incrementWidthLeftLine) + this.w + this.hookLineWidth + plusIfWNo };
      this.lastDimension.w = this.branchDimension.r + this.branchDimension.l;
      this.widthBeforeExpand = this.lastDimension.w;
    }

    edit() {
      document.getElementById("text-box").style.display = "block";
      document.getElementById("text-box").style.top = this.y + this.h / 2 - 9 + this.c.yScroll + this.c.yOffset + "px";
      document.getElementById("text-box").style.left = this.x + this.c.xScroll + "px";
      document.getElementById("text").style.width = this.w + "px";
      document.getElementById("text").style.fontSize = '20px';
      document.getElementById("text").value = this.code;
      document.getElementById("text").blur();
    }

    getBlockDistance(ringBlock) {
      const { x, y, i } = ringBlock;
      const a = this.hooks[i].x - x;
      const b = this.hooks[i].y + 70 - y;
      const distance = Math.sqrt(a * a + b * b);
      const passed = distance <= 5 && distance >= -2;
      return { passed, distance }
    }

}