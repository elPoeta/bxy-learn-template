class SecondaryMenuManager {
  constructor(canvas) {
    this.c = canvas;
    this.isOpen = false;
    this.floatingMenuContainer = document.querySelector(
      ".bxy-floating-button-secondary-menu"
    );
    this.primaryChilds = document.querySelectorAll(".bxy-secondary-child");
    this.floatingMenuContainer.addEventListener(
      "click",
      this.handleFloatingButtons.bind(this)
    );
  }

  handleFloatingButtons(ev) {
    const target = this.getTarget(ev.target);
    const targetId = target.id;
    switch (targetId) {
      case "dotsFloatingMenu":
        this.handleMenu();
        break;
      case "folderFloatingMenu":
        this.handleFolderMenu();
        break;
      case "floppyFloatingMenu":
        this.handleFloppyMenu();
        break;
      case "mdFloatingMenu":
        this.handleMDMenu();
        break;
      case "codeFloatingMenu":
        this.handleCodeMenu();
        break;
      default:
        break;
    }
    if (targetId !== "dotsFloatingMenu") this.closeManager();
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
      "bxy-floating-button-secondary-menu-grid"
    );
    this.primaryChilds.forEach((element) =>
      element.classList[actionChild]("hide")
    );
  }

  removeListeners() {}

  handleFolderMenu() {
    console.log("folder>>>>");
  }

  handleFloppyMenu() {
    console.log("floppy...");
  }

  handleMDMenu() {
    // const compositeId = this.c.projectCompositeId;
    // if (!compositeId) {
    //   browxyStartUp.toast.show({
    //     type: "info",
    //     title: "Message",
    //     message: "Description not found",
    //     icon: FlowIcons.getIcon({
    //       icon: "info",
    //       title: "Info",
    //       id: "Utils.uuid()",
    //       className: "iconsvg-info",
    //     }),
    //   });
    //   return;
    // }
    new MarkdownLog(this.c).checkMDFile();
  }

  handleCodeMenu() {
    new SourceCodeLog(this.c);
  }
}
