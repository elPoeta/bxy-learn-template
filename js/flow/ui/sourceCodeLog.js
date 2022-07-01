class SourceCodeLog {
  constructor(canvas) {
    this.c = canvas;
    this.code = "";
    this.body = document.querySelector("body");
  }

  getCode() {
    const outs = this.c.interpreter(false);
    this.code = this.c.getCleanCodeByLanguage(outs, "code");
    return this;
  }

  render() {
    this.container = document.createElement("div");
    this.container.setAttribute("class", "overlay");
    this.container.innerHTML = this.template();
    this.body.appendChild(this.container);
    this.renderAceEditor();
    this.addListener();
  }

  template() {
    return `
		  <section class="codeLogContainer">
		    <div class="buttons-code-log-container">
		      <button id="btn-cancel-code-log">close</button>
		    </div> 
		    <div id="codeFlowEditor"></div>
		  </section>
		  `;
  }

  renderAceEditor() {
    const modelist = ace.require("ace/ext/modelist");
    this.editor = ace.edit(`codeFlowEditor`);
    const extension =
      this.out === "api"
        ? ".json"
        : this.c.languageOutput === "java"
        ? ".java"
        : ".js";
    const mode = modelist.getModeForPath(extension).mode;
    ace.config.set(
      "basePath",
      "assets/javascripts/third-party/ace/src-min-noconflict"
    );
    ace.require("ace/ext/language_tools");
    this.editor.getSession().setMode(mode);
    this.editor.setTheme(`ace/theme/eclipse`);
    this.editor.setShowPrintMargin(false);
    this.editor.setAutoScrollEditorIntoView(true);
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      fontSize: `20px`,
    });
    this.editor.$blockScrolling = Infinity;
    this.editor.setReadOnly(false);
    if (!Utils.isEmpty(this.code)) this.editor.session.setValue(this.code);
    this.editor.resize(true);
  }

  addListener() {
    this.buttons = document.querySelector(".buttons-code-log-container");
    this.buttons.addEventListener("click", this.handleButtons.bind(this));
  }

  handleButtons(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (target.id === "btn-cancel-code-log") {
      this.container.remove();
    }
  }
}
