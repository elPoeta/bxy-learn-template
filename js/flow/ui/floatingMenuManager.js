class FloatingMenuManager {
  constructor() {
    this.isOpen = false;
    this.isFull = false;
    this.menuButton = document.querySelector(".bxy-primary-main");
    this.floatingMenuContainer = document.querySelector(
      ".bxy-floating-button-primary-menu"
    );
    this.primaryChilds = document.querySelectorAll(".bxy-primary-child");
    this.menuButton.addEventListener("click", this.handleMenu.bind(this));
  }

  handleMenu(ev) {
    if (this.isOpen) {
      this.closeManager();
      this.isOpen = false;
    } else {
      this.openManager();
      this.isOpen = true;
    }
  }

  openManager() {
    console.log("open man");
    this.addRemoveContainerClass("add", "remove");
    this.addButtonListeners();
  }

  closeManager() {
    this.addRemoveContainerClass("remove", "add");
    this.removeListeners();
    this.isOpen = false;
  }

  addRemoveContainerClass(actionContainer, actionChild) {
    this.floatingMenuContainer.classList[actionContainer](
      "bxy-floating-button-primary-menu-grid"
    );
    this.floatingMenuContainer.classList[actionContainer](
      "bxy-floating-icons-v"
    );
    this.floatingMenuContainer.classList[actionContainer](
      "bxy-floating-icons-v"
    );
    this.primaryChilds.forEach((element) =>
      element.classList[actionChild]("hide")
    );
  }

  addButtonListeners() {
    this.fullscreenBtn = document.querySelector("#fullscreen");
    this.fullscreenBtn.addEventListener(
      "click",
      this.handleFullscreen.bind(this)
    );
    document.addEventListener("fullscreenchange", (ev) => {
      if (document.fullscreenElement) {
        this.isFull = true;
        console.log(
          `Element: ${document.fullscreenElement.id} entered fullscreen mode.`
        );
      } else {
        console.log("Leaving fullscreen mode.");
        this.isFull = false;
      }
    });
  }

  removeListeners() {
    if (!this.fullscreenBtn) return;
    this.fullscreenBtn.removeEventListener(
      "click",
      this.handleFullscreen.bind(this)
    );
  }

  handleFullscreen(ev) {
    if (document.fullscreenElement) {
      this.exitFullscreen();
    } else {
      this.launchFullscreen();
    }
    this.closeManager();
  }

  async launchFullscreen() {
    if (this.isFull) return;
    try {
      const body = document.querySelector("body");
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        await document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      }
    } catch (error) {
      console.log("rerro fuul");
    }
  }

  async exitFullscreen() {
    if (!this.isFull) return;
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
    } catch (error) {
      console.log("22222");
    }
  }
}
