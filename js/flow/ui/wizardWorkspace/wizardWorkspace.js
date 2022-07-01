class WizardWorkspace {
  constructor(props) {
    const { canvas, blockIndex, block, builderItems } = props;
    this.c = canvas;
    this.blockIndex = blockIndex;
    this.builderItems = builderItems;
    this.block = block;
    this.droppedElements = block.droppedElements;
    this.body = document.querySelector("body");
    //this.animate = this.animate.bind(this);
  }

  render() {
    this.container = document.createElement("div");
    this.container.id = "wizardWorkspaceContainer";
    this.container.setAttribute("class", "overlay");
    this.container.style.background = "#f9f9f9";
    this.container.innerHTML = this.template();
    this.body.appendChild(this.container);
    this.addListeners();
    this.createCanvas();
  }

  template() {
    return `
      <section>
        <div id="canvasWizardContainer">
          <canvas id="canvasWizard" width=300 heigth=300 style="border: 2px solid #000"></canvas>
        </div>
        <div class="containerManager">
           <button id='canvasCancelBtn'>Cancel</button>
           <button id='canvasAcceptBtn'>Accept</button>
        </div>
      </section>
    `;
  }

  addListeners() {
    this.containerManager = document.querySelector(".containerManager");
    this.containerManager.addEventListener(
      "click",
      this.handleContainerManager.bind(this)
    );
  }

  createCanvas() {
    this.canvasWizard = new WizardCanvas(300, 300);
    this.canvasWizard.update();
    // this.animate(0);
  }

  handleContainerManager(ev) {
    const target = ev.target;

    if (target.id === "canvasCancelBtn") {
      this.container.remove();
    }
  }

  // animate(timeStamp) {
  //   this.ctx.clearRect(0, 0, this.canvasWizard.width, this.canvasWizard.height);
  //   this.canvasWizard.draw();
  //   window.requestAnimationFrame(this.animate);
  // }
}
