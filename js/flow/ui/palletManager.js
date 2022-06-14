class PaletteManager {
  constructor(canvas) {
    this.c = canvas;
    this.width = 120; //window.innerWidth > 1200 ? 200 : 120;
    this.jsonPalette = {
      io: ["define", "code", "input", "output"],
      loop: ["while", "doWhile", "for"],
      decision: ["if"],
      wrap: ["wrap"],
    };
    this.gap = 20;
    this.validKeys = ["io", "loop", "decision", "wrap"];
    this.validBlocks = [
      "define",
      "code",
      "input",
      "output",
      "while",
      "doWhile",
      "for",
      "if",
      "wrap",
    ];
    this.readyToRender = false;
    this.state = {
      OPEN: true,
    };
  }

  setReadyToRender(isReady) {
    this.readyToRender = isReady;
  }

  isReadyToRender() {
    return this.readyToRender;
  }

  getAllBlocks() {
    return this.jsonPalette;
  }

  getPalette() {
    return this.palette;
  }

  getWidth() {
    return this.width;
  }

  setCurrentState() {
    this.state.OPEN = !this.state.OPEN;
  }

  handleState() {
    this.setCurrentState();
    this.c.update();
  }

  createPalette(palette) {
    palette = !Utils.isEmpty(palette) ? palette : this.getAllBlocks();
    this.palette = [];
    const keys = {};
    this.yPaletteBlockAndText = 5;
    for (const [key, value] of Object.entries(palette)) {
      if (this.validKeys.includes(key)) {
        if (!keys.hasOwnProperty(key)) {
          this.palette.push(this.createTextPalette(key));
          this.yPaletteBlockAndText += this.gap;
        }
        value.forEach((val) => {
          if (this.validBlocks.includes(val)) {
            const { x, w, h } = this.getXWHBlockPalettePos(key);
            this.palette.push(
              BlockFactory.getImplementation(
                flowChartEditor.uuid(),
                this.c,
                `${val}Block`,
                x,
                this.yPaletteBlockAndText,
                w,
                h,
                LANGUAGE_FLOW[CURRENT_LANG][`${val}Block`],
                false,
                ""
              )
            );
            const plusH = val !== "if" ? h : h * 2;
            this.yPaletteBlockAndText =
              this.yPaletteBlockAndText + plusH + this.gap;
          }
        });
      }
    }
  }

  createTextPalette(key) {
    const text = this.getTextPalette(key);
    return new TextPalette(
      this.c,
      0,
      this.yPaletteBlockAndText,
      this.width, // 200 150 120
      15,
      LANGUAGE_FLOW[CURRENT_LANG][text],
      text,
      1
    );
  }

  getTextPalette(text) {
    switch (text) {
      case "wrap":
        return "textFunction";
      case "loop":
        return "textLoop";
      case "decision":
        return "textDecision";
      default:
        return "textIo";
    }
  }

  // getXWHBlockPalettePos(key) {
  //   const x = key !== 'decision' ? 40 : 100;
  //   const w = key !== 'decision' ? 120 : 60;
  //   return { x, w, h: 60 }
  // }
  getXWHBlockPalettePos(key) {
    const a = this.width === 200 ? 40 : 20;
    const b = this.width === 200 ? 100 : 60;
    const x = key !== "decision" ? a : b;
    const w = key !== "decision" ? 120 / 1.5 : 60 / 1.5;
    return { x, w, h: 60 / 1.5 };
  }
}
