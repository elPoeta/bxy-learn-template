class WizardCanvas {
  constructor(width, height) {
    this.canvasElement = document.querySelector("#canvasWizard");
    this.ctx = this.canvasElement.getContext("2d");
    this.width = width;
    this.height = height;
    this.items = [new WizardItem()];
    this.paletteWizard = new WizardPalette();
    this.canvasElement.addEventListener(
      "mousemove",
      this.handlerMouseMove.bind(this)
    );
    this.canvasElement.addEventListener(
      "mousedown",
      this.handlerMouseDown.bind(this)
    );
    this.canvasElement.addEventListener(
      "mouseup",
      this.handlerMouseUp.bind(this)
    );
    //this.canvasElement.addEventListener("click", this.handlerMouseClick.bind(this));
    this.canvasElement.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      false
    );
    this.canvasElement.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      false
    );
    this.canvasElement.addEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
      false
    );
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.draw();
  }

  draw() {
    [...[...this.items]].forEach((el) => el.draw(this.ctx));
  }

  handlerMouseDown(ev) {
    this.mouseX = ev.clientX - this.ctx.canvas.offsetLeft;
    this.mouseY = ev.clientY - this.ctx.canvas.offsetTop;
    this.items = this.items.map((item) => {
      if (item.isTouching(this.mouseX, this.mouseY)) {
        item.grab = true;
      }
      return item;
    });
    this.update();
  }

  handlerMouseMove(ev) {
    this.mouseX = ev.clientX - this.ctx.canvas.offsetLeft;
    this.mouseY = ev.clientY - this.ctx.canvas.offsetTop;
    this.items = this.items.map((item) => {
      if (item.isTouching(this.mouseX, this.mouseY)) {
        item.move(
          this.mouseX - item.grabPosition.x,
          this.mouseY - item.grabPosition.y
        );
      }
      return item;
    });
    this.update();
  }

  handlerMouseUp(ev) {
    this.mouseX = ev.clientX - this.ctx.canvas.offsetLeft;
    this.mouseY = ev.clientY - this.ctx.canvas.offsetTop;
    this.items = this.items.map((item) => {
      item.grab = false;
      return item;
    });
    this.update();
  }

  handleTouchStart(ev) {
    ev.preventDefault();
    const touch = ev.touches[0];
    Utils.dispatchMouseEvent({
      touch,
      type: "mousedown",
      element: this.canvasElement,
    });
  }

  handleTouchMove(ev) {
    ev.preventDefault();
    const touch = ev.touches[0];
    Utils.dispatchMouseEvent({
      touch,
      type: "mousemove",
      element: this.canvasElement,
    });
  }

  handleTouchEnd(ev) {
    ev.preventDefault();
    const touch = ev.touches[0];
    Utils.dispatchMouseEvent({
      touch,
      type: "mouseup",
      element: this.canvasElement,
    });
  }
}
