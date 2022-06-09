class DebugJavaFlowResult extends DebugJavaResultBase  {
  constructor() {
    super();
    this.canvas = flowChartEditor.canvas;
  }
  
  renderDebugState() {
    this.canvas.clearConsole('scope');
    this.canvas.clearConsole('logFlowOutput');
    this.canvas.log(`<div id="logScope" style="background: #24282e; padding: 1px 5px;"><h2 style="color: #fff; text-align: center; margin: 5px; font-weight: bold;">Variables state</h2></div>`, 'scope');
    document.querySelector('#scope').style.paddingLeft = 0;
    flowChartEditor.showConsole();
    this.renderBreakpointList();
  }
  
  renderVariables(variables) {
    this.step++;
    this.canvas.log(this.localsVariablesTemplate(variables), 'logScope');
    this.scrollToBottom('console-info-box',20);
    this.addPrintListeners();
  }
 
  renderBreakpointList() {
    this.canvas.log(this.breakpointTemplate(this.getBreakpoints()), 'logFlowOutput');
    this.breakpointTable = document.querySelector('#breakpointTable'); 
    this.addBreakpointListeners();
  }
  
  
  addPrintListeners() {
    document.querySelector(`#printVars-${this.step}`)
      .addEventListener('click', this.handlePrintValue.bind(this));
  }
  
  addBreakpointListeners() {
    document.querySelector('#flowBreakpoints').addEventListener('click', this.handleBreakpointTable.bind(this));
  }
  
  localsVariablesTemplate(variables) {
    return (
            `<section class="step-container" data-step="${this.step}" style="margin: 5px 0; position:relative; left:4px;">
               ${this.step !== 1 ? `<hr class="step-divide step-divide-table"/>` : ''}
              <input class="toggle-step visually-step-hidden" id="step-${this.step}" type='checkbox'/>
              <label class="label-step label-step-table" for="step-${this.step}" style="margin-left: 25px;">Step ${this.step}</label>
              <div class="control-step">
                <div id="printVars-${this.step}" class="localsVariablesTableContainer" style="margin: 5px 0 35px 0;">
                  ${this.variablesTemplateBase(variables)}  
                </div>
             </div>
           </section>`);
  }
  
  breakpointTemplate(breakpoints) {
    return (`
            <div id="flowBreakpoints" style="font-size: 14px; border: 1px solid; background: #24282e;">
              <h2 style="color: #fff; text-align: center; margin: 5px; font-weight: bold;">Breakpoints</h2>
              ${this.breakpointTemplateBase(breakpoints)}
            </div>`);
  }
  
  markEditorLine(row, pathClass) {
    this.highlightBlock(row);
    this.selectCodeLine(row);
  }
  
  highlightBlock(row) {
    if(!this.canvas.javaEditorLines.rows[row -1]) return;
    const { id, tabIndex } = this.canvas.javaEditorLines.rows[row - 1];
    if(!id) return;
    this.canvas.highlightBlock(id, tabIndex);
  }
  
  selectCodeLine(row) {
    this.scrollToTop(row * 20);
    this.canvas.editor.scrollToLine(row, true, true, function () { });
    this.canvas.editor.gotoLine(row, 0, true);
    this.canvas.editor.session.selection.moveCursorToPosition({ row: row - 1, column: 0 });
    this.canvas.editor.session.selection.selectLine();
  }

  deleteBreakpoint(breakpoint) {
    const { projectId, fileId, pathClass, editorRow, row } = breakpoint;
    const redPoints = this.canvas.editor.session.getBreakpoints(editorRow, 0);
    if (typeof redPoints[editorRow] === typeof undefined) return;
    this.canvas.editor.session.clearBreakpoint(editorRow);
    this.canvas.processBreakpointFromTo(editorRow, 'removeBreakpointFromEditorToFlow');
    browxyStartUp.debugProject.deleteRowBreakpoint(projectId, pathClass, editorRow);
    browxyStartUp.debugProject.clearRuntimeBreakPoint(pathClass, editorRow);
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
  
  processEndDebug() {
    this.removeListeners();
    this.canvas.clearConsole('logFlowOutput');
    this.canvas.unLightBlock();
    this.canvas.reRender();
  }

  removeListeners() {
    for(let i = 1; i <= this.step; i++) {
      document.querySelector(`#printVars-${i}`)
        .removeEventListener('click', this.handlePrintValue.bind(this));  
      document.querySelectorAll(`[data-stepprint="${i}"]`)
        .forEach(el => el.innerHTML = '');
    }  
    if(document.querySelector('#flowBreakpoints')) 
      document.querySelector('#flowBreakpoints')
        .removeEventListener('click', this.handleBreakpointTable.bind(this));
    this.step = 0;
    browxyStartUp.debugProject.resetDebugResult();
  }
  
}