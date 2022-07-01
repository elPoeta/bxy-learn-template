class BlockMenu {
  constructor(canvas, index) {
    this.c = canvas;
    this.index = index;
  }

  show() {
    this.divContainer = document.createElement("div");
    this.divContainer.id = "blockFloatingMenuContainer";
    this.divContainer.classList = ["blockFloatingMenuContainerOverlay"];
    this.divContainer.innerHTML = this.template();
    document
      .querySelector("#bxyCanvasContainer")
      .appendChild(this.divContainer);
    this.selectDOMElements();
    this.addListeners();
  }

  template() {
    const classNames =
      window.innerWidth < window.innerHeight
        ? "bxy-floating-button-block-menu-grid-v"
        : "bxy-floating-button-block-menu-grid-h";
    return `<div class="bxy-floating-button-block-menu ${classNames}">
    <section id="editBlockFloating" class="bxy-primary-menu">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </div>
    </section>

    <section id="breakpointBlockFloating" class="bxy-primary-menu">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v5a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clip-rule="evenodd" />
        </svg>
      </div>
    </section>

    <section id="copyBlockFloating" class="bxy-primary-menu">
      <div>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"  fill="currentColor">
          <path d="M11 0h-8c-0.553 0-1 0.447-1 1v12c0 0.552 0.447 1 1 1h5v2h2v-2h-1.999v-2h1.999v-2h-2v2h-4v-10h6v4h2v-5c0-0.552-0.447-1-1-1zM8 7v1h2v-2h-1c-0.553 0-1 0.447-1 1zM12 20h2v-2h-2v2zM12 8h2v-2h-2v2zM8 19c0 0.552 0.447 1 1 1h1v-2h-2v1zM17 6h-1v2h2v-1c0-0.552-0.447-1-1-1zM16 20h1c0.553 0 1-0.448 1-1v-1h-2v2zM16 12h2v-2h-2v2zM16 16h2v-2h-2v2z"></path>
        </svg>
      </div>
    </section>

    <section id="wrapFunctionBlockFloating" class="bxy-primary-menu">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
    </section>

    <section id="colorBlockFloating" class="bxy-primary-menu">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clip-rule="evenodd" />
        </svg>
      </div>
    </section>

    <section id="infoBlockFloating" class="bxy-primary-menu">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
    </section>
    </div>`;
  }

  selectDOMElements() {
    this.buttonsMenu = document.querySelector(
      ".bxy-floating-button-block-menu"
    );
  }

  addListeners() {
    this.divContainer.addEventListener("click", this.closeHandler.bind(this));
    this.buttonsMenu.addEventListener(
      "click",
      this.handleFloatingButtons.bind(this)
    );
  }

  handleFloatingButtons(ev) {
    const target = this.getTarget(ev.target);
    const targetId = target.id;
    switch (targetId) {
      case "editBlockFloating":
        this.edit();
        break;
      case "colorBlockFloating":
        const items = !this.c.wizardItems.length
          ? WizardItems.getAllItems()
          : this.c.wizardItems;
        const builderItems = WizardItems.getItemsByTypeBlock(
          items,
          this.c.program[this.index].type
        );
        const wizardWorkspace = new WizardWorkspace({
          canvas: this.c,
          block: this.c.program[this.index],
          blockIndex: this.index,
          builderItems,
        });
        wizardWorkspace.render();
      default:
        break;
    }
    //this.closeHandler();
  }

  getTarget(target) {
    const tagName = target.tagName.toLowerCase();
    return tagName === "section"
      ? target
      : tagName === "div"
      ? target.parentElement
      : tagName === "svg"
      ? target.parentElement.parentElement
      : target.parentElement.parentElement.parentElement;
  }

  edit() {
    this.c.markFlowchartAsSavedUnsaved(true);
    this.c.program[this.index].modal();
  }

  closeHandler(ev) {
    this.divContainer.remove();
    this.c.eventHandler.isEditing = false;
    this.c.ungrabedUi();
  }
}
