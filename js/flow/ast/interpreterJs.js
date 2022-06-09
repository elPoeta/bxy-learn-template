class InterpreterJs {
  constructor(canvas, code) {
    this.c = canvas;
    this.code = code;
    this.interpreter = null;
    this.runner = null;
    this.highlightPause = false;
    this.error = false;
    this.highlightVisited = {};
    this.stateVariables = new BlockState();
    this.stack = {};
    this.step = 0;
    document.querySelector('#scope').style.paddingLeft = '20px';
  }
  
  initApi(interpreter, globalObject) {
    let wrapper = text => {
      this.c.log(`<p style="color: blue; font-style: italic;">${text}</p>`, 'logFlowOutput');
      return this.GET(arguments.length ? text : '');
    };
    interpreter.setProperty(globalObject, 'GET',
      interpreter.createNativeFunction(wrapper));
    wrapper = (...args) => {
      return this.PRINTLN(args);
    };
    interpreter.setProperty(globalObject, 'PRINTLN',
      interpreter.createNativeFunction(wrapper));
    wrapper = (...args) => {
      return this.PRINT(args);
    };
    interpreter.setProperty(globalObject, 'PRINT',
      interpreter.createNativeFunction(wrapper));
    wrapper = (id, tabId, countHighlightLines) => {
      id = String(id || '');
      tabId = String(tabId || '');
      countHighlightLines = String(countHighlightLines || '');
      return this.highlightBlock(id, tabId, countHighlightLines);
    };
    interpreter.setProperty(globalObject, 'highlightBlock',
      interpreter.createNativeFunction(wrapper));
  }

  resetInterpreter() {
    this.interpreter = null;
    if (this.runner) {
      clearTimeout(this.runner);
      this.runner = null;
    }
  }
  
  GET(msg) {
    let value = prompt(msg);
    this.c.log(`<p style="color: grey; font-style: italic;"> ${value}</p>`, 'logFlowOutput');
    this.scrollToBottom('console-log-output', 10);
    if (isNaN(Number(value))) {
      return value;
    }
    return Number(value);
  }

  PRINTLN(...args) {
    this.c.log(`<p>${args.join().split(",").join(' ')}</p>`, 'logFlowOutput'); 
    this.scrollToBottom('console-log-output', 10);
  }

  PRINT(...args) {
    this.c.log(`<span>${args.join().split(",").join(' ')}</span>`, 'logFlowOutput');
    this.scrollToBottom('console-log-output', 10);
  }
  
  highlightBlock(id, tabId, countHighlightLines) {
    this.highlightPause = true;
    this.c.highlightBlock(id, tabId);
    this.highlightVisited[id] = this.highlightVisited[id] || { line: -1, countHighlightLines };
    this.step++; 
 }
  
  runCode() {
    setTimeout(() => {
      this.interpreter = new Interpreter(this.code, this.initApi.bind(this));
      this.c.log("<div style='color: #25b94e; margin-top: 5px;'>Program started!</div><div><hr/></div>", 'logFlowOutput');
      this.runner = () => {
        if (this.interpreter) {
          try {
            this.hasMoreCode = this.interpreter.run();
            if (this.hasMoreCode) {
              setTimeout(this.runner, 10);
            }    
          } catch(e) {
             this.logError(e);
        } finally {
            if (!this.hasMoreCode) {
              this.logFinishProgram();
              this.resetInterpreter();
              return;
           }
         } 
        }
      }
      this.runner();
    }, 1);
  }
  
  runStepByStepCode() {
    if (!this.interpreter) {
      this.interpreter = new Interpreter(this.code, this.initApi.bind(this));
      this.c.log("<div style='color: #25b94e; margin-top: 5px;'>Program started!</div><div><hr/></div>", 'logFlowOutput');
      this.c.clearConsole('scope');
      setTimeout(() => {
        this.highlightPause = true;
        this.runStepByStepCode();
      }, 1);
      return;
    }
    this.highlightPause = false;
    do {
      try {
        this.hasMoreCode = this.interpreter.step();
        this.setCurrentScopeStack();
        this.paintLineCode();
      } catch(e) {
          this.logError(e);
      } finally {
          if (!this.hasMoreCode) {
            this.step++;
            this.processCurrentScope(this.stack);
            this.logFinishProgram();
            this.stopStepByStepCode();
            return;
         }
      }
    } while (this.hasMoreCode && !this.highlightPause);
  }
  
  paintLineCode() {
    if (this.interpreter.stateStack.length && this.highlightPause) {
      var node =
        this.interpreter.stateStack[this.interpreter.stateStack.length - 1].node;
      if (node.type === 'CallExpression' && node.callee.name === 'highlightBlock') {
        let top;
        const blockId = node.arguments[0].value;
        let line = node.loc.start.line - this.highlightVisited[blockId].countHighlightLines;
        if (this.highlightVisited[blockId].line === -1) {
          this.highlightVisited[blockId].line = line;
        } else {
          line = this.highlightVisited[blockId].line;     
        }
        this.scrollToTop(line * 20);
        this.selectCodeLine(line);
      }

    }  
  }
  
  selectCodeLine(line) {
    this.c.editor.scrollToLine(line, true, true, function () { });
    this.c.editor.gotoLine(line, 0, true);
    this.c.editor.session.selection.moveCursorToPosition({ row: line, column: 0 });
    this.c.editor.session.selection.selectLine();
  }
  
  setCurrentScopeStack() {
    if (this.interpreter.stateStack.length) {
      const scope = this.interpreter.stateStack[this.interpreter.stateStack.length - 1].scope.object.properties;
      this.stack = scope.window ? this.stack : scope;
    }
    if (this.interpreter.stateStack.length && this.highlightPause) {
      var node =
        this.interpreter.stateStack[this.interpreter.stateStack.length - 1].node;
      if (node.type === 'CallExpression' && node.callee.name === 'highlightBlock') {
        this.processCurrentScope(this.interpreter.stateStack[this.interpreter.stateStack.length - 1].scope.object.properties);
      }
    }
  }
  
  processCurrentScope(currentScope) {
    delete currentScope.this;
    const size = Object.keys(currentScope).length;
    if (size < 3) return;
    const name = this.findFunctionName(currentScope);
    this.stateVariables.add(name, {});
    for (const [key, value] of Object.entries(currentScope)) {
      if (key !== name && key !== 'arguments') {
        if (value !== null && typeof value === 'object') {
          if (value.class === 'Array') {
            if (Utils.isEmpty(value.properties)) {
              this.stateVariables.update(name, { [key]: Object.values(value.properties) });
            } else {
              if (value.properties[0].class && value.properties[0].class === 'Array') {
                const matrix = [];
                for (const property in value.properties) {
                  const innerVector = value.properties[property];
                  matrix.push(Object.values(innerVector.properties));
                }
                this.stateVariables.update(name, { [key]: matrix });
              } else {
                this.stateVariables.update(name, { [key]: Object.values(value.properties) });
              }
            }
          }
        } else {
            this.stateVariables.update(name, { [key]: value });
        }
      }
    }
    this.logStateVariables();
  }
  
  findFunctionName(currentScope) {
    for (const [key, value] of Object.entries(currentScope)) {
      if (key !== 'arguments' && value !== null) {
        if (typeof value === 'object') {
          if (value.class && value.class === 'Function') {
            return key;
          }
        }
      }
    }
  }
  
  logStateVariables() {
    let template = `<section class="step-container" data-step="${this.step}" style="margin: 5px 0; position:relative;">
        ${this.step !== 1 ? `<hr class="step-divide"/>` : ''}
        <input class="toggle-step visually-step-hidden" id="step-${this.step}" type='checkbox'/>
        <label class="label-step" for="step-${this.step}">Step ${this.step}</label>
        <div class="control-step">`;
    template += this.stateVariables.toArray().map(scope => {
      const [name, values] = scope;
      const json = JSON.stringify(values, null, 2)
                   .replace(/^{/, "").replace(/}$/, "");
      return (`${Utils.isEmpty(json) ? '' :
           `<h3 class="scope-title">${name}</h3>
          <pre class="scope-pre">${this.syntaxHighlight(json)}</pre>`
        }`)
    }).join('');
    template += `</div></section>`;
    if (/<div class="control-step"><\/div>/gm.test(template)) return;
    this.c.log(template, 'scope');
    this.scrollToBottom('console-info-box',20);
  }

  syntaxHighlight(json) {
    return json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
               match => {
                let cls = 'number-scope';
                if (/^"/.test(match)) {
                  if (/:$/.test(match)) {
                    match = match.replaceAll(/"/g, "").replace(/:/g, " = ");
                    cls = 'key-scope';
                  } else {
                      cls = 'string-scope';
                   }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean-scope';
                } else if (/null/.test(match)) {
                    cls = 'null-scope';
                  }
                return `<span class="${cls}">${match}</span>`;
             });
  }
  
  scrollToTop(y) {
    const div = document.querySelector(`#console-flow-editor`);
    div.scrollTo(0, y - 50);
  }
  
  scrollToBottom(id,time){
    setTimeout(() => {
      const div = document.querySelector(`#${id}`);
      div.scrollTop = div.scrollHeight;
    },time);
  }
  
  logFinishProgram() {
    const log = !this.error ? 
      `<div style='color: #25b94e; margin-top: 5px;'>Program complete!</div><div><hr/></div>` :
      `<div style='color: #b42c2c; margin-top: 5px;'>Program finished with error!</div><div><hr/></div>`;  
    this.c.log(log, 'logFlowOutput');  
  }
  
  logError(e) {
    this.hasMoreCode = false;
    this.error = true;
    this.c.log(`<div style='color: #b42c2c'>${e.message}</div>`, 'logFlowOutput');   
    this.scrollToBottom('console-log-output', 10);
  }
  
  addButtonListeners() {
    this.stepBtnRun = document.querySelector('#stepBtnRun');
    this.stepBtnStop = document.querySelector('#stepBtnStop');
    this.stepBtnRun.addEventListener('click', this.runStepByStepCode.bind(this));
    this.stepBtnStop.addEventListener('click', this.stopStepByStepCode.bind(this));
  }
  
  stopStepByStepCode(ev) {
    if(ev)
      this.c.log(`<div style='color: #c9650e; margin-top: 5px;'>Program finished by user!</div><div><hr/></div>`,'logFlowOutput');
    this.interpreter = null;
    this.c.editor.session.selection.clearSelection();
    this.scrollToBottom('console-log-output', 10);
    this.stepBtnRun.removeEventListener('click', this.runStepByStepCode);
    this.stepBtnStop.removeEventListener('click', this.stopStepByStepCode);
    document.querySelector('#stepByStep-btnContainer').remove();
    this.c.unLightBlock();
    this.c.reRender();
  }
}