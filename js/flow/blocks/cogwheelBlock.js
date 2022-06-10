class CogwheelBlock {
  constructor(canvas, x, y, w, h, shiftX, shiftY, blockId) {
    shiftX /= 1.5;
    shiftY /= 1.5;
    this.c = canvas;
    this.x = x + w + shiftX;
    this.y = y + shiftY;
    this.w = w;
    this.h = h;
    this.shiftX = shiftX;
    this.shiftY = shiftY;
    this.blockId = blockId;
    this.id = flowChartEditor.uuid();
    this.color = "#555555";
    this.notches = 7;
    this.radiusO = 15 / 1.5;
    this.radiusI = 11 / 1.5;
    this.radiusH = 6 / 1.5;
    this.taperO = 50 / 1.5;
    this.taperI = 30 / 1.5;
    this.pi2 = Math.PI * 2;
    this.angle = this.pi2 / (this.notches * 2);
    this.taperAI = this.angle * this.taperI * 0.005;
    this.taperAO = this.angle * this.taperO * 0.005;
  }

  render() {
    this.a = this.angle;
    this.toggle = false;
    this.c.ctx.beginPath();
    this.c.ctx.moveTo(
      this.x + this.radiusO * Math.cos(this.taperAO),
      this.y + this.radiusO * Math.sin(this.taperAO)
    );
    for (; this.a <= this.pi2; this.a += this.angle) {
      if (this.toggle) {
        this.c.ctx.lineTo(
          this.x + this.radiusI * Math.cos(this.a - this.taperAI),
          this.y + this.radiusI * Math.sin(this.a - this.taperAI)
        );
        this.c.ctx.lineTo(
          this.x + this.radiusO * Math.cos(this.a + this.taperAO),
          this.y + this.radiusO * Math.sin(this.a + this.taperAO)
        );
      } else {
        this.c.ctx.lineTo(
          this.x + this.radiusO * Math.cos(this.a - this.taperAO),
          this.y + this.radiusO * Math.sin(this.a - this.taperAO)
        );
        this.c.ctx.lineTo(
          this.x + this.radiusI * Math.cos(this.a + this.taperAI),
          this.y + this.radiusI * Math.sin(this.a + this.taperAI)
        );
      }
      this.toggle = !this.toggle;
    }
    this.c.ctx.closePath();
    this.c.ctx.moveTo(this.x + this.radiusH, this.y);
    this.c.ctx.arc(this.x, this.y, this.radiusH, 0, this.pi2);
    this.c.ctx.fillStyle = this.color;
    this.c.ctx.fill("evenodd");
    this.c.ctx.lineWidth = 1; //2
    this.c.ctx.strokeStyle = "#111111";
    this.c.ctx.stroke();
  }

  move(x, y, w, h) {
    this.x = x + w + this.shiftX;
    this.y = y + this.shiftY;
    this.w = w;
    this.h = h;
  }

  isTouching(x, y) {
    const distancesquared =
      (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y);
    return distancesquared <= this.radiusO * this.radiusO;
  }
}
