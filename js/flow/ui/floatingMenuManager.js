class FloatingMenuManager {
  constructor(canvas) {
    this.c = canvas;
    this.isOpen = false;
    this.floatingMenuContainer = document.querySelector(
      ".bxy-floating-button-primary-menu"
    );
    this.primaryChilds = document.querySelectorAll(".bxy-primary-child");
    this.floatingMenuContainer.addEventListener(
      "click",
      this.handleFloatingButtons.bind(this)
    );
  }

  handleFloatingButtons(ev) {
    const target = this.getTarget(ev.target);
    const targetId = target.id;
    switch (targetId) {
      case "hamburgerFloatingCanvas":
        this.handleMenu();
        break;
      case "showHidePalette":
        this.handleShowHidePalette();
        break;
      case "fullscreen":
        this.handleFullscreen();
        break;
      case "settingsCanvas":
        break;
      default:
        break;
    }
    if (targetId !== "hamburgerFloatingCanvas") this.closeManager();
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

  handleMenu() {
    if (this.isOpen) {
      this.closeManager();
    } else {
      this.openManager();
    }
  }

  openManager() {
    this.addRemoveContainerClass("add", "remove");
    this.isOpen = true;
  }

  closeManager() {
    this.addRemoveContainerClass("remove", "add");
    this.isOpen = false;
  }

  addRemoveContainerClass(actionContainer, actionChild) {
    this.floatingMenuContainer.classList[actionContainer](
      "bxy-floating-button-primary-menu-grid"
    );
    this.primaryChilds.forEach((element) =>
      element.classList[actionChild]("hide")
    );
  }

  removeListeners() {}

  handleFullscreen() {
    const fullscreenElement =
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement;
    if (fullscreenElement) {
      this.exitFullscreen();
    } else {
      this.launchFullscreen();
    }
  }

  async launchFullscreen() {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      await document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      await document.documentElement.webkitRequestFullscreen();
    }
  }

  async exitFullscreen() {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      await document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    }
  }

  handleShowHidePalette() {
    this.c.paletteManager.handleState();
  }
}
