class LoopBlock extends Block {
  constructor(
    id,
    canvas,
    x,
    y,
    w,
    h,
    type,
    code,
    scaleFactor,
    isProgram,
    languageOutput
  ) {
    super(
      id,
      canvas,
      x,
      y,
      w,
      h,
      type,
      code,
      scaleFactor,
      isProgram,
      languageOutput
    );
    this.blockProps = {
      w: 240 / 1.5,
      h: 200 / 1.5,
      fullH: 200 / 1.5,
      defaultLongBranch: 60 / 1.5,
      branch: "none",
      widthLine: 60 / 1.5,
    };
    this.lastDimension = { w: 240 / 1.5, h: 0 };
    this.widthBeforeExpand = 240 / 1.5;
    this.hookLineHeight = 60 / 1.5;
    this.outLineHeight = 60 / 1.5;
    this.incrementOutLine = 60 / 1.5;
    this.incrementHeightLeftLine = 0;
    this.incrementHeightRightLine = 0;
    this.incrementBottomRing = 60 / 1.5;
    this.plusHook = 10 / 1.5;
    this.r = 10 / 1.5;
    this.xwText = 20;
    this.yhtext = 18;
    this.wLang = 5;
    this.textProps.startText = 3;
    this.errorTxt = 20;
    this.outHookIndex = { out: 4, innerOutYes: 1, innerOutNo: 1 };
    this.hooks = isProgram
      ? [
          new Hook(
            canvas,
            x + w / 2,
            y,
            w,
            h,
            false,
            "ring",
            "",
            "in",
            "loopBlock"
          ),
          new Hook(
            canvas,
            x + w / 2,
            y + h,
            w,
            h,
            false,
            "hook",
            "bottom",
            "inner-out-yes",
            "loopBlock"
          ),
          new Hook(
            canvas,
            x + w,
            y + h / 2,
            w,
            h,
            false,
            "hook",
            "right",
            "join",
            "loopBlock"
          ),
          new Hook(
            canvas,
            x,
            y + h / 2,
            w,
            h,
            false,
            "hook",
            "left",
            "join",
            "loopBlock"
          ),
          new Hook(
            canvas,
            x - h,
            y + h * 3 - h / 2 + 10,
            w,
            h,
            false,
            "hook",
            "bottom",
            "out",
            "loopBlock"
          ),
          new Hook(
            canvas,
            x + w / 2,
            y + h * 3 + 10,
            w,
            h,
            true,
            "ring",
            "",
            "end",
            "loopBlock"
          ),
        ]
      : [];
    this.cogwheel = isProgram
      ? new CogwheelBlock(canvas, x, y, w, h, 25, 10, id)
      : null;
  }

  render() {
    this.resize();
    const { blockColor, fontColor, lineColor } = !this.colors
      ? configEditor.flow.customizedBlocks[this.type]
      : this.colors;
    this.setRenderColor({ blockColor, lineColor });
    this.c.ctx.save();
    this.c.ctx.scale(this.scale, this.scale);
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(this.x + this.r, this.y);
    this.c.ctx.lineTo(this.x + this.w - this.r, this.y);
    this.c.ctx.quadraticCurveTo(
      this.x + this.w,
      this.y,
      this.x + this.w,
      this.y + this.r
    );
    this.c.ctx.lineTo(this.x + this.w, this.y + this.h - this.r);
    this.c.ctx.quadraticCurveTo(
      this.x + this.w,
      this.y + this.h,
      this.x + this.w - this.r,
      this.y + this.h
    );
    this.c.ctx.lineTo(this.x + this.r, this.y + this.h);
    this.c.ctx.quadraticCurveTo(
      this.x,
      this.y + this.h,
      this.x,
      this.y + this.h - this.r
    );
    this.c.ctx.lineTo(this.x, this.y + this.r);
    this.c.ctx.quadraticCurveTo(this.x, this.y, this.x + this.r, this.y);
    this.c.ctx.closePath();
    this.c.ctx.fill();
    this.c.ctx.stroke();

    if (!this.editing) {
      this.c.ctx.fillStyle =
        this.c.tabs[this.c.selectedTab].id == "1" && !this.isProgram
          ? "#858585"
          : fontColor;
      this.c.ctx.font = `${this.fontSizeCode}px ${this.fontName}`;
      this.c.ctx.textAlign = this.isProgram ? "start" : "center";
      const { code, textW } = this.renderTextCode({ maxWidth: this.w });
      this.c.ctx.fillText(
        code,
        textW,
        this.y + this.h / this.textProps.verticalAlignText,
        this.w
      );
    }

    if (this.x + this.w > 200 && !this.grabed) {
      this.c.ctx.fillStyle = "#000000";
      this.c.ctx.font = `bold ${this.fontSize - 8}px ${this.fontName}`;
      this.c.ctx.textAlign = "center";
      this.c.ctx.fillText(
        LANGUAGE_FLOW[CURRENT_LANG].yes,
        this.x + this.w / 2 + this.xwText,
        this.y + this.h + this.yhtext
      );
      this.c.ctx.fillText(
        LANGUAGE_FLOW[CURRENT_LANG].no,
        this.x - this.xwText,
        this.y + this.h / 2 + this.yhtext
      );
      this.c.ctx.fillText(
        LANGUAGE_FLOW[CURRENT_LANG].yes,
        this.x +
          this.w +
          this.c.ctx.measureText(LANGUAGE_FLOW[CURRENT_LANG].yes).width +
          this.wLang,
        this.y + this.h / 2 + this.yhtext
      );
      if (this.compileError.hasError) {
        const width = this.c.ctx.measureText("Error !!").width - this.errorTxt;
        this.drawErrorText(
          "Error !!",
          this.fontSizeCode,
          this.x + this.w + width,
          this.y + this.h + this.errorTxt
        );
      }
    }
    this.renderDependencies(lineColor);
    this.c.ctx.restore();
  }

