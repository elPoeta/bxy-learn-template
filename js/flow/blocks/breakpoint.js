class Breakpoint {
  constructor(canvas, x, y, blockId) {
    this.c = canvas;
    this.x = x;
    this.y = y;
    this.blockId = blockId;
    this.radius = 12 / 1.5;
    this.id = flowChartEditor.uuid();
    this.color = "#b9360a";
  }

  render() {
    this.c.ctx.lineWidth = 1; //2
    this.c.ctx.strokeStyle = "#7a280c";
    this.c.ctx.fillStyle = this.color;
    this.c.ctx.beginPath();
    this.c.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.c.ctx.closePath();
    this.c.ctx.fill();
    this.c.ctx.stroke();
  }

  isTouching(x, y) {
    const distancesquared =
      (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y);
    return distancesquared <= this.radius * this.radius;
  }

  addToGlobalBreakpoint() {
    this.c.addGlobalBreakpoint(this.blockId, this.id);
  }

  removeFromGlobalBreakpoint() {
    this.c.removeGlobalBreakpointById(this.blockId);
  }
}
