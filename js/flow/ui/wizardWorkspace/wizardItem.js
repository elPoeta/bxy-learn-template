class WizardItem {
  constructor() {
    this.x = 10;
    this.y = 10;
    this.w = 75;
    this.h = 25;
    this.grab = false;
    this.grabPosition = { x: this.w / 2, y: this.h / 2 };
  }

  draw(ctx) {
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }

  move(x, y) {
    if (!this.grab) return;
    this.x = x;
    this.y = y;
  }

  isTouching(x, y) {
    if (
      this.x < x &&
      x < this.x + this.w &&
      this.y < y &&
      y < this.y + this.h
    ) {
      let ok = true;
      if (ok) return true;
      else return false;
    } else {
      return false;
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
}
