class SelectBlock {
  constructor(canvas, x, y) {
    this.c = canvas;
    this.x = x;
    this.y = y;
    this.w = 0;
    this.h = 0;
    this.colorLine = 'rgb(255, 0, 0)';
    this.colorFill = 'rgba(255, 0, 0, 0.1)';
  }

  render() {
    this.c.ctx.save();
    this.c.ctx.beginPath();
    this.c.ctx.lineWidth = 2;
    this.c.ctx.setLineDash([10, 5]);
    this.c.ctx.strokeStyle = this.colorLine;
    this.c.ctx.fillStyle = this.colorFill;
    this.c.ctx.fillRect(this.x, this.y, this.w, this.h);
    this.c.ctx.strokeRect(this.x, this.y, this.w, this.h);
    this.c.ctx.setLineDash([]);
    this.c.ctx.closePath();
    this.c.ctx.restore();
  }

  move(x, y) {
    this.w = x - this.x;
    this.h = y - this.y;
  }
  
  isPointInRectangle(x, y) {
    return ((x > this.x && x < this.x + this.w) && (y > this.y) && (y < this.y + this.h));
  }
  
  getDistance(x, y) {
    const point = (this.x + this.w) / 2;
    const deltaX = point - x;
    const deltaY = this.y - y;
    return Math.sqrt(deltaX ** 2 + deltaY ** 2);
  }
}