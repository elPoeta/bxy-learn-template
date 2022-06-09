class TextPalette {
  constructor(canvas, x, y, w, h, text, type, scale) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.minw = w;
    this.error = false;
    this.code = text;
    this.editing = false;
    this.c = canvas;
    this.scale = scale || 1;
  }
  
  render() {
     this.c.ctx.save();
     this.c.ctx.scale(this.scale, this.scale);
     this.c.ctx.fillStyle = "black";
     this.c.ctx.font = "bold 17px Roboto";
     this.c.ctx.textAlign = "center";
     this.c.ctx.fillText(this.code, this.x + this.w / 2, this.y + this.h / 1.5);
     this.c.ctx.restore();
  }
  
  isTouching (x, y) {
    return false;
  }
}