class EndBlock extends ContainerBlock {
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
    this.blockProps = { w: 120 / 1.5, h: 70 / 1.5, fullH: 70 / 1.5 };
    this.outHookIndex = { out: -1, innerOutYes: -1, innerOutNo: -1 };
    this.hooks = [
      new Hook(canvas, x + w / 2, y, w, h, true, "ring", "", "in", type),
    ];
  }

  move(x, y) {
    this.x = x;
    this.y = y;
    this.hooks[0].x = x + this.w / 2;
    this.hooks[0].y = y;
  }
}
