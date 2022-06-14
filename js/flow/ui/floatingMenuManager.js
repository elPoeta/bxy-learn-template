class FloatingMenuManager {
  constructor() {
    this.isOpen = false;
    this.menuButton = document.querySelector(".bxy-primary-main");
    this.floatingMenuContainer = document.querySelector(
      ".bxy-floating-button-primary-menu"
    );
    this.primaryChilds = document.querySelectorAll(".bxy-primary-child");
    this.menuButton.addEventListener("click", this.handleMenu.bind(this));
    this.addButtonListeners();
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
    this.addRemoveContainerClass("add", "remove");
  }

  closeManager() {
    this.addRemoveContainerClass("remove", "add");
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
      const fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
      //const fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;

      if (fullscreenElement) {
        console.log(
          `Element entered fullscreen mode.`
        );
      } else {
        console.log("Leaving fullscreen mode.");
      }
    });
  }

  removeListeners() {
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
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        await document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      }
    } catch (error) {
      console.log("");
    }
  }

  async exitFullscreen() {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
    } catch (error) {
      console.log("");
    }
  }
}
