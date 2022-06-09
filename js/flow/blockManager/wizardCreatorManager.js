class WizardCreatorManager {
  constructor({ api, projectCompositeId, defaultWizardItems, customColorBlocks, saveExternalType }) {
    this.api = api;
    this.saveExternalType = saveExternalType;
    this.customColorBlocks = customColorBlocks;
    this.colorBlocks = this.getCustomColors();
    this.projectCompositeId = projectCompositeId;
    this.jsonPalette = this.getJsonPalette(api);
    this.keyOfPalette = this.getKeyOfPalette();
    this.KEY_PALETTE_LENGTH = 9;
    this.wizardSubItems = defaultWizardItems;
    this.jsonWizardItems = this.getWizardItems({ api });
    this.wizardItemGroups = this.wizardSubItems.map(item => item.group); 
    this.blocksType = [{ id: 'defineBlock', title: 'Define Block' }, { id: 'codeBlock', title: 'Code Block' }, { id: 'inputBlock', title: 'Input Block' }, { id: 'outputBlock', title: 'Output Block '}, { id: 'doWhileBlock', title: 'Do While Block' }, { id: 'whileBlock', title: 'While Block' }, { id: 'forBlock', title: 'For Block' }, { id: 'ifBlock', title: 'If Block' }, { id: 'wrapBlock', title: 'Function Block' }];
    this.isDragging = false;
  }
  
  getCustomColors() {
     let colors = [];
     for(const key in this.customColorBlocks) {
       colors.push({ key, ...this.customColorBlocks[key]});
     }  
     return colors;
  }
  
  getWizardItems({ api }) {
    const items = api.wizardItems || [];
    return !items.length ? this.replaceWizardDefault() : items;
  }
  
  replaceWizardDefault() {
    const items = WizardItems.getAllItems()
      .map(subItem => {
         subItem.items = this.wizardSubItems;
         return subItem;
      });
    return items;
  }
  
  getJsonPalette(api) {
    return api.palette || api.program['0'].tab.palette;
  }
  
  getPaletteCollection(palette) {
    if (Utils.isEmpty(palette)) 
      return ['define', 'code', 'input', 'output', 'while', 'doWhile', 'for', 'if', 'wrap'];
    const keyOfPalette = [];
    for (const [k, v] of Object.entries(palette)) {
      keyOfPalette.push(...v);
    }
    return keyOfPalette;
  }
  
  getKeyOfPalette() {
    return this.getPaletteCollection(this.jsonPalette);  
  }
  
  show() {
    this.overlay = document.createElement('div');
    this.overlay.classList.add('overlay');
    this.overlay.id = 'overlayWizardCreator';
    this.overlay.style.overflow = 'auto';
    this.overlay.innerHTML = this.template();
    document.querySelector('body').appendChild(this.overlay);
    this.selectDomElements();
  }
  
  template() {
    return (
      `<span class="closeOverlay" id="closeWizardCreator">×</span>
       <section class="wizardCreator-container">
         ${this.headerTemplate()}
         ${this.sideTemplate()}
         ${this.mainTemplate()}
       </section>`);
  }
  
  headerTemplate() {
    return (
      `<section class="wizardCreator-header">
         <h2>Wizard Creator Center</h2>
       </section>
      `);
  }
  
  sideTemplate() {
    return (
      `<section class="wizardCreator-side">
         ${this.menuTemplate()}
       </section>
      `);
  }
  
  mainTemplate() {
    return (
      `<section class="wizardCreator-main custom-gray-scroll">
         <div id="wizardCreatorMain">
           ${this.blocksMainTemplate()}
         </div>
       </section>
      `);
  }
  
  menuTemplate() {
    return (
      `<div class="wizardCreator-menu">
          <h3>Customize</h3>
          <ul id="wizardCreatorMenu">
            <li id="menuBlock" class="wizardCreator-menu-item wizardCreator-menu-active">Blocks</li>
            <li id="menuGroup" class="wizardCreator-menu-item">Groups</li>
            <li id="menuItem" class="wizardCreator-menu-item">Items</li>
            <li id="menuColor" class="wizardCreator-menu-item">Colors</li>
          </ul>
          <div class="wizardCreator-save-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
            <span>Save</span>
          </div>
       </div>
      `);  
  }
  
  blocksMainTemplate() {
    return (
      `<div class="wizardCreator-main-custom-container">
         <h3>Blocks</h3>
         <div class="wizardCreator-main-blocks">
           ${this.blocksType.map(blkType =>(
             `<div id="${blkType.id}" class="${blkType.id}Gradient mainGradientBox" style="${this.keyOfPalette.includes(blkType.id.replace('Block','')) ? 'opacity: 1' : 'opacity: .5'}">
                <h4>${blkType.title}</h4>
                <span>${this.getBlockStats(blkType.id)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                ${this.renderPaletteCheckBox(blkType.id)}
              </div>`
          )).join('')}
        </div>
      </div>`);
    
  }
  
  renderPaletteCheckBox(blockType) {
    const key = blockType.replace('Block','');
    return (`
      <section class="wizardCreator-main-wrapper-checkbox">
        <input type="checkbox" id="${key}-palette" name="${key}-palette" ${this.keyOfPalette.includes(key) ? 'checked' : ''}>
        <label for="${key}-palette"></label>
      </section>`);  
  }
  
  groupsMainTemplate() {
    return (
      `<div class="wizardCreator-main-custom-container">
         <h3>Groups</h3>
         ${this.showGroupsTemplate()}
       </div>`);
  }
  
  itemsMainTemplate() {
    return (
      `<div class="wizardCreator-main-custom-container">
         <h3>Items</h3>
         ${this.showEditItemsTemplate()}
       </div>`);
  }
  
  colorsMainTemplate() {
    return (
      `<div class="wizardCreator-main-custom-container">
         <h3>Colors</h3>
         <div class="wizardCreator-main-blocks">
           ${this.colorBlocks.map(blk =>(
             `<div id="${blk.key}-colors" class="colorBlockBox" style="background:${blk.blockColor};color: ${blk.fontColor};border: 2px solid ${blk.lineColor}" data-blkcolors='${JSON.stringify(blk)}'>
                <h4 style="color:${blk.fontColor}">${this.getColorBlockTitle(blk.key)}</h4>
                <svg xmlns="http://www.w3.org/2000/svg" style="width:7em;left: 76%;top: 32%;" viewBox="0 0 20 20" fill="currentColor">
                 <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clip-rule="evenodd" />
                </svg>
              </div>`
           )).join('')}
        </div>
      </div>`);
  }
  
  showBlockItemTemplate(props) {
    const { id, items, title } = props;
    return (
      `<div>
         <div class="wizardCreator-back-header">
           ${this.getBackHeaderTemplate(title)}
         </div>
         <div class="wizardCreator-block-items-container" data-idblockitem="${id}">
            ${items.map(item => this.showSubItemTemplate(item)).join('')}
         </div>
       </div>`);
  }
  
  showSubItemTemplate(item) {
    return (
      `${item.items.map(val => (
        `<div class="subItem-container" style="background-color:${val.color.bg};color:${val.color.font}" >
            <h4>${val.displayValue}</h4>
            <div class="switch-subitem-container">
              <p>Enable</p>
              <p>New</p>
              <label class="switch-subitem">
                <input type="checkbox" ${val.enable ? 'checked' : '' } data-switchitem='${val.name}#enable' />
                <span class="slider-subitem"></span>
              </label>
              <label class="switch-subitem">
                <input type="checkbox" ${val.isNew ? 'checked' : '' } data-switchitem='${val.name}#isNew' />
                <span class="slider-subitem"></span>
              </label>
            </div>     
         </div>`
        )).join('')}      
      `);
  }
  
  showGroupsTemplate() {
    return (
      `<div id="groupItemsContainer" class="wizardCreator-group-items-container custom-gray-scroll">
          ${this.wizardSubItems.map(subItems =>(
            `<section class="wizardCreator-drop-group-container" draggable="true">
              <div class="group-item-header">
                <h4 data-groupname='${subItems.group}'>${subItems.group}</h4>
                <div class="wizardCreator-group-items-svg-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon-group" viewBox="0 0 20 20" fill="currentColor" data-actiongroup="edit">
                    <title>Edit group name</title>
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon-group del-group"  viewBox="0 0 20 20" fill="currentColor" data-actiongroup="del">
                    <title>Delete group</title>
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div> 
              </div>
              <div id="${subItems.group}-group" class="dropGroupZone custom-gray-scroll">
               ${subItems.items.map(item => (
                 `<div class="group-draggable-item inGroupZone" style="background-color:${item.color.bg};color:${item.color.font}" data-itemgroup='${JSON.stringify(item)}' draggable="true" >
                    <p>${item.displayValue}</p>   
                  </div>`)).join('')}
              </div>
            </section>  
         `)).join('')}
       </div>
       <div class="itemsToDragZone-container">
         <div class="itemsToDragZone-header">
           <button id="saveGroup" title="Save groups">Save groups</button>
           <p id="groupsExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.5em; margin-top: 5px; font-weight: bold;margin-right: auto;'></p>
           <p id="groupsExpressionSaved" class="hide" style='margin-left: 5px; color: green; font-size:1.5em; margin-top: 5px; font-weight: bold;margin-right: auto;'></p>
           <div>
             <input type="text" id="addAgroupTextBox" name="addAgroupTextBox" placeholder="add group name here..." />
             <button id="addNewGroup" title="Add new group">Add new group</button>
           </div>  
         </div>
         <div class="itemsToDragZone"></div>
       </div>
      `);  
  }
  
  showEditItemsTemplate() {
    return (
      `<div>
         ${this.wizardSubItems.map(subItems =>(
            `<section class="wizardCreator-edit-items-container">
              <h4>${subItems.group}</h4>
              <div class="wizardCreator-edit-subItems">
               ${subItems.items.map(item => (
                 `<div style="background-color:${item.color.bg};color:${item.color.font}" data-subitemedition='${JSON.stringify(item)}'>
                    <p>${item.displayValue}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>           
                  </div>`)).join('')}
              </div>
            </section>  
         `)).join('')}
       </div>
     `);
  }
  
  getBackHeaderTemplate(title) {
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
         <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clip-rule="evenodd" />
       </svg>
       <h4>${title}</h4>`);
  }
  
  showEditSubItemForm({ data }) {
    return (
      `<div class="wizardCreator-subitem-form-overlay-container">
          <span id="closeSubItemOverlayForm">X</span>
          <section class="wizardCreator-subitem-form-container">
            <div>
              <p>Display Value</p>
              <input id="subItemDisplayValue" name="subItemDisplayValue" type="text" value='${data.displayValue}' />
            </div>
            <div> 
              <p>Background Color</p>
              <input id="subItemBgColor" name="subItemBgColor" type="color" value='${data.color.bg}' />
            </div>
            <div>
              <p>Font Color</p>
              <input id="subItemFontColor" name="subItemFontColor" type="color" value='${data.color.font}' />
            </div>
            <div style="margin-top: 10px; display:flex;justify-content: center;">
              <button id="updateSubItem">update</button>
            </div>
          </section>
       </div>`);
  }
  
  showColorBlockItemTemplate(props) {
    const { id, key, colors, title } = props;
    return (
      `<div>
         <div class="wizardCreator-back-header">
           ${this.getBackHeaderTemplate(title)}
         </div>
         <div class="" data-idcolorblockitem="${key}" id="drawContainer">
           <div style="width: 80%;margin: 0 auto;">
             <section class="drawColorContainer">
               <div>
                 <div>
                   <h3>Background:</h3> 
                   <input id="drawBlockBGC" name="drawBlockBGC" type="color" value="${colors.blockColor}"/>
                 </div>
               <div>
                 <h3>Font: </h3>
                 <input id="drawBlockFC" name="drawBlockFC" type="color" value="${colors.fontColor}"/>
               </div>
               <div>
                 <h3>Line: </h3>
                 <input id="drawBlockLC" name="drawBlockLC" type="color" value="${colors.lineColor}"/>
               </div>  
             </div>
             <div>
               <canvas id="canvasColors" width="300" heigth="300" style="border: 3px solid #878787;border-radius:10px;"></canvas>
             </div>
           </section>   
         </div>     
       </div>
     </div>`);
  }
  
  drawOvalBlock(colors, ctx, text) {
    const { blockColor, lineColor, fontColor } = colors;
    const w = 120;
    const h = 60;
    const radiusX = 30;
    const radiusY = 60;
    const ellipseW = w / 2;
    const ellipseH = h / 2;
    const x = 90;
    const y = 45; 
    ctx.clearRect(0,0,300,300);
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.fillStyle = blockColor;
    ctx.ellipse(x + ellipseW, y + ellipseH, radiusX, radiusY, Math.PI / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = fontColor;
    ctx.font = `bold 20px Roboto`;
    ctx.textAlign = "center";
    const textW =  x + w / 2;
    ctx.fillText(text, textW, y + h / 1.7, w);
    ctx.closePath(); 
  }
  
  drawLoopBlock(colors, ctx, text) {
    const { blockColor, lineColor, fontColor } = colors;
    const w = 120;
    const h = 60;
    const r = text === 'for' ? -10 : 10;
    const x = 90;
    const y = 45;
    ctx.clearRect(0,0,300,300);
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.fillStyle = blockColor;
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
    ctx.fillStyle = fontColor;
    ctx.font = `bold 20px Roboto`;
    ctx.textAlign = "center";
    const textW =  x + w / 2;
    ctx.fillText(text, textW, y + h / 1.7, w);
    ctx.stroke();
  }
  
  drawIfBlock(colors, ctx,text) {
    const { blockColor, lineColor, fontColor } = colors;
    const w = 60;
    const h = 60;
    const x = 150;
    const y = 20; 
    ctx.clearRect(0,0,300,300);
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.fillStyle = blockColor;
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h * 2);
    ctx.lineTo(x - w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = fontColor;
    ctx.font = `bold 20px Roboto`;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y + h , w);
  }
  
  drawWrapBlock(colors, ctx, text) {
    const { blockColor, lineColor, fontColor } = colors;
    const w = 120;
    const h = 60;
    const x = 90;
    const y = 45; 
    const bisel = 20;
    ctx.clearRect(0,0,300,300);
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.fillStyle = blockColor;
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - bisel, y);
    ctx.lineTo(x + w, y + bisel);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + bisel, y + h);
    ctx.lineTo(x, y + h - bisel);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = fontColor;
    ctx.font = `bold 20px Roboto`;
    ctx.textAlign = "center";
    const textW =  x + w / 2;
    ctx.fillText(text, textW, y + h / 1.7, w);
  }
  
  drawIOBlock(colors, ctx, text) {
    const { blockColor, lineColor, fontColor } = colors;
    const w = 120;
    const h = 60;
    const x = 90;
    const y = 45;
    ctx.clearRect(0, 0, 300, 300);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.fillStyle = blockColor;
    switch (text) {
      case 'code':
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.rect(x, y, w, h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'define':
        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w - 20, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 16, y + 28);
        ctx.lineTo(x + 12 - 1, y + 28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 11, y + 28)
        ctx.lineTo(x - 4, y + 22 - 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 12 - 1, y + 28);
        ctx.lineTo(x - 6, y + 38);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - 11, y + h - 28);
        ctx.lineTo(x + w + 19, y + h - 28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - 11 + 2, y + h - 28);
        ctx.lineTo(x + w - 11 + 2, y + h - 28);
        ctx.lineTo(x + w + 4, y + h - 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - 11 + 2, y + h - 28);
        ctx.lineTo(x + w - 11 + 2, y + h - 28);
        ctx.lineTo(x + w + 6, y + h - 38);
        ctx.stroke();
        break;
      case 'input':
        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w - 20, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 10, y + 5);
        ctx.lineTo(x + 17, y + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 17 - 1, y + 5);
        ctx.lineTo(x + 5, y - 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 17 - 1, y + 5);
        ctx.lineTo(x + 5, y + 10 + 1);
        ctx.stroke();
        break;
      case 'output':
        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w - 20, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - 16, y + h - 5);
        ctx.lineTo(x + w + 11, y + h - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - 16, y + h - 5);
        ctx.lineTo(x + w - 1, y + h + 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - 16, y + h - 5);
        ctx.lineTo(x + w - 1, y + h - 10 - 1);
        ctx.stroke();
        break;
    }
    ctx.fillStyle = fontColor;
    ctx.font = `bold 20px Roboto`;
    ctx.textAlign = "center";
    const textW = x + w / 2;
    ctx.fillText(text, textW, y + h / 1.7, w);
  }
  
  getBlockToDraw(key, colors) {
    const canvas = document.querySelector('#canvasColors');
    const ctx = canvas.getContext('2d');
    let text = '';
    switch(key) {
      case 'startBlock':
      case 'endBlock':
      case 'doWhileBlock':
        text = key === 'startBlock' ? 'start' : key === 'endBlock' ? 'end' : 'do while'; 
        this.drawOvalBlock(colors, ctx, text);
        break;
      case 'forBlock':
      case 'whileBlock':
        text = key === 'forBlock' ? 'for' : 'while'; 
        this.drawLoopBlock(colors, ctx, text);
        break;
      case 'ifBlock':
        this.drawIfBlock(colors, ctx, 'if');
        break;
      case 'wrapBlock':
        this.drawWrapBlock(colors, ctx, 'function');
        break;
      default:
        text = key === 'codeBlock' ? 'code' : key === 'inputBlock' ? 'input' : key === 'outputBlock' ? 'output' : 'define';  
        this.drawIOBlock(colors, ctx, text);  
    }
  }
  
  getBlockStats(id) {
    const items = this.jsonWizardItems.filter(el => el.type === id)[0].items;  
    const sumaEnable =  this.getStatsItems(items, 'enable');
    const sumaIsNew =  this.getStatsItems(items, 'isNew');
    const len = WizardItems.getDefaultItems().reduce((acc, curr) => acc + curr.items.length,0); 
    return (
      `<p>Enable: ${sumaEnable} / ${len}</p>
       <p>New: ${sumaIsNew} / ${len}</p>
      `);
  }
  
  getStatsItems(items, type) {
    const itemsCount = [];
    items.forEach(el =>{
      itemsCount.push(el.items.reduce((acc,curr) => {
        if(curr[type]) return acc = acc + 1;
        return acc;
      },0));
    });
    return itemsCount.reduce((acc,curr) => acc + curr,0);
  }
  
  getColorBlockTitle(key) {
    const blocks = {
      codeBlock: 'Code Block',
      defineBlock: 'Define Block',
      doWhileBlock: 'Do While Block',
      endBlock: 'End Block',
      forBlock: 'For Block',
      ifBlock: 'If Block',
      inputBlock: 'Input Block',
      outputBlock: 'Output Block',
      startBlock: 'Start Block',
      whileBlock: 'While Block',
      wrapBlock: 'Function Block' 
     }
    return blocks[key];
  }
  
  selectDomElements() {
    this.closeWizardCreator = document.querySelector('#closeWizardCreator');  
    this.wizardCreatorMenu = document.querySelector('#wizardCreatorMenu');
    this.wizardCreatorMain = document.querySelector('#wizardCreatorMain');
    this.saveBtn = document.querySelector('.wizardCreator-save-container');
    this.listenerManager('addEventListener');
    this.blockMainListenerManager('addEventListener');
  }
  
  handleMenu(ev) {
    ev.preventDefault();
    const target = ev.target;
    if(target.classList.contains('wizardCreator-menu-active')) return;
    switch(target.id) {
      case 'menuBlock':
        this.menuBlockManager(target.id);
        break;
      case 'menuGroup':
        this.menuGroupManager(target.id);
        break;
      case 'menuItem':
        this.menuItemManager(target.id);
        break;  
      case 'menuColor':
        this.menuColorManager(target.id);
        break;    
      default:
        break;
    }
  }
  
  menuBlockManager(id) {
    this.setActiveMenu(id); 
    this.wizardCreatorMain.innerHTML = this.blocksMainTemplate();
    this.blockMainListenerManager('addEventListener');
  }
  
  menuGroupManager(id) {
    this.setActiveMenu(id);
    this.wizardCreatorMain.innerHTML = this.groupsMainTemplate();
    this.wizardGroupDomSelector();
  }
  
  menuItemManager(id) {
    this.setActiveMenu(id);
    this.wizardCreatorMain.innerHTML = this.itemsMainTemplate();
    this.wizardEditItemDomSelector();
  }
  
  menuColorManager(id) {
    this.setActiveMenu(id);
    this.wizardCreatorMain.innerHTML = this.colorsMainTemplate();
    this.wizardColorsDomSelector();
  }
  
  setActiveMenu(id) {
    [...this.wizardCreatorMenu.children]
      .forEach(el => el.classList.remove('wizardCreator-menu-active'));
    document.querySelector(`#${id}`).classList.add('wizardCreator-menu-active');
  }
  
  handleMainBlock(ev) {
    ev.preventDefault();
    if(ev.target.classList.contains('wizardCreator-main-blocks')) return;
    const target = this.sanitazeMainBlockTarget(ev.target);
    if(!target) return;
    const id = target.id;
    if(id.endsWith('-palette')) {
      this.handleBlockMainCheckbox(target);
      return;
    }
    const key = id.replace('Block','');
    if(!document.querySelector(`#${key}-palette`).checked) return; 
    const items = this.jsonWizardItems.filter(el => el.type === id)[0].items; 
    const title = target.firstElementChild.innerText;
    this.blockMainListenerManager('removeEventListener');
    this.wizardCreatorMain.innerHTML = this.showBlockItemTemplate({ id, items, title });
    this.blockItemDomSelector();
  }
  
  sanitazeMainBlockTarget(target) {
    if(target.classList.contains('mainGradientBox')) {
      return target;
    } else if(['h4', 'svg', 'span'].includes(target.tagName.toLowerCase())) {
        return target.parentElement;
    } else if(['p', 'path'].includes(target.tagName.toLowerCase())) {
        return target.parentElement.parentElement;
    } else if(['label'].includes(target.tagName.toLowerCase())) {
       const attr = target.getAttribute('for');  
       return document.querySelector(`#${attr}`);
    }
    return null;
  }
  
  handleBlockMainCheckbox(target) {
    target.checked = !target.checked;   
    const key = target.id.replace('-palette','');
    document.querySelector(`#${key}Block`).style.opacity = target.checked ? 1 : 0.5; 
    this.keyOfPalette = target.checked ? [...this.keyOfPalette, key] : this.keyOfPalette.filter(keyPalette => keyPalette !== key);
    this.jsonPalette = !this.keyOfPalette.length || this.keyOfPalette.length === this.KEY_PALETTE_LENGTH ? {} : this.buildJsonPalette();
  }
  
  buildJsonPalette() {
    const palette = {}
    this.keyOfPalette.forEach(key => {
      const parentKey = this.getParentKeyPalette(key);
      if(!palette[parentKey]) palette[parentKey] = [];
      palette[parentKey].push(key);
    });
    return palette;
  }
  
  getParentKeyPalette(key) {
    switch(key) {
      case 'define': 
      case 'code': 
      case 'input': 
      case 'output':
        return 'io';
      case 'while':
      case 'doWhile':
      case 'for':
        return 'loop';
      case 'if':
        return 'decision';
      case 'wrap':
        return 'wrap';
    }
  }
  
  handleSwitchItems(ev) {
    ev.preventDefault();
    const target = ev.target;
    if(target.tagName.toLowerCase() !== 'input') return;
    const [itemName, inputType] = target.dataset.switchitem.split('#');
    const idBlockItem = document.querySelector('[data-idblockitem]').dataset.idblockitem;
    const updateData = { [inputType]: target.checked };
    this.updateJsonItems({ updateData, filterData: itemName, typeBlockItem: idBlockItem });
  }

  handleEditSubItems(ev) {
    ev.preventDefault();
    const tagName = ev.target.tagName.toLowerCase();
    const target =  tagName === 'div' ? ev.target : 
       (tagName === 'p' || tagName === 'svg') ? 
       ev.target.parentElement : ev.target.parentElement.parentElement;
    this.editItemFormManager({ target });
  }
  
  editItemFormManager({ target }) {
    this.currentSubItemTarget = target;
    const data = JSON.parse(target.dataset.subitemedition);
    if(document.querySelector('#overlayEditItemForm')) {
      this.subItemDisplayValue.value = data.displayValue;
      this.subItemBgColor.value = data.color.bg;
      this.subItemFontColor.value = data.color.font;
    } else {
        const div = document.createElement('div');
        div.id = 'overlayEditItemForm';
        div.innerHTML = this.showEditSubItemForm({ data });
        document.querySelector('.wizardCreator-container').appendChild(div);
        this.subItemOverlayFormDomSelector();
    }
  }
  
  handleUpdateSubItems(ev) {
    ev.preventDefault();
    const data = JSON.parse(this.currentSubItemTarget.dataset.subitemedition);
    data.displayValue = this.subItemDisplayValue.value;
    data.color = {
      bg: this.subItemBgColor.value,
      font: this.subItemFontColor.value
    }
    this.currentSubItemTarget.dataset.subitemedition = JSON.stringify(data);
    this.currentSubItemTarget.firstElementChild.innerHTML = this.subItemDisplayValue.value; 
    this.currentSubItemTarget.style.color = this.subItemFontColor.value; 
    this.currentSubItemTarget.style.backgroundColor = this.subItemBgColor.value; 
    const updateData = { color: data.color, displayValue: data.displayValue };
    this.updateJsonItems({ updateData, filterData: data.name, typeBlockItem: null });
    this.updateSubItems({ updateData, filterData: data.name });
  }
  
  handleGroupBtnAction(ev) {
    ev.preventDefault();
    const tagName = ev.target.tagName.toLowerCase();
    if(tagName === 'div') return;
    const target = ev.target;
    const action = tagName === 'svg' ? target.dataset.actiongroup : target.parentElement.dataset.actiongroup; 
    let parentTarget = '';
    switch(action) {
      case 'edit':
        parentTarget = tagName === 'svg' ? target.parentElement.parentElement : target.parentElement.parentElement.parentElement;
        this.editGroupName(parentTarget);
        break;
      case 'del':
        parentTarget = tagName === 'svg' ? target.parentElement.parentElement.parentElement : target.parentElement.parentElement.parentElement.parentElement;
        this.removeGroup(parentTarget);
        break; 
      default:
        break;
    }
  }
  
  editGroupName(parentTarget) {
    const data = parentTarget.firstElementChild.dataset.groupname;
    const div = document.createElement('div');
    div.classList.add('overlay');
    div.style = Utils.hasCssBackdrop() ? 
      `background: rgba(255, 255, 255, 0.05);backdrop-filter: blur(5px);-webkit-backdrop-filter: blur(5px);` : `background: #263d5a73;`; 
    div.id = 'overlayEditGroupName';
    div.innerHTML = this.editGroupNameTemplate(data);
    document.querySelector('body').appendChild(div);
    this.updateGroupTextBtn = document.querySelector('#updateGroupTextBtn');
    this.updateGroupTextBtn.addEventListener('click', this.updateGroupBoxText.bind(this, parentTarget));
  }
  
  editGroupNameTemplate(data) {
    return (
      `<div class="wizard-box-edit-dialog">
         <h4>Update groupName</h4>
        <input type="text" id="editGroupText" name="editGroupText" value='${data}' />
        <p id="groupNameExpressionError" class="hide" style='margin-left: 5px; color: red; font-size:1.1em; margin-top: 5px; font-weight: bold;'></p>
        <button id="updateGroupTextBtn">update</button> 
      </div>
      `);
  }
  
  updateGroupBoxText(element, ev) {
    const currentGroupName = element.firstElementChild.dataset.groupname;
    const newGroupName = document.querySelector('#editGroupText').value;
    const { error, message } = this.validateGroupName(currentGroupName, newGroupName);
    if(error) {
      this.displayExpressionError('groupNameExpressionError', message);
      return;
    }
    this.addRemoveGroupName(currentGroupName, newGroupName);
    element.firstElementChild.innerHTML = newGroupName;
    element.firstElementChild.dataset.groupname = newGroupName;
    this.updateGroupTextBtn.removeEventListener('click', this.updateGroupBoxText.bind(this, element));
    document.querySelector('#overlayEditGroupName').remove(); 
  }
  
  validateGroupName(currentGroupName, newGroupName) {
    if(Utils.isEmpty(newGroupName)) 
      return { error: true, message: 'expression is empty' };
    if(currentGroupName !== newGroupName && this.wizardItemGroups.includes(newGroupName)) 
      return { error: true, message: 'group name already exists' };
    return { error: false, message: '' };
  }
  
  addRemoveGroupName(currentGroupName, newGroupName) {
    this.wizardItemGroups = this.wizardItemGroups.filter(gn => gn !== currentGroupName);
    this.wizardItemGroups.push(newGroupName);
  }
  
  removeGroup(parentTarget) {
    const children = Array.from(parentTarget.children);
    const groupName = children[0].firstElementChild.dataset.groupname;
    this.wizardItemGroups = this.wizardItemGroups.filter(gn => gn !== groupName);
    const deletedChildren = Array.from(children[1].children).map(el => JSON.parse(el.dataset.itemgroup));
    this.moveDeletedGroupItems(deletedChildren);
    parentTarget.remove();
  }
  
  moveDeletedGroupItems(deletedChildren) {
    for(const item of deletedChildren) {
      const div = document.createElement('div');
      const p = document.createElement('p');
      div.classList = ['group-draggable-item'];
      div.style = `background-color:${item.color.bg};color:${item.color.font};width:${item.displayValue.length + 1}ch;`;
      div.dataset.itemgroup = JSON.stringify(item);
      div.setAttribute('draggable', true);
      p.innerHTML = item.displayValue;
      div.appendChild(p);
      document.querySelector('.itemsToDragZone').appendChild(div);  
      div.addEventListener('dragstart', this.handleDragItemStart.bind(this)); 
      div.addEventListener('dragend', this.handleDragItemEnd.bind(this));
    }
  }
  
  handleAddNewGroup(ev) {
    ev.preventDefault();
    const newGroupName = document.querySelector('#addAgroupTextBox').value;
    if(Utils.isEmpty(newGroupName) || this.wizardItemGroups.includes(newGroupName)) {
      const msg = Utils.isEmpty(newGroupName) ? 'group name is empty' : 'group name already exists'
      this.displayExpressionError('groupsExpressionError', msg);
      return; 
    }
    this.wizardItemGroups.push(newGroupName);
    const section = document.createElement('section');
    const divHeader = document.createElement('div');
    const divBtn = document.createElement('div');
    const divDrop = document.createElement('div');
    const h4 = document.createElement('h4');
    section.classList = ['wizardCreator-drop-group-container']
    section.setAttribute('draggable', true);
    h4.innerHTML = newGroupName;
    h4.dataset.groupname = newGroupName;
    divHeader.classList = ['group-item-header'];
    divBtn.classList = ['wizardCreator-group-items-svg-btn'];
    divBtn.innerHTML =  `<svg xmlns="http://www.w3.org/2000/svg" class="svg-icon-group" viewBox="0 0 20 20" fill="currentColor" data-actiongroup="edit">
      <title>Edit group name</title>
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" class="svg-icon-group del-group"  viewBox="0 0 20 20" fill="currentColor" data-actiongroup="del">
      <title>Delete group</title>
      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>`;
    divDrop.id= `${newGroupName}-group`; 
    divDrop.classList = ['dropGroupZone'];
    divHeader.appendChild(h4);
    divHeader.appendChild(divBtn);
    section.appendChild(divHeader);
    section.appendChild(divDrop);
    document.querySelector('#groupItemsContainer').appendChild(section);
    document.querySelector('#addAgroupTextBox').value = '';
    divBtn.addEventListener('click', this.handleGroupBtnAction.bind(this));
    section.addEventListener('dragstart', this.handleDragStart.bind(this)); 
    section.addEventListener('dragend', this.handleDragEnd.bind(this));
  }

  handleSaveGroup(ev) {
    ev.preventDefault();
    const target = ev.target;
    const itemsToDragZone = document.querySelector('.itemsToDragZone');
    if([...itemsToDragZone.children].length > 0) {
      this.displayExpressionError('groupsExpressionError', 'some blocks are out of a group');
      return;
    }
    const dropGroupZone = [...document.querySelectorAll('.wizardCreator-drop-group-container')];
    const buildedGroups = [];
    for(let i = 0; i < dropGroupZone.length; i++) {
      const dropGroupZoneChildren = [...dropGroupZone[i].children];
      const itemsGroupZone = [...dropGroupZoneChildren[1].children];
      const groupName = [...dropGroupZoneChildren[0].children][0].dataset.groupname;
      if(!itemsGroupZone.length) {
        this.displayExpressionError('groupsExpressionError', `group "${groupName}" is empty`);
        return;
      }
      const groups = { group: groupName, pos: i, items: [] };
      const buildedSubItems = [];
      for(let j = 0; j < itemsGroupZone.length; j++) {
          const dataItem = JSON.parse(itemsGroupZone[j].dataset.itemgroup);
          dataItem.pos = j;
          buildedSubItems.push(dataItem);
      }
      groups.items = buildedSubItems;
      buildedGroups.push(groups);
    }
    this.wizardSubItems = buildedGroups; 
    this.jsonWizardItems = this.rebuildJsonItems(); 
    this.displayExpressionError('groupsExpressionSaved', 'the groups were saved!!!');
  }
  
  rebuildJsonItems() {
    return this.jsonWizardItems.map(jsonItem => {
      let singleItems = this.getJsonItem(jsonItem, []);
      const newItems = [];
      this.wizardSubItems.forEach(buildItem => {
        const newSubItem = { group: buildItem.group,  items:[] };
        buildItem.items.forEach(subItem => {
          const newGroupItem = this.getNewGroupItem(singleItems, subItem);
          singleItems = singleItems.filter(sItm => sItm.name !== subItem.name);
          newSubItem.items.push(newGroupItem);
        });
          newItems.push(newSubItem);
      });  
      jsonItem.items = newItems;
      return jsonItem;
    });
  }

  getNewGroupItem(singleItems, subItem) {
    const index = singleItems.findIndex(sItm => sItm.name === subItem.name);
    const itemData = singleItems[index];
    const newItem = {...subItem};
    newItem.color = itemData.color;
    newItem.displayValue = itemData.displayValue;
    newItem.enable = itemData.enable;
    newItem.isNew = itemData.isNew;
    return newItem;
  }
  
  getJsonItem(jsonItem, singleItems) {
    jsonItem.items
      .map(item => [...item.items])
      .forEach(sub =>  singleItems = [...singleItems, ...sub]);
    return singleItems;
  }
  
  updateJsonItems({ updateData, filterData, typeBlockItem }) {
    this.jsonWizardItems = this.jsonWizardItems.map(jsonItem => {
      if(typeBlockItem && jsonItem.type !== typeBlockItem) return {...jsonItem};
         let temp = Object.assign({}, jsonItem);
        temp.items = jsonItem.items.map(subItem => {
          let temp2 = Object.assign({}, subItem);
          temp2.items = subItem.items.map(item => {
            if(item.name !== filterData) return {...item};
            return {...item, ...updateData };
          });
          return {...temp2};
        });
       return {...temp};
    });
  }
  
  updateSubItems({ updateData, filterData }) {
    this.wizardSubItems = this.wizardSubItems.map(subItem => {
      subItem.items = subItem.items.map(item => {
        if(item.name !== filterData) return item;
        return {...item, ...updateData };
      }) ;
      return subItem;
    }); 
  }
  
  subItemOverlayFormDomSelector() {
    this.subItemDisplayValue = document.querySelector('#subItemDisplayValue');
    this.subItemBgColor = document.querySelector('#subItemBgColor');
    this.subItemFontColor = document.querySelector('#subItemFontColor');
    this.updateSubItem = document.querySelector('#updateSubItem');
    this.closeSubItemOverlayForm = document.querySelector('#closeSubItemOverlayForm');
    this.subItemOverlayListenManager('addEventListener');
  }
  
  handleBackToBlocks(ev) {
    ev.preventDefault();
    const target = ev.target;
    if(!['svg', 'path'].includes(target.tagName.toLowerCase())) return;
    this.blockItemListenerManager('removeEventListener'); 
    this.wizardCreatorMain.innerHTML = this.blocksMainTemplate();
    this.blockMainListenerManager('addEventListener');
  }
  
  handleBackToColorBlocks(ev) {
    ev.preventDefault();
    const target = ev.target;
    if(!['svg', 'path'].includes(target.tagName.toLowerCase())) return;
    this.blockColorItemListenerManager('removeEventListener'); 
    this.wizardCreatorMain.innerHTML = this.colorsMainTemplate();
    this.wizardColorsDomSelector();
  }
  
  handleCloseEditSubItems(ev) {
    ev.preventDefault();
    this.currentSubItemTarget = null;
    this.subItemOverlayListenManager('removeEventListener');
    document.querySelector('#overlayEditItemForm').remove();
  }
  
  handleChangeColor(ev) {
    ev.preventDefault();
    if(ev.target.classList.contains('wizardCreator-main-blocks')) return;
    const target = this.sanitazeColorBlockTarget(ev.target);
    if(!target) return;
    const id = target.id;
    const key = id.replace('-colors','');
    const title = target.firstElementChild.innerText;
    const colors = JSON.parse(target.dataset.blkcolors);
    this.blockColorListenerManager('removeEventListener');
    this.wizardCreatorMain.innerHTML = this.showColorBlockItemTemplate({ id, key, colors, title });
    this.getBlockToDraw(key, colors);
    this.blockColorItemDomSelector();
  }
  
  sanitazeColorBlockTarget(target) {
    if(target.classList.contains('colorBlockBox')) {
      return target;
    } else if(['h4', 'svg', 'span'].includes(target.tagName.toLowerCase())) {
        return target.parentElement;
    } else if(['p', 'path'].includes(target.tagName.toLowerCase())) {
        return target.parentElement.parentElement;
    } 
    return null;
  }
  
  handleChangeColorBlock(ev) {
    ev.preventDefault();
    const target = ev.target;
    if (target.tagName.toLowerCase() !== 'input') return;
    const id = target.id;
    const colorElement = document.querySelector(`#${id}`);
    const drawContainer = document.querySelector('#drawContainer');
    const key = drawContainer.dataset.idcolorblockitem;
    const colorKey = id === 'drawBlockBGC' ? 'blockColor' : id === 'drawBlockFC' ? 'fontColor' : 'lineColor';
    colorElement.value = target.value;
    this.customColorBlocks[key][colorKey] = target.value;
    this.colorBlocks = this.getCustomColors();
    this.getBlockToDraw(key, this.customColorBlocks[key]);
  }
  
  handleSave(ev) {
    ev.preventDefault();
    this.api.wizardItems = this.jsonWizardItems;
    this.api.palette = this.jsonPalette;
    this.api.colors = this.customColorBlocks;
    this.saveExternalWizardItems();
    this.saveJsonFlowToFile();
    this.handleClose(ev);
  }
  
  saveExternalWizardItems() {
    switch(this.saveExternalType) {
      case 'course':
        this.updateWizardCourse();
      default:
        break;
    }  
  }
  
  updateWizardCourse() {
    const courseConfigFlow = { customBlock: this.customColorBlocks, wizardItems: this.wizardSubItems } 
    document.querySelector('#flowConfig').value = JSON.stringify(courseConfigFlow);
  }
  
  handleClose(ev) {
    ev.preventDefault();
    this.listenerManager('removeEventListener');
    this.overlay.remove();
  }
  
  saveJsonFlowToFile() {
    const jsonFileManager = new JSONFileManager();
    const content = JSON.stringify(this.api, null, 2); 
    jsonFileManager.saveJsonFile({ projectCompositeId: this.projectCompositeId, content },() => {  
      browxyStartUp.fileOperation.renameOpenedFile(`${this.projectCompositeId}/flowchart.json`, `${this.projectCompositeId}/flowchart.json`, 'flowchart.json');
      Utils.stopLoader(); 
    });
  }
  
  displayExpressionError(selector, txt) {
    const expressionError = document.querySelector(`#${selector}`);
    expressionError.innerText = txt;
    expressionError.classList.remove('hide');
    setTimeout(() => {
      expressionError.classList.add('hide');
    },2500);
  }
  
  blockMainListenerManager(listenType) {
    document.querySelector('.wizardCreator-main-blocks')[listenType]('click', this.handleMainBlock.bind(this));
  }
  
  wizardGroupDomSelector() {
    this.parentDropGroupZone = document.querySelector('#groupItemsContainer');
    this.dropGroupZone = document.querySelectorAll('.wizardCreator-drop-group-container');
    this.groupItems = document.querySelectorAll('.group-draggable-item');    
    this.groupBtnAction = document.querySelectorAll('.wizardCreator-group-items-svg-btn');
    this.saveGroupBtn = document.querySelector('#saveGroup');
    this.addNewGroupBtn = document.querySelector('#addNewGroup');
    this.addGroupListenManager('addEventListener');
  }
  
  wizardEditItemDomSelector(){
    this.subItemsEdition = document.querySelectorAll('[data-subitemedition]');  
    this.wizardEditItemListenerManager('addEventListener');
  }
  
  blockItemDomSelector() {
    this.backToBlocks = document.querySelector('.wizardCreator-back-header');
    this.switchItems = document.querySelectorAll('[data-switchitem]');
    this.blockItemListenerManager('addEventListener');
  }
  
  wizardColorsDomSelector() {
    this.colorBlockBox = document.querySelectorAll('.colorBlockBox');
    this.blockColorListenerManager('addEventListener');
  }
  
  blockColorItemDomSelector(listenType) {
    this.backToBlocksColors = document.querySelector('.wizardCreator-back-header');
    this.drawBlockInputColors = document.querySelectorAll('input[type=color]');
    this.blockColorItemListenerManager('addEventListener');
  }
  
  blockColorItemListenerManager(listenType) {
    this.backToBlocksColors[listenType]('click', this.handleBackToColorBlocks.bind(this));
    this.drawBlockInputColors
      .forEach(el => el[listenType]('change', this.handleChangeColorBlock.bind(this)));
  }
  
  blockItemListenerManager(listenType) {
    this.backToBlocks[listenType]('click', this.handleBackToBlocks.bind(this)); 
    this.switchItems
      .forEach(el => el[listenType]('change', this.handleSwitchItems.bind(this)));
  }
  
  addGroupListenManager(listenType) {  
    this.dropGroupZone.forEach(element => { 
      element.addEventListener('dragstart', this.handleDragStart.bind(this)); 
      element.addEventListener('dragend', this.handleDragEnd.bind(this));
    });
    this.groupItems.forEach(element => { 
      element.addEventListener('dragstart', this.handleDragItemStart.bind(this)); 
      element.addEventListener('dragend', this.handleDragItemEnd.bind(this));
    });
    this.overlay.addEventListener('dragenter', this.handleDragEnter.bind(this));
    this.overlay.addEventListener('dragover', this.handleDragOver.bind(this));
    this.overlay.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.overlay.addEventListener('drop', this.handleDrop.bind(this));
    this.groupBtnAction
      .forEach(el => el[listenType]('click', this.handleGroupBtnAction.bind(this)));
    this.saveGroupBtn[listenType]('click', this.handleSaveGroup.bind(this));
    this.addNewGroupBtn[listenType]('click', this.handleAddNewGroup.bind(this)); 
  }
  
  wizardEditItemListenerManager(listenType) {
    this.subItemsEdition
     .forEach(el => el[listenType]('click', this.handleEditSubItems.bind(this)));
  }

  subItemOverlayListenManager(listenType) {
    this.updateSubItem[listenType]('click', this.handleUpdateSubItems.bind(this))
    this.closeSubItemOverlayForm[listenType]('click', this.handleCloseEditSubItems.bind(this))    
  }
  
  blockColorListenerManager(listenType) {
    this.colorBlockBox
      .forEach(el => el[listenType]('click', this.handleChangeColor.bind(this)));  
  }
  
  listenerManager(listenType) {
    this.wizardCreatorMenu[listenType]('click', this.handleMenu.bind(this));
    this.saveBtn[listenType]('click', this.handleSave.bind(this));
    this.closeWizardCreator[listenType]('click', this.handleClose.bind(this));
  }
  
  handleDragStart(ev) {
    Utils.selecting(false);
    if(this.isDragging) return;
    this.dragStartAction(ev.target);   
  }
  
  handleDragItemStart(ev) {
    Utils.selecting(false);
    this.dragStartAction(ev.target);  
  }
  
  dragStartAction(target) {
    this.typeOfDnD = this.getTypeDnD(target);
    this.dragSourceItem = target;
    this.isDragging = true;
  }
  
  getTypeDnD(target) {
    return target.classList.contains('group-draggable-item') ? 'item' : 'group';
  }
  
  handleDragEnter(ev) {
    ev.preventDefault();
  }
  
  handleDragOver(ev) {
    ev.preventDefault();
    const target = ev.target;
    if(!this.dragSourceItem) return;
    if (this.dragSourceItem.classList.contains('wizardCreator-drop-group-container') 
            && target.classList.contains('group-item-header')) {
      this.parentDropGroupZone.classList.add('dropZone-over');  
    } else if (target.classList.contains('inGroupZone') ||
        target.classList.contains('dropGroupZone')) {
       this.currentDropZoneItem = target.classList.contains('dropGroupZone') ? target : target.parentElement; 
       this.currentDropZoneItem.classList.add('dropZone-over');
       if (target.classList.contains('inGroupZone')) {
         const initialValue = [...this.currentDropZoneItem.children].indexOf(target) + 1;
         this.moveSmooth(initialValue, 'add'); 
       }         
    } 
  }
  
  handleDragLeave(ev) {
    ev.preventDefault();
    this.parentDropGroupZone.classList.remove('dropZone-over');   
    if(this.currentDropZoneItem) {
      this.currentDropZoneItem.classList.remove('dropZone-over');
      this.moveSmooth(0, 'remove');
    }
  }
  
  handleDragEnd(ev) {
    ev.stopPropagation();
    this.dragEndAction();
    return false;
  }
  
  handleDragItemEnd(ev) {
    ev.stopPropagation();
    this.dragEndAction();
    return false;
  }
  
  dragEndAction() {
    this.dragSourceItem = null;
    Utils.selecting(true);
    this.moveSmooth(0, 'remove');
    this.isDragging = false;
    this.currentDropZoneItem = null;
  }

  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const target = ev.target;
    switch(this.typeOfDnD) {
      case 'group':
        this.dndGroupAction(target);
        break;
      case 'item':
        this.dndItemAction(target);
        break;  
      default:
        break;
    }
    this.parentDropGroupZone.classList.remove('dropZone-over');  
    if(this.currentDropZoneItem)
      this.currentDropZoneItem.classList.remove('dropZone-over');
  }
  
  dndGroupAction(target) {
    target = target.parentElement;
    if(!target.classList.contains('wizardCreator-drop-group-container')) return;
    this.insertDroppedItems(target, this.parentDropGroupZone);
  }
  
  dndItemAction(target) {
    if(!this.dragSourceItem.classList.contains('inGroupZone')) {
      this.dragSourceItem.style.width = 'auto';
      this.dragSourceItem.classList.add('inGroupZone');
    }
    if(target.classList.contains('dropGroupZone')) {
      this.currentDropZoneItem.appendChild(this.dragSourceItem);
    } else if(target.classList.contains('inGroupZone')){ 
       this.insertDroppedItems(target, this.currentDropZoneItem);
    }
  }
  
  insertDroppedItems(target, dropZone) {
    const dragValue = [...dropZone.children].indexOf(this.dragSourceItem);
    const dropValue = [...dropZone.children].indexOf(target);
    const position = dropValue >= dragValue ? 'afterend' : 'beforebegin';
    target.insertAdjacentElement(position, this.dragSourceItem);
  }
  
  moveSmooth(initialValue, action) {
    if(!this.currentDropZoneItem) return;
    const children = [...this.currentDropZoneItem.children];
    for (let i = initialValue; i < children.length; i++) {
      this.currentDropZoneItem.children[i].classList[action]('move-smooth');
    }
  }
  
}