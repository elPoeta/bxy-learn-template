class DoWhileBlock extends Block {
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
    this.doWhileDefaultAccum = 80 / 1.5;
    this.accumulativeHeight = this.doWhileDefaultAccum;
    this.radiusX = 30 / 1.5;
    this.radiusY = 60 / 1.5;
    this.ellipseW = w / 2;
    this.ellipseH = h / 2;
    this.blockProps = {
      w: 240 / 1.5,
      h: 210 / 1.5,
      fullH: 210 / 1.5,
      defaultLongBranch: 60 / 1.5,
      accumH: this.doWhileDefaultAccum,
      branch: "none",
      widthLine: 60 / 1.5,
    };
    this.lastDimension = { w: 240 / 1.5, h: 0 };
    this.widthBeforeExpand = 240 / 1.5;
    this.hookLineHeight = 60 / 1.5;
    this.widthLine = 60 / 1.5;
    this.outLineHeight = 60 / 1.5;
    this.incrementOutLine = 60 / 1.5;
    this.incrementRingLine = 60 / 1.5;
    this.innerOutLineHeight = 60 / 1.5;
    this.incrementRightLine = 60 / 1.5;
    this.incrementLeftLine = 60 / 1.5;
    this.incrementWidthLeftLine = 60 / 1.5;
    this.plusRing = 10 / 1.5;
    this.plusHookW = 60 / 1.5;
    this.plusHookH = 20 / 1.5;
    this.yhtext = 15;
    this.wLang = 5;
    this.textProps.startText = 5;
    this.errorTxt = 20;
    this.outHookIndex = { out: 5, innerOutYes: 1, innerOutNo: 1 };
    this.hooks = isProgram
      ? [
          new Hook(
            canvas,
            x + w / 2,
            y +
              10 / 1.5 -
              this.hookLineHeight +
              this.incrementRingLine +
              20 / 1.5,
            w,
            h,
            false,
            "ring",
            "",
            "in",
            type
          ),
          new Hook(
            canvas,
            x + w / 2,
            y + 10 / 1.5 - this.outLineHeight + this.incrementOutLine - h / 2,
            w,
            h,
            false,
            "hook",
            "bottom",
            "inner-out-yes",
            type
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
            type
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
            type,
            this.incrementLeftLine
          ),
          new Hook(
            canvas,
            x + w / 2,
            y,
            w,
            h,
            true,
            "ring",
            "",
            "in-inner",
            type
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
            "out",
            type
          ),
        ]
      : [];
    this.cogwheel = isProgram
      ? new CogwheelBlock(canvas, x, y, w, h, 20, 10, id)
      : null;
    this.doWhileScope = new BlockState();
  }

  render() {
    this.resize();
    const { blockColor, fontColor, lineColor } = !this.colors
      ? configEditor.flow.customizedBlocks.doWhileBlock
      : this.colors;
    this.setRenderColor({ blockColor, lineColor });
    this.c.ctx.save();
    this.c.ctx.scale(this.scale, this.scale);
    this.c.ctx.beginPath();
    this.c.ctx.ellipse(
      this.x + this.ellipseW,
      this.y + this.ellipseH,
      this.radiusX,
      this.radiusY,
      Math.PI / 2,
      0,
      2 * Math.PI
    );
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
        this.x - this.hookLineHeight / 2,
        this.y + this.h / 2 - this.yhtext
      );
      this.c.ctx.fillText(
        LANGUAGE_FLOW[CURRENT_LANG].no,
        this.x +
          this.w +
          this.c.ctx.measureText(LANGUAGE_FLOW[CURRENT_LANG].no).width +
          this.wLang,
        this.y + this.h / 2 + this.yhtext
      );
      if (this.compileError.hasError) {
        const width = this.c.ctx.measureText("Error !!").width - this.errorTxt;
        this.drawErrorText(
          "Error !!",
          this.fontSizeCode,
          this.x + this.w + width,
          this.y + this.h
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
    this.hooks[0].y =
      y + this.plusRing - this.incrementRingLine * 2 + this.h / 2;
    this.hooks[0].w = this.w;
    this.hooks[0].h = this.h;

    this.hooks[1].x = x + this.w / 2;
    this.hooks[1].y =
      y -
      this.innerOutLineHeight -
      this.plusHookW +
      this.h / 2 +
      this.plusHookH;
    this.hooks[1].w = this.w;
    this.hooks[1].h = this.h;

    this.hooks[2].x = x + this.w;
    this.hooks[2].y = y + this.h / 2;
    this.hooks[2].incrementRightLine = this.incrementRightLine;
    this.hooks[2].w = this.w;
    this.hooks[2].h = this.h;

    this.hooks[3].x = x;
    this.hooks[3].y = y + this.h / 2;
    this.hooks[3].incrementLeftLine = this.incrementLeftLine * 2;
    this.hooks[3].incrementWidthLeftLine = this.incrementWidthLeftLine;
    this.hooks[3].w = this.w;
    this.hooks[3].h = this.h;

    this.hooks[4].x = x + this.w / 2;
    this.hooks[4].y = y;
    this.hooks[4].w = this.w;
    this.hooks[4].h = this.h;

    this.hooks[5].x = x + this.w / 2;
    this.hooks[5].y = y + this.outLineHeight;
    this.hooks[5].w = this.w;
    this.hooks[5].h = this.h;
  }

  resize() {
    this.c.ctx.font = `${this.fontSize}px ${this.fontName}`;
    if (this.isProgram && !this.grabed && !this.isLocked) {
      if (this.c.expanded && this.hooks[0].occupied) {
        const w = !Utils.isEmpty(this.code)
          ? this.c.ctx.measureText(this.code).width + 20
          : this.w;
        this.w = !Utils.isEmpty(this.code) ? (w < this.w ? this.w : w) : this.w;
        this.ellipseW = this.w / 2;
        this.radiusY = this.ellipseW;
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
    let { height, isRemoved } = props;
    this.incrementLeftLine += isRemoved
      ? height / 2
      : height > 0
      ? height / 2
      : 0;
    this.incrementRingLine += isRemoved
      ? height / 2
      : height > 0
      ? height / 2
      : 0;
    this.innerOutLineHeight += isRemoved ? height : height > 0 ? height : 0;
    if (this.hooks[0].occupied && !this.isLocked) this.y += height;
  }

  updateWidth(branchWidth) {
    this.incrementWidthLeftLine = branchWidth + this.widthLine;
    this.incrementWidthRightLine = branchWidth + this.widthLine;
    this.lastDimension.w =
      Math.abs(this.incrementWidthLeftLine) +
      Math.abs(this.incrementWidthRightLine) +
      this.w;
    this.widthBeforeExpand = this.lastDimension.w;
  }

  edit() {
    document.getElementById("text-box").style.display = "block";
    document.getElementById("text-box").style.top =
      this.y + this.c.yScroll + this.c.yOffset - this.h / 2 + 85 + "px";
    document.getElementById("text-box").style.left =
      this.x + this.c.xScroll + "px";
    document.getElementById("text").style.width = this.w + "px";
    document.getElementById("text").style.fontSize = "18px";
    document.getElementById("text").value = this.code;
    document.getElementById("text").blur();
  }

  getBlockDistance(ringBlock) {
    const { x, y, i } = ringBlock;
    const a = this.hooks[i].x - x;
    const b = this.hooks[i].y + 70 / 1.5 - y;
    const distance = Math.sqrt(a * a + b * b);
    const passed = distance <= 5 && distance >= -2;
    return { passed, distance: -distance };
  }
}