  renderHooks(lineColor) {
    this.hooks = this.hooks.map((hook) => {
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
    if (this.grabed) {
      this.hooks[0].y = y - 30;
    } else {
      this.hooks[0].y = y;
    }

    this.hooks[1].x = x + this.w / 2;
    this.hooks[1].y = y + this.outLineHeight;
    this.hooks[1].w = this.w;
    this.hooks[1].h = this.h;

    this.hooks[2].x = x + this.w;
    this.hooks[2].y = y + this.h / 2;
    this.hooks[2].incrementWidthRightLine = this.incrementWidthRightLine;
    this.hooks[2].incrementHeightRightLine = this.incrementHeightRightLine;
    this.hooks[2].w = this.w;

    this.hooks[3].x = x;
    this.hooks[3].y = y + this.hookLineHeight / 2;
    this.hooks[3].incrementWidthLeftLine = this.incrementWidthLeftLine;
    this.hooks[3].incrementHeightLeftLine = this.incrementHeightLeftLine;
    this.hooks[3].w = this.w;

    this.hooks[4].x = x + this.w / 2;
    this.hooks[4].y =
      y + this.outLineHeight + this.incrementOutLine + this.plusHook;
    this.hooks[4].w = this.w;
    this.hooks[4].h = this.h;

    this.hooks[5].x = x + this.w / 2;
    this.hooks[5].y =
      y + this.hookLineHeight + this.incrementBottomRing + this.plusHook;
    this.hooks[5].w = this.w;
  }

  resize() {
    this.c.ctx.font = `${this.fontSize}px ${this.fontName}`;
    if (this.isProgram && !this.grabed && !this.isLocked) {
      if (this.c.expanded && this.hooks[0].occupied) {
        const w = !Utils.isEmpty(this.code)
          ? this.c.ctx.measureText(this.code).width + 20
          : this.w;
        this.w = !Utils.isEmpty(this.code) ? (w < this.w ? this.w : w) : this.w;
        this.blockProps.w = this.w + 120 / 1.5;
        this.lastDimension.w =
          this.widthBeforeExpand + this.blockProps.w - 240 / 1.5;
        this.grabPosition.x = this.w / 2;
      }
      this.x = this.getFixedX();
    }
    if (this.isLocked) this.x = this.getFixedX();
    this.move(this.x, this.y);
  }

  updateHeight(props) {
    const { plusOutHeight, plusHeight } = props;
    this.incrementHeightLeftLine = plusHeight;
    this.incrementHeightRightLine = plusHeight;
    this.incrementOutLine = plusOutHeight;
    this.incrementBottomRing = plusOutHeight;
  }

  updateWidth(branchWidth) {
    this.incrementWidthLeftLine = branchWidth;
    this.incrementWidthRightLine = branchWidth;
    this.lastDimension.w =
      Math.abs(this.incrementWidthLeftLine) +
      Math.abs(this.incrementWidthRightLine) +
      this.blockProps.w;
    this.widthBeforeExpand = this.lastDimension.w;
  }

  edit() {
    document.getElementById("text-box").style.display = "block";
    document.getElementById("text-box").style.top =
      this.y + this.c.yScroll + this.c.yOffset - this.h / 2 + 85 + "px";
    document.getElementById("text-box").style.left =
      this.x + this.c.xScroll + "px";
    document.getElementById("text").style.width = this.w + "px";
    document.getElementById("text").style.fontSize = `20px`;
    document.getElementById("text").value = this.code;
    document.getElementById("text").blur();
  }

  getBlockDistance(ringBlock) {
    const { x, y, i } = ringBlock;
    const a = this.hooks[i].x - x;
    const b = this.hooks[i].y + 70 / 1.5 - y;
    const distance = Math.sqrt(a * a + b * b);
    const passed = distance <= 5 && distance >= -2;
    return { passed, distance };
  }
}
