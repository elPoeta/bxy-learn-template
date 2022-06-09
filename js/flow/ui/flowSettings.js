class FlowSettings {
  constructor(canvas) {
    this.c = canvas;
    this.codeLanguagesOutput = ['java', 'javascript'];
    this.flowOutput = [{ id: 'flow', value: 'From flowchart' }, { id: 'code', value: 'From code' }, { id: 'api', value: 'From API' }];
    this.blockConfigPropsForm = [
      { type: 'startBlock', blockColorId: 'startBlockColor', fontColorId: 'startFontColor', lineColorId: 'startLineColor', canvasId: 'startBlockCanvas' },
      { type: 'endBlock', blockColorId: 'endBlockColor', fontColorId: 'endFontColor', lineColorId: 'endLineColor', canvasId: 'endBlockCanvas' },
      { type: 'defineBlock', blockColorId: 'defineBlockColor', fontColorId: 'defineFontColor', lineColorId: 'defineLineColor', canvasId: 'defineBlockCanvas' },
      { type: 'codeBlock', blockColorId: 'codeBlockColor', fontColorId: 'codeFontColor', lineColorId: 'codeLineColor', canvasId: 'codeBlockCanvas' },
      { type: 'inputBlock', blockColorId: 'inputBlockColor', fontColorId: 'inputFontColor', lineColorId: 'inputLineColor', canvasId: 'inputBlockCanvas' },
      { type: 'outputBlock', blockColorId: 'outputBlockColor', fontColorId: 'outputFontColor', lineColorId: 'outputLineColor', canvasId: 'outputBlockCanvas' },
      { type: 'whileBlock', blockColorId: 'whileBlockColor', fontColorId: 'whileFontColor', lineColorId: 'whileLineColor', canvasId: 'whileBlockCanvas' },
      { type: 'doWhileBlock', blockColorId: 'doWhileBlockColor', fontColorId: 'doWhileFontColor', lineColorId: 'doWhileLineColor', canvasId: 'doWhileBlockCanvas' },
      { type: 'forBlock', blockColorId: 'forBlockColor', fontColorId: 'forFontColor', lineColorId: 'forLineColor', canvasId: 'forBlockCanvas' },
      { type: 'ifBlock', blockColorId: 'ifBlockColor', fontColorId: 'ifFontColor', lineColorId: 'ifLineColor', canvasId: 'ifBlockCanvas' },
      { type: 'wrapBlock', blockColorId: 'wrapBlockColor', fontColorId: 'wrapFontColor', lineColorId: 'wrapLineColor', canvasId: 'wrapBlockCanvas' },
    ];
    this.indexActiveTab = 0;
    this.projects = [];
    this.currentPage = 0;
    this.maxScrollTop = 0;
  }

  template() {
    return `
     <div class="moreOptions-overlay" style="height: 100%;">
       <span class="closeOverlay" id="closeFlowSettings">×</span>
       <div class="tabs-settings">
         <div class="tab-settings-header">
           <div class="${this.indexActiveTab == 0 ? 'active-settings' : ''}">
             <i>${this.getIcon('add')}</i>New Flowchart
           </div>
           <div class="${this.indexActiveTab == 1 ? 'active-settings' : ''}">
             <i>${this.getIcon('zoom')}</i> Zoom Config
           </div>
           <div class="${this.indexActiveTab == 2 ? 'active-settings' : ''}">
             <i>${this.getIcon('shape')}</i> Blocks Config
           </div>
           <div class="${this.indexActiveTab == 3 ? 'active-settings' : ''}">
             <i>${this.getIcon('file')}</i> Load
           </div>
         </div>
       <div class="tab-settings-indicator"></div>
       <div class="tab-settings-content custom-gray-scroll">
         <section id="activeContainer" class="active-settings">
           <div class="tab-content-section">
             <div id="formContent"></div>
           </div>
         </section>
       </div>
     </div>
    </div>`;
  }
  
  newFlowChartForm() {
    return `
    <div class="open-vertical-tab combo-container-flow-settings">
      <h2>New Flowchart</h2>
      <h3>Pick output code</h3>
      <form id='flowchartForm' name='flowchartForm'>
        <div>
          <p class="addTaskPopUpLegend">Language</p>
          <select id="comboPopUpFlowSettings" name='comboPopUpFlowSettings'>
            ${this.codeLanguagesOutput.map(lang => (
              `<option value='${lang}'>${lang}</option>`
            )).join('')}
         </select>
       </div>
       <div style="margin-top: 5px; margin-bottom: 5px;">
         <p class="addTaskPopUpLegend">From</p>
         <select id="comboPopUpFlowOut" name='comboPopUpFlowOut'>
           ${this.flowOutput.map(out => (
            `<option value='${out.id}'>${out.value}</option>`
            )).join('')}
         </select>
      </div>
      <div class="addTaskPopUpLegend" style="margin-top: 10px;">Flow Name</div>
      <input type='text' id='flowName' name='flowName' placeholder='name whitout spaces' value=''/>
      <p id="flowError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'>name is empty or contain spaces</p>    
      <div>
        <button id="settingButton" class="btn greenButtonFeed">New Flowchart</button>
      </div>
    </form>
   </div>`
  }

  zoomConfigForm() {
    const factor = this.c.scaleFactor;
    return `
      <div class="open-vertical-tab combo-container-flow-settings">
        <h2>Zoom Config</h2>
        <h3>Select zoom factor</h3>
        <form id='flowchartFormZoom' name='flowchartFormZoom'>
          <h2 style="font-size:1.6em;">Factor: <span id="sliderZoomX">${factor}</span></h2>
          <div style="margin: 25px auto;">
            <input style="background: inherit; border: none;" id="zoomRange" name="zoomRange" type="range" min="0.01" max="0.99" step="0.01" value='${factor}'>
          </div>
          <div>
            <button id="settingButton" class="btn greenButtonFeed">Accept</button>
          </div>
        </form>
     </div>`;
  }
  
  blockConfigForm() {
    const { customizedBlocks } = configEditor.flow;
    return `
       <div class="open-vertical-tab combo-container-flow-settings">
         <h2>Block Config</h2>
         <div style="display:flex;">
           <label class="containerCheckbox" style="font-size:1.2em;">Show cogwheel
             <input type="checkbox" id="renderCogwheel" name="renderCogwheel" ${this.c.renderCogwheel ? 'checked' : ''} >
             <span class="checkmark checkPublish"></span>
           </label>
         </div>
         <h3>Pick Block Colors</h3>
         <div class="restoreBlockConfig" data-restoreDefault="restoreColors">
           <i data-restoreDefault="restoreColors">${this.getIcon('restore')}</i>
           <span data-restoreDefault="restoreColors">Restore default</span>
         </div>
         <form id='flowchartFormBlock' name='flowchartFormBlock'>
           ${this.blockConfigPropsForm.map(blockConfig => (
            `<div class="customBlockContainer">
               <div class="blockColorPicker">
                 <div>
                   <input type="color" id="${blockConfig.blockColorId}" name="${blockConfig.blockColorId}" value="${customizedBlocks[blockConfig.type].blockColor ? customizedBlocks[blockConfig.type].blockColor : '#000000'}">
                   <label for="${blockConfig.blockColorId}">Block Color</label>
                 </div>
                 <div>
                   <input type="color" id="${blockConfig.lineColorId}" name="${blockConfig.lineColorId}" value="${customizedBlocks[blockConfig.type].lineColor ? customizedBlocks[blockConfig.type].lineColor : '#000000'}">
                   <label for="${blockConfig.lineColorId}">Line Color</label>
                 </div>
                 <div>
                   <input type="color" id="${blockConfig.fontColorId}" name="${blockConfig.fontColorId}" value="${customizedBlocks[blockConfig.type].fontColor ? customizedBlocks[blockConfig.type].fontColor : '#000000'}">
                   <label for="${blockConfig.fontColorId}">Font Color</label>
                 </div>
               </div>
               <canvas id="${blockConfig.canvasId}" width="90px" height="90px" style="${blockConfig.canvasId === 'ifBlockCanvas' ? 'align-self: start;' :''}"></canvas> 
             </div>
             ${blockConfig.type !== 'wrapBlock' ? this.getHr(blockConfig.type) : ''}`
           )).join('')}     
           <button id="settingButton" class="btn greenButtonFeed" style="margin: 40px auto 0 auto;">Accept</button>
         </form>
      </div>`
  }
  
  getHr(type) {
    return `<hr class="divideBlockConfig" style="${type === 'ifBlock' ? 'margin-top: 40px;' : ''}"/>`;
  }
  
  loadConfigForm() {
    this.getPageProject();
    return this.loadConfigFormTemplate();
  }
  
  getPageProject() {
    FlowSpinner.mount();
    defaultAjaxRequest
      .setUrl(`${GET_FLOW_PROJECTS}?page=${this.currentPage}`)
      .getJsonFromServer(data => {
        FlowSpinner.unMount();
        if([400, 401, 403].includes(data)){
          this.setProjects(this.projects);
          return;
        }
        this.currentPage++;
        const projects = data.map(project => { 
          project.properties = Utils.parseJsonObject(project.properties); 
          return project;  
        }); 
        this.projects = [...this.projects, ...projects];
        this.setProjects(projects); 
     });
  }
  
  loadConfigFormTemplate() {
    return `
      <div class="open-vertical-tab combo-container-flow-settings">
        <h2>Load from file project</h2>
        <h3>Load type</h3>
        <form id='flowchartFormLoad' name='flowchartFormLoad'>
          <div id="radioTypeLoad" style="display: flex;font-size: 1.4em;justify-content: space-around;">${this.renderTypeLoadProject()}</div>
          <div id="loadFlowNameContainer" class="hide">
            <input type="text" id="loadFlowName" name="loadFlowName" value="" placeholder="flowchart name..." >
          </div>
          <p id="flowError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>    
          <h3>Choose project</h3>
          <ul id="flowProjects" class="grid-radio-projects-container custom-gray-scroll"></ul>
          <div>
            <button id="settingButton" class="btn greenButtonFeed">Load</button>
          </div>
        </form>
      </div>`;
  }

  renderTypeLoadProject() {
    const radios = [
       { id: 'loadSelected', value: 'loadSelected', legend: 'Selected', title: 'Create flow from selected project', selected: true }, 
       { id: 'loadNew', value: 'loadNew', legend: 'New', title: 'Create flow as new project from selected - (clone)', selected: false }, 
       { id: 'loadOverride', value: 'loadOverride', legend: 'Override current', title: 'Create flow from selected project and override current flow/project', selected: false }
      ]
    return radios.map(radio => (`
      <div class="containerRadio" style="display:flex;font-size:1.2em;" title="${radio.title}">
        <label for='${radio.id}'>${radio.legend}
          <input type="radio" id='${radio.id}' name="typeLoad" value='${radio.value}' ${radio.selected ? 'checked' : ''}> 
          <span class="checkmarkRadio" style="border: 0.5px solid #ababab;"></span>
        </label>
      </div>`)).join('');
  }
  
  setProjects(projects) {
    this.flowProjectsCombo = document.querySelector('#flowProjects');
    this.flowProjectsCombo.innerHTML += this.getRadioTemplate(projects);
  }
  
  getRadioTemplate(projects) {
    return `
            ${projects.map(project => (
              `<li value='${project.id}'>
                 <div class="containerRadio" style="display:flex;">
                   <label for='${project.id}'>${project.name} (${project.language.name})
                     <input type="radio" id='${project.id}' name="projects" value='${project.id}'> 
                     <span class="checkmarkRadio" style="border: 0.5px solid #ababab;"></span>
                   </label>
                 </div>
              </li>`)).join('')}`
  }
  
  render(indexActiveTab) {
    this.indexActiveTab = indexActiveTab || 0;
    const div = document.createElement('div');
    div.setAttribute('id', 'settingsPopUp');
    div.innerHTML = this.template();
    document.querySelector("body").insertBefore(div, document.querySelector("body").childNodes[0]);
    this.addFlowSettingsListeners();
    this.changeForm();

  }
  
  addFlowSettingsListeners() {
    this.tabPanes = this.getTabPanes("tab-settings-header")[0].getElementsByTagName("div");
    this.getTabPanes("tab-settings-indicator")[0].style.top = `calc(145px + ${this.indexActiveTab * 50}px)`;
    this.setActiveTab();
    this.closeClickX = document.querySelector('#closeFlowSettings');
    this.closeClickX.addEventListener('click', this.closePopUp.bind(this));
  }
  
  getTabPanes(name) {
    return document.getElementsByClassName(name);
  }

  setActiveTab() {
    for (let i = 0; i < this.tabPanes.length; i++) {
      this.tabPanes[i].addEventListener("click", () => {
        this.getTabPanes("tab-settings-header")[0].getElementsByClassName("active-settings")[0].classList.remove("active-settings");
        this.tabPanes[i].classList.add("active-settings");
        this.getTabPanes("tab-settings-indicator")[0].style.top = `calc(145px + ${i * 50}px)`;
        this.indexActiveTab = i;
        this.changeForm();
      });
    }
  }
  
  changeForm() {
    this.formContent = document.querySelector('#formContent');
    const activeContainer = document.querySelector('#activeContainer')
    if(this.settingButton) 
      this.settingButton.removeEventListener('click', this.handlerFlowSettings.bind(this));    
    switch (this.indexActiveTab) {
      case 0:
        activeContainer.style.top = '15px';
        this.formContent.innerHTML = this.newFlowChartForm();
        break;
      case 1:
        activeContainer.style.top = '65px';
        this.formContent.innerHTML = this.zoomConfigForm();
        this.handlerZoomRange();
        break;
      case 2:
        activeContainer.style.top = '0px';
        this.formContent.innerHTML = this.blockConfigForm();
        this.handlerInputColor();
        this.drawCanvasBlocks();
        break;
      case 3:
        activeContainer.style.top = '-17px';
        this.resetLoadValues();
        this.formContent.innerHTML = this.loadConfigForm();
        this.addLoadListeners();
        break;  
      default:
        activeContainer.style.top = '45px';
        this.formContent.innerHTML = this.newFlowChartForm();
        break;
    }
    this.settingButton = document.querySelector('#settingButton');
    this.settingButton.addEventListener('click', this.handlerFlowSettings.bind(this));
  }
  
  addLoadListeners() {
    this.radioTypeLoad = document.querySelector('#radioTypeLoad');
    this.flowProjectsGrid = document.querySelector('#flowProjects');
    this.flowProjectsGrid.addEventListener('scroll', this.scrollGridHandler.bind(this));
    this.radioTypeLoad.addEventListener('click', this.typeLoadHandler.bind(this),true);
  }
  
  resetLoadValues() {
    this.currentPage = 0;
    this.maxScrollTop = 0;
  }
  
  typeLoadHandler(ev) {
    if(ev.target.tagName.toLowerCase() === 'input') {
      const id = ev.target.id;
      this.showHideLoadFlowName(id);
      
    }
  }
  
  showHideLoadFlowName(id) {
    const loadFlowNameContainer = document.querySelector('#loadFlowNameContainer');
    const loadFlowName = document.querySelector('#loadFlowName');
    switch (id) {
      case 'loadNew':
        loadFlowName.value = '';
        loadFlowNameContainer.classList.remove('hide');
        break;
      default:
        loadFlowNameContainer.classList.add('hide');
        break;
    }      
  }
  
  scrollGridHandler(ev) {
    const scrollTop = ev.target.scrollTop;
    if (this.maxScrollTop < scrollTop && (this.flowProjectsGrid.getBoundingClientRect().height + scrollTop) > document.querySelector('#flowProjects').scrollHeight) {
      this.maxScrollTop = scrollTop + 10; 
      this.getPageProject();
   }
  }
  
  handlerInputColor() {
    const restoreColors = document.querySelectorAll('[data-restoreDefault="restoreColors"]');
    restoreColors.forEach(restoreColor => {
      restoreColor.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        this.restoreDefaultColors();
      }, false);
    });
    const inputColors = document.querySelectorAll('input[type="color"]');
    inputColors.forEach(input => {
      input.addEventListener('change', e => {
        e.preventDefault();
        this.updateCanvas(e.target.getAttribute('id'));
      });
    });
  }
  
  drawCanvasBlocks() {
    const { startBlock, endBlock, defineBlock, codeBlock, inputBlock, outputBlock, whileBlock, forBlock, doWhileBlock, ifBlock, wrapBlock } = configEditor.flow.customizedBlocks;
    this.startBlockCanvas = document.querySelector('#startBlockCanvas');
    this.startBlockCtx = startBlockCanvas.getContext('2d');
    this.drawEllipseBlock(this.startBlockCanvas, this.startBlockCtx, startBlock.blockColor, startBlock.lineColor, startBlock.fontColor, 'startBlock');    
    this.endBlockCanvas = document.querySelector('#endBlockCanvas');
    this.endBlockCtx = endBlockCanvas.getContext('2d');
    this.drawEllipseBlock(this.endBlockCanvas, this.endBlockCtx, endBlock.blockColor, endBlock.lineColor, endBlock.fontColor, 'endBlock');
    this.defineBlockCanvas = document.querySelector('#defineBlockCanvas');
    this.defineBlockCtx = defineBlockCanvas.getContext('2d');
    this.drawIOBlock(this.defineBlockCanvas, this.defineBlockCtx, defineBlock.blockColor, defineBlock.lineColor, defineBlock.fontColor, 'defineBlock');
    this.codeBlockCanvas = document.querySelector('#codeBlockCanvas');
    this.codeBlockCtx = codeBlockCanvas.getContext('2d');
    this.drawCodeBlock(codeBlock.blockColor, codeBlock.lineColor, codeBlock.fontColor);
    this.inputBlockCanvas = document.querySelector('#inputBlockCanvas');
    this.inputBlockCtx = inputBlockCanvas.getContext('2d');
    this.drawIOBlock(this.inputBlockCanvas, this.inputBlockCtx, inputBlock.blockColor, inputBlock.lineColor, inputBlock.fontColor, 'inputBlock');
    this.outputBlockCanvas = document.querySelector('#outputBlockCanvas');
    this.outputBlockCtx = outputBlockCanvas.getContext('2d');
    this.drawIOBlock(this.outputBlockCanvas, this.outputBlockCtx, outputBlock.blockColor, outputBlock.lineColor, outputBlock.fontColor, 'outputBlock');
    this.whileBlockCanvas = document.querySelector('#whileBlockCanvas');
    this.whileBlockCtx = whileBlockCanvas.getContext('2d');
    this.drawLoopBlock(this.whileBlockCanvas, this.whileBlockCtx, 10, whileBlock.blockColor, whileBlock.lineColor, whileBlock.fontColor, 'whileBlock');
    this.doWhileBlockCanvas = document.querySelector('#doWhileBlockCanvas');
    this.doWhileBlockCtx = doWhileBlockCanvas.getContext('2d');
    this.drawEllipseBlock(this.doWhileBlockCanvas, this.doWhileBlockCtx, doWhileBlock.blockColor, doWhileBlock.lineColor, doWhileBlock.fontColor, 'doWhileBlock');
    this.forBlockCanvas = document.querySelector('#forBlockCanvas');
    this.forBlockCtx = forBlockCanvas.getContext('2d');
    this.drawLoopBlock(this.forBlockCanvas, this.forBlockCtx, -10, forBlock.blockColor, forBlock.lineColor, forBlock.fontColor, 'forBlock');
    this.ifBlockCanvas = document.querySelector('#ifBlockCanvas');
    this.ifBlockCtx = ifBlockCanvas.getContext('2d');
    this.drawIfBlock(ifBlock.blockColor, ifBlock.lineColor, ifBlock.fontColor);
    
    this.wrapBlockCanvas = document.querySelector('#wrapBlockCanvas');
    this.wrapBlockCtx = wrapBlockCanvas.getContext('2d');
    this.drawWrapBlock(wrapBlock.blockColor, wrapBlock.lineColor, wrapBlock.fontColor);
  }

  drawEllipseBlock(canvas, ctx, blockColor, lineColor, fontColor, type) {
    const x = 5;
    const y = 30;
    const w = 80;
    const h = 40;
    const radiusX = 20;
    const radiusY = 41;
    const ellipseW = 40;
    const ellipseH = 20;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = blockColor;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + w - ellipseW, y + h - ellipseH, radiusX, radiusY, Math.PI / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = fontColor;
    ctx.font = `15px Roboto`;
    ctx.textAlign = "center";
    ctx.fillText(LANGUAGE_FLOW[CURRENT_LANG][type], 45, y + h / 1.6);
  }
  
  drawIOBlock(canvas, ctx, blockColor, lineColor, fontColor, type) {
    const x = 5;
    const y = 30;
    const w = 80;
    const h = 40;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = blockColor;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - 10, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    switch (type) {
      case 'defineBlock':
        ctx.beginPath();
        ctx.moveTo(x - 10, y + 20);
        ctx.lineTo(x + 3, y + 20);
        ctx.lineTo(x - 2, y + 15);
        ctx.lineTo(x + 3, y + 20);
        ctx.lineTo(x - 3, y + 25);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - 4, y + 20);
        ctx.lineTo(x + w + 6, y + 20);
        ctx.lineTo(x + w - 3, y + 20);
        ctx.lineTo(x + w + 3, y + 15);
        ctx.lineTo(x + w - 4, y + 20);
        ctx.lineTo(x + w + 3, y + 25);
        ctx.stroke();
        break;
      case 'inputBlock':
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 5);
        ctx.lineTo(x - 3, y + 5);
        ctx.lineTo(x + 8, y + 5);
        ctx.lineTo(x + 3, y);
        ctx.lineTo(x + 8, y + 5);
        ctx.lineTo(x + 3, y + 10);
        ctx.stroke();
        break;
      case 'outputBlock':
        ctx.beginPath();
        ctx.moveTo(x + w - 10, y + h - 5);
        ctx.lineTo(x + w + 3, y + h - 5);
        ctx.lineTo(x + w, y + h - 10);
        ctx.lineTo(x + w + 3, y + h - 5);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        break;
      default:
        break;
    }
    ctx.fillStyle = fontColor;
    ctx.font = `15px Roboto`;
    ctx.textAlign = "center";
    ctx.fillText(LANGUAGE_FLOW[CURRENT_LANG][type], 45, y + h / 1.6);
  }

  drawCodeBlock(blockColor, lineColor, fontColor) {
    const x = 5;
    const y = 30;
    const w = 80;
    const h = 40;
    this.codeBlockCtx.clearRect(0, 0, this.codeBlockCanvas.width, this.codeBlockCanvas.height);
    this.codeBlockCtx.fillStyle = blockColor;
    this.codeBlockCtx.strokeStyle = lineColor;
    this.codeBlockCtx.lineWidth = 2;
    this.codeBlockCtx.save();
    this.codeBlockCtx.beginPath();
    this.codeBlockCtx.rect(x, y, w, h);
    this.codeBlockCtx.fillRect(x, y, w, h);
    this.codeBlockCtx.stroke();
    this.codeBlockCtx.fillStyle = fontColor;
    this.codeBlockCtx.font = `15px Roboto`;
    this.codeBlockCtx.textAlign = "center";
    this.codeBlockCtx.fillText(LANGUAGE_FLOW[CURRENT_LANG].codeBlock, 45, y + h / 1.6);
  }
  
  drawLoopBlock(canvas, ctx, r, blockColor, lineColor, fontColor, type) {
    const x = 5;
    const y = 30;
    const w = 80;
    const h = 40;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = blockColor;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = fontColor;
    ctx.font = `15px Roboto`;
    ctx.textAlign = "center";
    ctx.fillText(LANGUAGE_FLOW[CURRENT_LANG][type], 45, y + h / 1.6);
  }
  
  drawIfBlock(blockColor, lineColor, fontColor) {
    const x = 40;
    const y = 10;
    const w = 32;
    const h = 32;
    this.ifBlockCtx.clearRect(0, 0, this.ifBlockCanvas.width, this.ifBlockCanvas.height);
    this.ifBlockCtx.fillStyle = blockColor;
    this.ifBlockCtx.strokeStyle = lineColor;
    this.ifBlockCtx.lineWidth = 2;
    this.ifBlockCtx.save();
    this.ifBlockCtx.beginPath();
    this.ifBlockCtx.moveTo(x, y);
    this.ifBlockCtx.lineTo(x + w, y + h);
    this.ifBlockCtx.lineTo(x, y + h * 2);
    this.ifBlockCtx.lineTo(x - w, y + h);
    this.ifBlockCtx.closePath();
    this.ifBlockCtx.fill();
    this.ifBlockCtx.stroke();
    this.ifBlockCtx.fillStyle = fontColor;
    this.ifBlockCtx.font = `15px Roboto`;
    this.ifBlockCtx.textAlign = "center";
    this.ifBlockCtx.fillText(LANGUAGE_FLOW[CURRENT_LANG].ifBlock, 40, y + h);
  }
  
  drawWrapBlock(blockColor, lineColor, fontColor) {
    const x = 5;
    const y = 30;
    const w = 80;
    const h = 40;
    const bisel = 10;
    this.wrapBlockCtx.clearRect(0, 0, this.wrapBlockCanvas.width, this.wrapBlockCanvas.height);
    this.wrapBlockCtx.fillStyle = blockColor;
    this.wrapBlockCtx.strokeStyle = lineColor;
    this.wrapBlockCtx.lineWidth = 2;
    this.wrapBlockCtx.save();
    this.wrapBlockCtx.beginPath();
    this.wrapBlockCtx.moveTo(x, y);
    this.wrapBlockCtx.lineTo(x + w - bisel, y);
    this.wrapBlockCtx.lineTo(x + w, y + bisel);
    this.wrapBlockCtx.lineTo(x + w, y + h);
    this.wrapBlockCtx.lineTo(x + bisel, y + h);
    this.wrapBlockCtx.lineTo(x, y + h - bisel);
    this.wrapBlockCtx.closePath();
    this.wrapBlockCtx.fill();
    this.wrapBlockCtx.stroke();
    this.wrapBlockCtx.fillStyle = fontColor;
    this.wrapBlockCtx.font = `15px Roboto`;
    this.wrapBlockCtx.textAlign = "center";
    this.wrapBlockCtx.fillText(LANGUAGE_FLOW[CURRENT_LANG].wrapBlock, 45, y + h / 1.6);
  }
  
  updateCanvas(id) {
    const form = document.forms.namedItem("flowchartFormBlock");
    if (!form) return;
    const formData = new FormData(form);
    switch (id) {
      case 'startBlockColor':
      case 'startFontColor':
      case 'startLineColor':
        this.drawEllipseBlock(this.startBlockCanvas, this.startBlockCtx, formData.get('startBlockColor'), formData.get('startLineColor'), formData.get('startFontColor'), 'startBlock');
        break;
      case 'endBlockColor':
      case 'endFontColor':
      case 'endLineColor':
        this.drawEllipseBlock(this.endBlockCanvas, this.endBlockCtx, formData.get('endBlockColor'), formData.get('endLineColor'), formData.get('endFontColor'), 'endBlock');
        break;  
      case 'defineBlockColor':
      case 'defineFontColor':
      case 'defineLineColor':
        this.drawIOBlock(this.defineBlockCanvas, this.defineBlockCtx, formData.get('defineBlockColor'), formData.get('defineLineColor'), formData.get('defineFontColor'), 'defineBlock')
        break;
      case 'codeBlockColor':
      case 'codeFontColor':
      case 'codeLineColor':
        this.drawCodeBlock(formData.get('codeBlockColor'), formData.get('codeLineColor'), formData.get('codeFontColor'));
        break;
      case 'inputBlockColor':
      case 'inputFontColor':
      case 'inputLineColor':
        this.drawIOBlock(this.inputBlockCanvas, this.inputBlockCtx, formData.get('inputBlockColor'), formData.get('inputLineColor'), formData.get('inputFontColor'), 'inputBlock');
        break;  
      case 'outputBlockColor':
      case 'outputFontColor':
      case 'outputLineColor':  
        this.drawIOBlock(this.outputBlockCanvas, this.outputBlockCtx, formData.get('outputBlockColor'), formData.get('outputLineColor'), formData.get('outputFontColor'), 'outputBlock');
        break;    
      case 'whileBlockColor':
      case 'whileFontColor':
      case 'whileLineColor':
        this.drawLoopBlock(this.whileBlockCanvas, this.whileBlockCtx, 10, formData.get('whileBlockColor'), formData.get('whileLineColor'), formData.get('whileFontColor'), 'whileBlock');
        break;
      case 'doWhileBlockColor':
      case 'doWhileFontColor':
      case 'doWhileLineColor':
        this.drawEllipseBlock(this.doWhileBlockCanvas, this.doWhileBlockCtx, formData.get('doWhileBlockColor'), formData.get('doWhileLineColor'), formData.get('doWhileFontColor'), 'doWhileBlock');
        break;  
      case 'forBlockColor':
      case 'forFontColor':
      case 'forLineColor':
        this.drawLoopBlock(this.forBlockCanvas, this.forBlockCtx, -10, formData.get('forBlockColor'), formData.get('forLineColor'), formData.get('forFontColor'), 'forBlock');
        break;
      case 'ifBlockColor':
      case 'ifFontColor':
      case 'ifLineColor':
        this.drawIfBlock(formData.get('ifBlockColor'), formData.get('ifLineColor'), formData.get('ifFontColor'));
        break; 
      case 'wrapBlockColor':
      case 'wrapFontColor':
      case 'wrapLineColor':
        this.drawWrapBlock(formData.get('wrapBlockColor'), formData.get('wrapLineColor'), formData.get('wrapFontColor'));
        break;  
      default:
        break;
    }
  }
  
  restoreDefaultColors() {
    configEditor.flow.restoreDefault();
    const { customizedBlocks } = configEditor.flow;
    this.blockConfigPropsForm.forEach(blockConfig => {
      document.querySelector(`#${blockConfig.blockColorId}`).value = customizedBlocks[blockConfig.type].blockColor;
      document.querySelector(`#${blockConfig.fontColorId}`).value = customizedBlocks[blockConfig.type].fontColor;
      document.querySelector(`#${blockConfig.lineColorId}`).value = customizedBlocks[blockConfig.type].lineColor;
      this.updateCanvas(blockConfig.blockColorId);
    });
  }
  
  handlerFlowSettings(ev) {
    ev.preventDefault();
    switch (this.indexActiveTab) {
    case 0:
      this.handlerNewFlowchart();
      break;
    case 1:
      this.handlerZoomFlowchart();
      break;
    case 2:
      this.handlerBlockConfig();
      break;
    case 3:
      this.handlerLoadConfig();
      break;  
    default:
      break;
   }
  }
  
  handlerNewFlowchart() {
    const form = document.forms.namedItem("flowchartForm");
    const formData = new FormData(form);
    const langOutput = formData.get('comboPopUpFlowSettings');
    const flowName = formData.get('flowName');
    const flowOut = formData.get('comboPopUpFlowOut');
    if (Utils.isEmpty(flowName) || 
      this.hasWhiteSpace(flowName)) {
        const flowError = document.querySelector('#flowError');
        flowError.classList.remove('hide');
        return;
    }
    Dialog.confirmDialog("New Flowchart",
      `<span class="prj-name color-red">Are you sure that you want to create a new flowchart?</span>`,
      "Yes",
      "confirmProjectDeletionButton",
      () => {
        this.createFlowFrom(flowName, flowOut, langOutput);
       },
      () => { });
  }
  
  createFlowFrom(flowName, flowOut, langOutput) {
    this.c.markFlowchartAsSavedUnsaved(false);
    this.c.flowchartName = flowName.capitalize();
    this.c.languageOutput = langOutput;
    this.c.packageToImport = 'package domain;';
    if (flowOut === 'flow') {
      flowChartEditor.resetFlowProps();
      this.c.paletteManager.setReadyToRender(true);  
      this.c.update();
    } else {
      this.closePopUp();
      flowChartEditor.resetFlowProps();
      setTimeout(() => {
        new EditorFlowForm(this.c, true, this.c.packageToImport).show('', null, flowOut);
      }, 100);
    }
    this.closePopUp();
  }
  
  handlerZoomFlowchart() {
    const form = document.forms.namedItem("flowchartFormZoom");
    const formData = new FormData(form);
    const factor = formData.get('zoomRange');
    this.c.scaleFactor = parseFloat(factor);
    this.closePopUp();
  }
  
  handlerZoomRange() {
    document.querySelector('#zoomRange')
      .addEventListener('change', e => {
        const factor = e.target.value;
        document.querySelector('#sliderZoomX').innerText  = factor;  
      });
  }
  
  handlerBlockConfig() {
    const form = document.forms.namedItem("flowchartFormBlock");
    const formData = new FormData(form);
    const renderCogwheel = document.querySelector(`#renderCogwheel`).checked;
    const customizedBlocks = {
      ...configEditor.flow.customizedBlocks,
      startBlock: { blockColor: formData.get('startBlockColor'), fontColor: formData.get('startFontColor'), lineColor: formData.get('startLineColor') },
      endBlock: { blockColor: formData.get('endBlockColor'), fontColor: formData.get('endFontColor'), lineColor: formData.get('endLineColor') },
      defineBlock: { blockColor: formData.get('defineBlockColor'), fontColor: formData.get('defineFontColor'), lineColor: formData.get('defineLineColor') },
      codeBlock: { blockColor: formData.get('codeBlockColor'), fontColor: formData.get('codeFontColor'), lineColor: formData.get('codeLineColor') },
      inputBlock: { blockColor: formData.get('inputBlockColor'), fontColor: formData.get('inputFontColor'), lineColor: formData.get('inputLineColor') },
      outputBlock: { blockColor: formData.get('outputBlockColor'), fontColor: formData.get('outputFontColor'), lineColor: formData.get('outputLineColor') },
      whileBlock: { blockColor: formData.get('whileBlockColor'), fontColor: formData.get('whileFontColor'), lineColor: formData.get('whileLineColor') },
      doWhileBlock: { blockColor: formData.get('doWhileBlockColor'), fontColor: formData.get('doWhileFontColor'), lineColor: formData.get('doWhileLineColor') },
      forBlock: { blockColor: formData.get('forBlockColor'), fontColor: formData.get('forFontColor'), lineColor: formData.get('forLineColor') },
      ifBlock: { blockColor: formData.get('ifBlockColor'), fontColor: formData.get('ifFontColor'), lineColor: formData.get('ifLineColor')},
      wrapBlock: { blockColor: formData.get('wrapBlockColor'), fontColor: formData.get('wrapFontColor'), lineColor: formData.get('wrapLineColor')}
    }
    configEditor.flow.compareChanges(customizedBlocks);
    configEditor.flow.setConfig(customizedBlocks, renderCogwheel);
    configEditor.flow.save();
    this.c.reRender();
    this.closePopUp();
  }
  
  setFlowInfo(flowInfo, color, text,) {
    flowInfo.style.color = color;
    flowInfo.innerText = text;
    flowInfo.classList.remove('hide');
  }

  handlerLoadConfig() {
    const loadFlowName = document.querySelector('#loadFlowName').value;
    const radioTypeLoad = document.querySelector('input[name="typeLoad"]:checked').value;
    const radio = document.querySelector('input[name="projects"]:checked');
    if(radio === null) {
      this.closePopUp();
      return;
    }
    if(radioTypeLoad === 'loadNew') {
      if (Utils.isEmpty(loadFlowName) || 
              this.hasWhiteSpace(loadFlowName)) {
                const flowError = document.querySelector('#flowError');
                flowError.innerHTML = 'name is empty or contain spaces';
                flowError.classList.remove('hide');
                return;
      }
      this.c.flowchartName = loadFlowName;
    }
    const id = parseInt(radio.value);
    const project = this.projects.filter(project => project.id === id).reduce((acc, curr) => curr,{});
    if(radioTypeLoad === 'loadOverride') {
      if(this.c.languageOutput !== project.language.name.toLowerCase()) {
        const flowError = document.querySelector('#flowError');
        flowError.innerText = 'the current language is different from the selected project';
        flowError.classList.remove('hide');
        return;
      }
    }
    const compositeId = radioTypeLoad === 'loadSelected' ? project.compositeId :
      radioTypeLoad === 'loadNew' ? null : this.c.projectCompositeId;
    const mainSourceFile = project.properties.mainSourceFile.replace(/\/\/+/g, '/');
    const path = project.language.name.toLowerCase() === 'java' ?
            `${project.compositeId}/source/${mainSourceFile}` : `${project.compositeId}/${mainSourceFile}`
   FlowSpinner.mount(); 
   CompilerService.getTreeNodeContents(path, {
      callback: d => {
        FlowSpinner.unMount();
        const sourceCode = JSON.parse(d).content;
        this.closePopUp();
        flowChartEditor.resetFlowProps();
        const language = project.language.name.toLowerCase();
        const projectName = language === 'java' ? mainSourceFile.substring(mainSourceFile.lastIndexOf("/")  + 1, mainSourceFile.length).split('\.')[0] : project.name;
        this.c.languageOutput = language;
        this.c.flowchartName = radioTypeLoad === 'loadSelected' ? projectName.capitalize() : this.c.flowchartName.capitalize();
        this.c.pathClass = project.language.name.toLowerCase() === 'java' ? 
                project.properties.mainClass :  this.c.pathClass;
        const packageToImport = mainSourceFile.substring(0,mainSourceFile.lastIndexOf("/")).replaceAll('\/', '.');
        const pkg = radioTypeLoad === 'loadSelected' ? 
                !Utils.isEmpty(packageToImport) ? `package ${packageToImport};` : '' : 'package domain;';
        setTimeout(() => {
          this.c.markFlowchartAsSavedUnsaved(false);
          new EditorFlowForm(this.c, true, pkg).show(sourceCode, compositeId, 'code', pkg);
        }, 100);
      }
    });
  }
  
  closePopUp(e) {
    configEditor.flow.isChange = false;
    this.closeClickX.removeEventListener('click', this.closePopUp.bind(this));
    if (document.querySelector(".moreOptions-overlay")) {
      document.getElementById("settingsPopUp").remove();
    }
    this.c.ungrabedUi();
  }

  closeOverlayClick(e) {
    if (e.target.classList == 'moreOptions-overlay') {
      this.closePopUp();
    }
  }
  
  hasWhiteSpace(str) {
    return /\s/g.test(str);
  }
  
  getIcon(type) {
    switch (type) {
      case 'add':
        return `<svg style="position: relative; top: 6px;" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="currentColor" /><path fill-rule="evenodd" clip-rule="evenodd" d="M13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7V11H7C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13H11V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13H17C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11H13V7Z" fill="currentColor" />
      </svg>`;
      case 'zoom':
        return `<svg style="position: relative; top: 6px;" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M18.319 14.4326C20.7628 11.2941 20.542 6.75347 17.6569 3.86829C14.5327 0.744098 9.46734 0.744098 6.34315 3.86829C3.21895 6.99249 3.21895 12.0578 6.34315 15.182C9.22833 18.0672 13.769 18.2879 16.9075 15.8442C16.921 15.8595 16.9351 15.8745 16.9497 15.8891L21.1924 20.1317C21.5829 20.5223 22.2161 20.5223 22.6066 20.1317C22.9971 19.7412 22.9971 19.1081 22.6066 18.7175L18.364 14.4749C18.3493 14.4603 18.3343 14.4462 18.319 14.4326ZM16.2426 5.28251C18.5858 7.62565 18.5858 11.4246 16.2426 13.7678C13.8995 16.1109 10.1005 16.1109 7.75736 13.7678C5.41421 11.4246 5.41421 7.62565 7.75736 5.28251C10.1005 2.93936 13.8995 2.93936 16.2426 5.28251Z" fill="currentColor" />
        </svg>`;
      case 'shape':
        return `<svg style="position: relative; top: 6px;" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M6 15.2348L12 18.5681L18 15.2348V8.76521L12 5.43188L6 8.76521V15.2348ZM12 2L3 7V17L12 22L21 17V7L12 2Z" fill="currentColor" />
        </svg>`;
      case 'restore':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 14H4V4H14V9H19V19H9V14ZM6 6H12V12H6V6Z" fill="currentColor" /></svg>`;  
      case 'file':
        return `<svg style="position: relative; top: 6px;" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 18H17V16H7V18Z" fill="currentColor" />
          <path d="M17 14H7V12H17V14Z" fill="currentColor" /><path d="M7 10H11V8H7V10Z" fill="currentColor" /><path fill-rule="evenodd" clip-rule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
        </svg>`;
      default:
        return ``;
    }
  }
  
}