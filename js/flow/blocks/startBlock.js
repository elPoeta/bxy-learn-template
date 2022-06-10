class StartBlock extends ContainerBlock {
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
      defaultLongBranch: 0,
    };
    this.outHookIndex = { out: 0, innerOutYes: 0, innerOutNo: 0 };
    this.hooks = [
      new Hook(
        canvas,
        x + w / 2,
        y + h,
        w,
        h,
        true,
        "hook",
        "bottom",
        "out",
        type
      ),
    ];
    this.projectCompositeId = null;
    this.fullCode = "";
    this.globalScope = new BlockState();
    this.importsAndInstancesState = new BlockState();
    this.cogwheel =
      canvas.tabs.length > 0 &&
      canvas.tabs[canvas.selectedTab].type === "f_body"
        ? new CogwheelBlock(canvas, x, y, w, h, 20, 10, id)
        : null;
    this.editable =
      canvas.tabs.length > 0 &&
      canvas.tabs[canvas.selectedTab].type === "f_body";
    this.yhtext = 15;
    this.wLang = 5;
    this.textProps.startText = 5;
  }

  move(x, y) {
    this.x = x;
    this.y = y;
    this.hooks[0].x = x + this.w / 2;
    this.hooks[0].y = y + this.h;
    this.hooks[0].w = this.w;
    this.hooks[0].h = this.h;
    this.updateCogwheelMove(x, y);
  }

  getBlockDistance(ringBlock) {
    const { x, y } = ringBlock;
    const a = this.hooks[0].x - x;
    const b = this.hooks[0].y + 70 / 1.5 - y;
    const distance = Math.sqrt(a * a + b * b);
    const passed = distance <= 5 && distance >= -2;
    return { passed, distance };
  }

  renderTextCode({ horizontalText, maxWidth }) {
    const textW = this.editable
      ? this.x + this.textProps.startText
      : this.x + this.w / 2;
    if (
      !this.editable ||
      Utils.isEmpty(this.code) ||
      typeof this.code !== "string"
    )
      return { code: this.code, textW };
    let code = "";
    const codeSplit = [...this.code];
    for (let i = 0; i < codeSplit.length; i++) {
      const width = this.c.ctx.measureText(code).width;
      if (width < maxWidth) {
        code += codeSplit[i];
      } else {
        code = this.replaceLastThreeCharacters(code);
        break;
      }
    }
    return { code, textW };
  }

  replaceLastThreeCharacters(code) {
    const length = code.length;
    if (length < 3) return code;
    return `${code.substring(0, length - 3)}...`;
  }
}
