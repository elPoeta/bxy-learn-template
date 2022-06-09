class EditorFlowForm {
  constructor(canvas, withForm, packageToImport) {
    this.c = canvas;
    this.out = 'code';
    this.packageToImport = packageToImport;
    this.withForm = withForm;
    this.paletteBackup = null;
    this.wizardItemsBackup = canvas.wizardItems;
    this.body = document.querySelector('body');
  }

  show(code = '', compositeId = null, out = 'code') {
    this.out = out;
    this.compositeId = compositeId;
    const template = this.template('Paste or type code');
    this.div = document.createElement('div');
    this.div.setAttribute('class', 'overlay');
    this.div.setAttribute('id', 'pasteEditorId');
    this.div.innerHTML = template;
    this.body.insertBefore(this.div, this.body.childNodes[0]);
    this.renderAceEditor(code);
    this.addListeners();
    return this;
  }

  loadWithoutForm(code, compositeId, palette, wizardItems) {
    this.code = code;
    this.compositeId = compositeId;
    this.paletteBackup = palette;
    this.wizardItemsBackup = wizardItems;
    return this;
  }

  template(title) {
    return (`<span class="closeOverlay" id="closeFlowEditor">×</span>
      <div id="window-dim-code" class="window-dim-code-default">
        <div id="window-code" class="window-modal" style="max-width: 600px;">
          <p id="editorError" class="hide" style='text-align: center; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
          <h2>${title}</h2>
         <div id="editorFlow" style="border-radius: 0.2em; border:1px solid #444; width: 600px; heigth: 600px;"></div>
          <div style="display: flex; justify-content: end;">
           <button class="button" id="cancel-modal" style="font-size: 1.2em; background:red; cursor: pointer; color:#fff; margin-top:10px; margin-right: 10px; padding: 8px; border: none; font-weight: bold; text-align:center;">Cancel</button>
           <button class="button" id="create" style="font-size: 1.2em; background:green; cursor: pointer; color:#fff; margin-top:10px; margin-left: 10px; padding: 8px; border: none; font-weight: bold; text-align:center;">Create</button>
         </div>
          
         </div>
      </div>`);
  }

  renderAceEditor(code) {
    const modelist = ace.require("ace/ext/modelist");
    this.editor = ace.edit(`editorFlow`);
    const extension = this.out === 'api' ? '.json' : this.c.languageOutput === 'java' ? '.java' : '.js';
    const mode = modelist.getModeForPath(extension).mode;
    ace.config.set('basePath', 'assets/javascripts/third-party/ace/src-min-noconflict');
    ace.require('ace/ext/language_tools');
    this.editor.getSession().setMode(mode);
    this.editor.setTheme(`ace/theme/eclipse`);
    this.editor.setShowPrintMargin(false);
    this.editor.setAutoScrollEditorIntoView(true);
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      minLines: 30,
      maxLines: 30,
      fontSize: `20px`
    });
    this.editor.$blockScrolling = Infinity;
    if (!Utils.isEmpty(code)) this.editor.session.setValue(code);
    this.editor.resize(true);
    this.editor.on('input', this.placeholder.bind(this));
    this.placeholder();
  }

  placeholder() {
    const message = this.getPlaceHolderMessage();
    const shouldShow = this.editor && !this.editor.session.getValue().length;
    let node = this.editor && this.editor.renderer.emptyMessageNode;
    if (!shouldShow && node) {
      this.editor.renderer.scroller.removeChild(this.editor.renderer.emptyMessageNode);
      this.editor.renderer.emptyMessageNode = null;
    } else if (shouldShow && !node) {
      node = this.editor.renderer.emptyMessageNode = document.createElement("pre");
      node.textContent = message;
      node.className = "ace_emptyMessage";
      node.style.padding = "0 9px";
      node.style.position = "absolute";
      node.style.zIndex = 9;
      node.style.opacity = 0.5;
      node.style.border = 'none';
      node.style.background = '#fff';
      node.style.fontSize = '16px';
      this.editor.renderer.scroller.appendChild(node);
    }
  }

  getPlaceHolderMessage() {
    return this.c.getBeautifyCode(this.out === 'api' ?
      `{
       "langOut": "java",
       "palette": {},
       "colors": {},
       "program": {
         "0": {
           "blocks": [],
           "blocksOutside": [],
           "tab": {
             "name": "main",
             "type": "main"
          }
        },
       "1": {
         "blocks": [],
         "blocksOutside": [],
         "tab": {
            "name": "functions",
            "type": "f_repo"
           }
         }
      }
     }` : this.c.languageOutput === 'java' ?
        `public class Flowchart {
         public static void main(String[] args) {
           printText("Browxy Flow"); 
         }
 
         public static void printText(String text) {
           System.out.println(text); 
         }
      }` :
        `/* Wrap your main code into main function\n DO NOT INVOKE the main function\n main function should be the first function\n call PRINTLN() function to print line messages\n or call PRINT() or alert() function to print messages,\n separate arguments by comma,\n call GET() or prompt()\n function to get input users\n Only ECMA SCRIPT Version 5 compatible  */\n
     function main() {
       var a = GET('Number one');
       var b = GET('Number two');
       var r = add(a,b);
       PRINTLN("Result ", r);
     }
     
     function add(a,b) {
       return a + b;
     }`);
  }

  addListeners() {
    this.handlerModal();
    this.cancelBtn = document.querySelector('#cancel-modal');
    this.createBtn = document.querySelector('#create');
    this.cancelBtn.addEventListener('click', this.removeOverlay.bind(this));
    this.createBtn.addEventListener('click', this.createHandler.bind(this));
  }

  createHandler() {
    if (this.out === 'api') {
      this.createFromJSONAPI();
    } else {
      switch (this.c.languageOutput) {
        case 'java':
          this.createFromJavaCode();
          break;
        case 'javascript':
          this.createFromJavascriptCode();
          break;
        default:
          this.removeOverlay();
          Dialog.noticeDialog({ title: "Message", text: `Operation cannot executed - incompatible language` });
          break;
      }
    }
  }

  createWithoutForm() {
    switch (this.c.languageOutput) {
      case 'java':
        this.getJavaAST(this.code);
        break;
      case 'javascript':
        this.getJavascriptAST(this.code);
        break;
      default:
        Dialog.noticeDialog({ title: "Message", text: `Operation cannot executed - incompatible language` });
        break;
    }
    return this;
  }

  createFromJavaCode() {
    const code = this.editor.session.getValue();
    if (Utils.isEmpty(code)) {
      this.showError('Your code is empty');
      return false;
    }
    this.getJavaAST(code);
  }

  getJavaAST(code) {
    defaultAjaxRequest
      .setUrl(SNIPPET_AST)
      .courseTreeOperation({ code }, data => {
        const { error, message } = data;
        if (error) {
          const msg = message ? message : 'Unknown error';
          this.showError(msg);
          return false;
        }
        if (this.withForm)
          this.removeOverlay();
        this.createFlowFromAst({ ast: data });
      });
  }

  createFromJavascriptCode() {
    const code = this.editor.session.getValue();
    if (Utils.isEmpty(code)) {
      this.showError('Your code is empty');
      return false;
    }
    this.getJavascriptAST(code);
  }

  getJavascriptAST(code) {
    try {
      const jsInterpreter = new ParseJsInterpreter(new AstJsVisitor());
      const body = acorn.parse(code, { ecmaVersion: 5, preserveParens: true }).body;
      jsInterpreter.interpret(body);
      jsInterpreter.visitor.setWrapTabId();
      const codeParsed = jsInterpreter.visitor.codeParsed;
      if (this.withForm)
        this.removeOverlay();
      this.createFlowFromAst({ ast: codeParsed });
    } catch (error) {
      this.showError(error.message);
      return false;
    }
  }

  createFromJSONAPI() {
    const code = this.editor.session.getValue();
    if (Utils.isEmpty(code)) {
      this.showError('Your code is empty');
      return false;
    }
    this.removeOverlay();
    const parsedCode = JSON.parse(code);
    flowChartEditor.resetFlowProps();
    const parseCode = new ParseCode({ canvas: this.c, ast: '', projectCompositeId: this.compositeId, pallete: {}, wizardItems: this.wizardItemsBackup, packageToImport: this.packageToImport });
    parseCode.api = parsedCode;
    parseCode.runAPI();
  }

  handlerModal() {
    document.querySelector('#closeFlowEditor')
      .addEventListener('click', e => {
        this.removeOverlay();
      });
  }

  removeOverlay() {
    document.getElementById("pasteEditorId").remove();
    this.c.updateCanvas();
  }

  createFlowFromAst({ ast }) {
    if (this.withForm)
      flowChartEditor.resetFlowProps();
    const parseCode = new ParseCode({ canvas: this.c, ast, projectCompositeId: this.compositeId, palette: this.paletteBackup, wizardItems: this.wizardItemsBackup, packageToImport: this.packageToImport })
      .setRepoFunction();
  }

  showError(message) {
    if (this.withForm) {
      const editorError = document.querySelector('#editorError');
      editorError.innerHTML = message;
      editorError.classList.remove('hide');
    } else {
      this.c.log(`<div style='color: red; margin-top: 5px;' >${message}</div>`, 'logFlowOutput');
      Dialog.noticeDialog({ title: "Error", text: `<span style='color:red;'>There was an error. Check the logs for more information.</span>` });
    }

  }
}