class Hook {
  constructor(
    canvas,
    x,
    y,
    w,
    h,
    occupied,
    type,
    directions,
    ioType,
    blockType,
    incrementLeftLine
  ) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.outLineHeight = 60 / 1.5;
    this.hookLineHeight = 60 / 1.5;
    this.incrementBottomLine = 0;
    this.incrementRightLine = 0;
    this.incrementLeftLine = incrementLeftLine || 0;
    this.incrementWidthLeftLine = 0;
    this.incrementWidthRightLine = 0;
    this.incrementHeightLeftLine = 0;
    this.incrementHeightRightLine = 0;
    this.diagonalArrowLeft = 15 / 1.5;
    this.diagonalArrowRight = 10 / 1.5;
    this.plusLoopH = 70 / 1.5;
    this.plusDoWhileH = 10 / 1.5;
    this.type = type;
    this.ioType = ioType;
    this.occupied = occupied;
    this.isIntercepted = false;
    this.error = false;
    this.selected = false;
    this.grabed = false;
    this.directions = directions;
    this.scale = 1;
    this.c = canvas;
    this.radius = 8 / 1.5;
    this.blockType = blockType;
    this.isLocked = false;
    this.lineColor = "#000000";
    this.highlighted = false;
  }

  render() {
    this.c.ctx.strokeStyle = this.isIntercepted
      ? "#46ea4b"
      : this.error
      ? "red"
      : this.selected || this.highlighted
      ? "blue"
      : this.lineColor;
    this.c.ctx.lineCap = "round";
    switch (this.type) {
      case "ring":
        this.c.ctx.fillStyle = this.isIntercepted
          ? "#46ea4b"
          : this.isLocked
          ? "#ff931e"
          : this.occupied
          ? "green"
          : "red";
        this.c.ctx.beginPath();
        this.c.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.c.ctx.closePath();
        this.c.ctx.fill();
        this.c.ctx.stroke();
        break;
      case "hook":
        switch (this.directions) {
          case "bottom":
            this.c.ctx.beginPath();
            this.c.ctx.moveTo(this.x, this.y);
            this.c.ctx.lineTo(this.x, this.y + this.outLineHeight);
            this.c.ctx.stroke();
            this.c.ctx.beginPath();
            this.c.ctx.moveTo(this.x + 1, this.y + this.outLineHeight - 1);
            this.c.ctx.lineTo(
              this.x + this.diagonalArrowLeft + 1,
              this.y + this.outLineHeight - this.diagonalArrowRight
            );
            this.c.ctx.stroke();
            this.c.ctx.beginPath();
            this.c.ctx.moveTo(this.x - 1, this.y + this.outLineHeight - 1);
            this.c.ctx.lineTo(
              this.x - this.diagonalArrowLeft - 1,
              this.y + this.outLineHeight - this.diagonalArrowRight
            );
            this.c.ctx.moveTo(this.x, this.y + this.outLineHeight);
            this.c.ctx.stroke();
            break;
          case "right":
            this.c.ctx.beginPath();
            this.c.ctx.moveTo(this.x, this.y);
            if (this.blockType === "loopBlock") {
              this.c.ctx.lineTo(
                this.x + this.hookLineHeight + this.incrementWidthRightLine,
                this.y
              );
              this.c.ctx.lineTo(
                this.x + this.hookLineHeight + this.incrementWidthRightLine,
                this.y +
                  this.hookLineHeight +
                  this.incrementHeightRightLine -
                  this.hookLineHeight / 2 +
                  this.plusLoopH
              );
              this.c.ctx.lineTo(
                this.x - this.w / 2,
                this.y +
                  this.hookLineHeight +
                  this.incrementHeightRightLine -
                  this.hookLineHeight / 2 +
                  this.plusLoopH
              );
            } else if (this.blockType === "doWhileBlock") {
              this.c.ctx.lineTo(this.x + this.hookLineHeight, this.y);
              this.c.ctx.lineTo(
                this.x + this.hookLineHeight,
                this.y + this.incrementRightLine
              );
              this.c.ctx.lineTo(
                this.x - this.w / 2,
                this.y + this.incrementRightLine
              );
            }
            this.c.ctx.stroke();
            break;
          case "left":
            this.c.ctx.beginPath();
            this.c.ctx.moveTo(this.x, this.y);
            if (this.blockType === "loopBlock") {
              this.c.ctx.lineTo(
                this.x - this.hookLineHeight - this.incrementWidthLeftLine,
                this.y
              );
              this.c.ctx.lineTo(
                this.x - this.hookLineHeight - this.incrementWidthLeftLine,
                this.y +
                  this.hookLineHeight +
                  this.incrementHeightLeftLine +
                  this.plusLoopH
              );
              this.c.ctx.lineTo(
                this.x + this.w / 2,
                this.y +
                  this.hookLineHeight +
                  this.incrementHeightLeftLine +
                  this.plusLoopH
              );
            } else if (this.blockType === "doWhileBlock") {
              this.c.ctx.lineTo(this.x - this.incrementWidthLeftLine, this.y);
              this.c.ctx.lineTo(
                this.x - this.incrementWidthLeftLine,
                this.y - this.incrementLeftLine + this.plusDoWhileH
              );
              this.c.ctx.lineTo(
                this.x - this.plusDoWhileH + this.w / 2,
                this.y - this.incrementLeftLine + this.plusDoWhileH
              );
            }
            this.c.ctx.stroke();
            break;
          case "arms-left-top":
            this.c.ctx.beginPath();
            this.c.ctx.moveTo(this.x - this.w, this.y + this.h);
            this.c.ctx.lineTo(
              this.x -
                this.w -
                this.hookLineHeight +
                this.incrementWidthLeftLine,
              this.y + this.h
            );
            this.c.ctx.stroke();
            break;
          case "arms-rigth-top":
            this.c.ctx.beginPath();
            this.c.ctx.moveTo(this.x + this.w, this.y + this.h);
            this.c.ctx.lineTo(
              this.x +
                this.w +
                this.hookLineHeight +
                this.incrementWidthRightLine,
              this.y + this.h
            );
            this.c.ctx.stroke();
            break;
          case "arms-left-bottom":
            this.c.ctx.beginPath();
            this.c.ctx.moveTo(this.x, this.y);
            this.c.ctx.lineTo(
              this.x,
              this.y + this.hookLineHeight + this.incrementHeightLeftLine
            );
            this.c.ctx.lineTo(
              this.x + this.w * 2 + this.incrementWidthLeftLine,
              this.y + this.hookLineHeight + this.incrementHeightLeftLine
            );
            this.c.ctx.stroke();
            break;
          case "arms-rigth-bottom":
            this.c.ctx.beginPath();
            this.c.ctx.moveTo(this.x, this.y);
            this.c.ctx.lineTo(
              this.x,
              this.y + this.hookLineHeight + this.incrementHeightRightLine
            );
            this.c.ctx.lineTo(
              this.x - this.w * 2 + this.incrementWidthRightLine,
              this.y + this.hookLineHeight + this.incrementHeightRightLine
            );
            this.c.ctx.stroke();
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  isColliding(o) {
    if (this.x < o.x + o.w && o.x < this.x + this.w) {
      if (this.y < o.y + o.h && o.y < this.y + this.h) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isLineInterceptCircle(C, radius) {
    let dist;
    let A = { x: this.x, y: this.y };
    let B = { x: this.x, y: this.y + this.h };
    const v1x = B.x - A.x;
    const v1y = B.y - A.y;
    const v2x = C.x - A.x;
    const v2y = C.y - A.y;
    const u = (v2x * v1x + v2y * v1y) / (v1y * v1y + v1x * v1x);
    if (u >= 0 && u <= 1) {
      dist = (A.x + v1x * u - C.x) ** 2 + (A.y + v1y * u - C.y) ** 2;
    } else {
      dist =
        u < 0
          ? (A.x - C.x) ** 2 + (A.y - C.y) ** 2
          : (B.x - C.x) ** 2 + (B.y - C.y) ** 2;
    }
    return dist < radius * radius;
  }
}
