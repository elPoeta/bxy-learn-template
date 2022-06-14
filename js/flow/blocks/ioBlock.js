class IOBlock extends Block {
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
      w: 120 / 1.5,
      h: 130 / 1.5,
      fullH: 130 / 1.5,
      branch: "none",
      widthLine: 0,
    };
    this.outHookIndex = { out: 1, innerOutYes: 1, innerOutNo: 1 };
    this.errorTxtW = 20;
    this.errorTxtH = 10;
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
            this.type
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
            this.type
          ),
        ]
      : [];
    this.cogwheel = isProgram
      ? new CogwheelBlock(canvas, x, y, w, h, 20, 10, id)
      : null;
  }

  resize() {
    this.c.ctx.font = `${this.fontSize}px ${this.fontName}`;
    if (this.isProgram && !this.grabed && !this.isLocked) {
      if (this.c.expanded && this.hooks[0].occupied) {
        const plus = this.type === "codeBlock" ? 20 : 30;
        const w = !Utils.isEmpty(this.code)
          ? this.c.ctx.measureText(this.code).width + plus
          : this.w;
        this.w = !Utils.isEmpty(this.code) ? (w < this.w ? this.w : w) : this.w;
        this.blockProps.w = this.w;
        this.lastDimension.w = this.w;
        this.grabPosition.x = this.w / 2;
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

  edit() {
    // document.getElementById("text-box").style.display = "block";
    // document.getElementById("text-box").style.top =
    //   this.y +
    //   this.c.canvas.yScroll +
    //   this.c.canvas.yOffset -
    //   this.h / 2 +
    //   85 +
    //   "px";
    // document.getElementById("text-box").style.left =
    //   this.x + this.c.canvas.xScroll + "px";
    // document.getElementById("text").style.width = this.w + "px";
    // document.getElementById("text").style.fontSize = `20px`;
    // document.getElementById("text").value = this.code;
    // document.getElementById("text").blur();
  }

  getBlockDistance(ringBlock) {
    const { x, y } = ringBlock;
    const a = this.hooks[1].x - x;
    const b = this.hooks[1].y + 70 / 1.5 - y;
    const distance = Math.sqrt(a * a + b * b);
    const passed = distance <= 5 && distance >= -2;
    return { passed, distance };
  }

  setImportStatement(statementValue) {
    const importVarState =
      this.c.program[0].importsAndInstancesState.get("import");
    const value = !importVarState
      ? new Set([statementValue])
      : new Set([...importVarState.value, statementValue]);
    this.c.program[0].importsAndInstancesState.update("import", {
      name: "import",
      value,
      declarationType: "import",
    });
  }

  setInstanceStatement(statementValue) {
    const { name, value, declaration, declarationType, used } = statementValue;
    this.c.program[0].importsAndInstancesState.update(name, {
      name,
      value,
      declaration,
      declarationType,
      used,
    });
  }

  delImportStatement(importDef) {
    const importState =
      this.c.program[0].importsAndInstancesState.get("import");
    if (!importState) return;
    const arr = [...importState.value].filter((val) => val !== importDef);
    if (!arr.length) {
      this.c.program[0].importsAndInstancesState.remove("import");
    } else {
      this.c.program[0].importsAndInstancesState.update("import", {
        name: "import",
        value: new Set(arr),
        declarationType: "import",
      });
    }
  }

  delInstanceStatement(name) {
    this.c.program[0].importsAndInstancesState.remove(name);
  }
}
