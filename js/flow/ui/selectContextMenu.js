class SelectContextMenu extends ContextMenuBase {

  constructor(canvas, typeMenu) {
    super(canvas, [
      { id: 'editItem', title: 'Edit', tooltip: 'Edit block', type: 'edition' },
      { id: 'copyItem', title: 'Copy', tooltip: 'Copy selected blocks', type: 'edition' },
      { id: 'breakpointItem', title: 'Breakpoint', tooltip: 'Add breakpoint', type: 'edition' },
      { id: 'wrapItem', title: 'Wrap', tooltip: 'Wrap selected blocks', type: 'all', 
        subMenu: [{ id: 'wrapSubItemFunction', title: 'Function', tooltip: 'Wrap selected blocks in function', type: 'all'}] },
      { id: 'colorItem', title: 'Color', tooltip: 'Change color block', type: 'edition' },
      { id: 'newTabItem', title: 'Open in new tab', tooltip: 'Open blocks in new tab', type: 'wrap' },
      { id: 'newFunctionItem', title: 'New function', tooltip: 'Create new function', type: 'new' }
    ]);
    this.index = -1;
    this.typeMenu = typeMenu;
  }

  template() {
    return `
      <ul id='contextMenu' class="canvasContextMenu canvasContextMenu-show">
       ${this.menuItems.map(item =>
      `<li class="canvasContextMenu-item ${item.subMenu ? 'canvasContextMenu-item-submenu' : ''}" data-ctxmenu="${item.id}" title='${item.tooltip}'>
           <i data-ctxmenu="${item.id}">${this.getIcon(item.id)}</i>
           <span data-ctxmenu="${item.id}">${item.title}</span>
           ${item.subMenu ?
        `<ul  class="canvasContextMenu">
          ${item.subMenu.map(subItem => (
          `<li class="canvasContextMenu-item" data-ctxmenu="${subItem.id}" title='${subItem.tooltip}'>
              <i data-ctxmenu="${subItem.id}">${this.getIcon(subItem.id)}</i>
              <span data-ctxmenu="${subItem.id}">${subItem.title}</span>
              </li>`)).join('')}</ul>` : ''}       
           </li>`).join('')}
     </ul>`;
  }

  filterMenu(typeFilter, index) {
    this.index = index;
    if(index === 0) {
     this.menuItems = [{ id: 'editFuncItem', title: 'Edit function', tooltip: 'Edit function', type: 'edition' }];  
    } else if (this.c.tabs[this.c.selectedTab].id == '1') {
        if (!this.c.program[index].tabId) {
          this.menuItems = this.menuItems.filter(item => item.type === 'new')
        } else {
          this.complexFilterMenu(typeFilter, index);
        }
      } else {
          this.complexFilterMenu(typeFilter, index);
      }
    return this;
  }
  
  complexFilterMenu(typeFilter, index) {
    this.menuItems = this.menuItems.filter(item => item.type !== typeFilter)
      .filter(item => {
        if (index > -1) {
          if (this.c.program[this.index].type !== 'wrapBlock') {
            return item.type !== 'wrap' && item.id !== 'newFunctionItem';
          } else {
            return (item.id !== 'wrapItem' && item.id !== 'copyItem' &&
              item.id !== 'newFunctionItem' && item.id !== 'colorItem' &&
              (!this.c.program[index].tabId ? (item.id !== 'newTabItem') : true));
          }
        }
        return item.id !== 'newTabItem' && item.id !== 'newFunctionItem';
      }).filter(item => {
        if (this.c.selectedTab === 1)
          return item.id !== 'breakpointItem';
        return item;
      });
  }

  handlerItems(itemId) {
    this.hideContextMenu();
    const item = {
      'copyItem': () => this.copy(),
      'wrapSubItemFunction': () => this.wrapFunctionBlock(),
      'wrapItem': () => {},
      'newFunctionItem': () => this.newFunction(),
      'editItem': () => this.edit(),
      'editFuncItem': () => this.editFunction(),
      'colorItem': () => this.color(),
      'newTabItem': () => this.openInNewTab(),
      'breakpointItem': () => this.openBreakpointItem(),
      'defaultItem': () => { }
    }
    return itemId ? item[itemId]() : item['defaultItem']();
  }

  copy() {
    if (this.typeMenu === 'edition') {
      this.c.copyPaste.copyFromEditionMenu(this.index);
    }
    this.c.ungrabedUi();
    this.c.updateCanvas();
  }

  openBreakpointItem() {
    if (this.index > 1) {
      if (this.c.program[this.index].isLocked || !this.c.program[this.index].hooks[0].occupied) return;
      this.c.program[this.index].addBreakpoint();
      this.c.processBreakpointFromTo(this.index, 'addBreakpointFromFlowToEditor');
      this.c.updateCanvas();
    }
  }

  wrapFunctionBlock() {
    if (this.typeMenu === 'edition') {
      this.openWrapFunctionEditionMode();
    } else {
      this.openWrapFunctionSelectionMode();
    }
  }

  edit() {
    this.c.markFlowchartAsSavedUnsaved(true);
    this.c.program[this.index].modal();
  }

  editFunction() {
    const { tabs, selectedTab } = this.c;
    let data = {};
    tabs[1].api.program['1'].blocks
      .forEach(block => {
         if(block.vars.tabId === tabs[selectedTab].id) {
           data = {
             id: block.id,
             values: block.vars
           }
         }
      });
    if(Utils.isEmpty(data)) return;
    this.c.loadTabByIndex(1);
    const index = this.c.program.findIndex(block => block.id === data.id);
    const multiForm = WrapFormFactory.getImplementation(this.c, data.values, 'edit', '[]', index, []);
    multiForm.showModal('Edit function');
  }
  
  color() {
    if(this.index > -1) {
      this.c.program[this.index].showColorModal();
      this.c.ungrabedUi();
      this.c.updateCanvas();
    }
  }
  
  newFunction() {
    this.c.updateTabsApiBeforeChange(); 
    const wizardForm = WrapFormFactory.getImplementation(this.c, null, 'new_empty', '[]', this.index, []);
    wizardForm.showModal('Create function');  
  }
  
  openInNewTab() {
    const tabId = this.c.program[this.index].tabId;
    const index = this.c.tabs.findIndex(tab => tab.id === tabId);
    if (index < 0) {
      Dialog.noticeDialog({ title: "Message", text: `cannot open tab, tab does not exist`, isExamSubmission: false });
      return;
    }
    this.c.tabs[this.c.selectedTab].selected = false;
    this.c.tabs[this.c.selectedTab].isOpened = true;
    this.c.tabs[index].isOpened = true;
    this.c.loadTabByIndex(index);
  }

  openWrapFunctionEditionMode() {
    const children = this.c.getChildren(this.c.program[this.index].id);
    if (!children.length) {
      Dialog.noticeDialog({ title: "Message", text: `you can wrap only two or more blocks`, isExamSubmission: false });
      return;
    }
    const copyPaste = new CopyPasteBlocks(this.c);
    copyPaste.copyFromEditionMenu(this.index);
    const wrappedBlocks = copyPaste.createWrapCopy();
    const multiForm = WrapFormFactory.getImplementation(this.c, null, 'wrap_block', wrappedBlocks, this.index, []);
    multiForm.showModal('Create function');
  }
  
  openWrapFunctionSelectionMode() {
    this.blocksInSelection = [];
    this.c.program.forEach(block => {
      const { x, y, id, type } = block;
      if (id !== this.c.startBlockId && id !== this.c.endBlockId) {
        if (this.blocksSelected.isPointInRectangle(x, y)) {
          const distance = this.blocksSelected.getDistance(x, y);
          this.blocksInSelection.push({
            id,
            type,
            distance
          });
        }
      }
    });
    this.blocksInSelection.sort((a, b) => a.distance > b.distance && 1 || -1);
    const idBlocks = this.blocksInSelection.map(blk => { return { id: blk.id, type: blk.type } });
    idBlocks.forEach(o => {
      if (['ifBlock', 'forBlock', 'whileBlock', 'doWhileBlock'].includes(o.type)) {
        this.traverseSelectedBlocks(this.blocksInSelection, o.id, 1);
      }
    });
    if (this.blocksInSelection.length < 2) {
      Dialog.noticeDialog({ title: "Message", text: `you can wrap only two or more blocks`, isExamSubmission: false });
      return;
    }
    const path = this.c.graph.breadthFirstSearch(this.blocksInSelection[0].id);
    const cleanPath = path.filter(p => this.blocksInSelection.map(o => o.id).includes(p));
    cleanPath.unshift(this.blocksInSelection[0].id);
    const copyPaste = new CopyPasteBlocks(this.c);
    copyPaste.copySelectedBlocks(cleanPath, this.c.program);
    const wrappedBlocks = copyPaste.createWrapCopy();
    const multiForm = WrapFormFactory.getImplementation(this.c, null, 'wrap_select', wrappedBlocks, this.index, this.blocksInSelection);
    multiForm.showModal('Create function');
  }
  
  traverseSelectedBlocks(innerBlocks, edgeId, from = 1) {
    const nodeEdges = this.c.graph.getNodeEdges(edgeId);
    for (let i = from; i < (nodeEdges && nodeEdges.length); i++) {
      if (nodeEdges[i]) {
        if (nodeEdges[i] === 'empty') continue;
        const index = this.c.program.findIndex(block => block.id === nodeEdges[i]);
        if (index <= -1) continue;
        const block = this.c.program[index];
        if (!innerBlocks.map(b => b.id).includes(block.id)) {
          innerBlocks.push({ id: block.id, type: block.type });
        }
        this.traverseSelectedBlocks(innerBlocks, block.id, 0);
      }
    }
    return;
  }
  
  getIcon(type) {
    switch (type) {
      case 'copyItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
          <path data-ctxmenu="copy" d="M11 0h-8c-0.553 0-1 0.447-1 1v12c0 0.552 0.447 1 1 1h5v2h2v-2h-1.999v-2h1.999v-2h-2v2h-4v-10h6v4h2v-5c0-0.552-0.447-1-1-1zM8 7v1h2v-2h-1c-0.553 0-1 0.447-1 1zM12 20h2v-2h-2v2zM12 8h2v-2h-2v2zM8 19c0 0.552 0.447 1 1 1h1v-2h-2v1zM17 6h-1v2h2v-1c0-0.552-0.447-1-1-1zM16 20h1c0.553 0 1-0.448 1-1v-1h-2v2zM16 12h2v-2h-2v2zM16 16h2v-2h-2v2z"></path>
          </svg>`;
      case 'wrapItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
          <path data-ctxmenu="wrap" d="M18.399 2h-16.799c-0.332 0-0.6 0.267-0.6 0.6v2.4h18v-2.4c0-0.333-0.27-0.6-0.601-0.6zM2 16.6c0 0.77 0.629 1.4 1.399 1.4h13.2c0.77 0 1.4-0.631 1.4-1.4v-10.6h-15.999v10.6zM7 8h6v2h-6v-2z"></path>
          </svg>`;
      case 'editItem':
      case 'editFuncItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
         <path d="M17.561 2.439c-1.442-1.443-2.525-1.227-2.525-1.227l-12.826 12.825-1.010 4.762 4.763-1.010 12.826-12.823c-0.001 0 0.216-1.083-1.228-2.527zM5.68 17.217l-1.624 0.35c-0.156-0.293-0.345-0.586-0.69-0.932s-0.639-0.533-0.932-0.691l0.35-1.623 0.47-0.469c0 0 0.883 0.018 1.881 1.016 0.997 0.996 1.016 1.881 1.016 1.881l-0.471 0.468z"></path>
         </svg>`;
      case 'colorItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
          <path d="M15.74 2.608c-3.528-1.186-7.066-0.961-10.72 1.274-2.853 1.743-4.718 6.076-4.103 9.182 0.728 3.671 4.351 5.995 9.243 4.651 5.275-1.449 6.549-4.546 6.379-5.334s-2.665-1.652-1.718-3.498c1.188-2.313 3.129-1.149 3.982-1.622 0.855-0.472 0.539-3.442-3.063-4.653zM12.094 13.314c-0.798 0.218-1.623-0.256-1.843-1.059-0.221-0.805 0.248-1.631 1.046-1.849s1.622 0.254 1.843 1.059c0.22 0.803-0.248 1.631-1.046 1.849z"></path>
          </svg>`;
      case 'wrapSubItemFunction':
      case 'newFunctionItem':  
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
           <path d="M5.719 14.75c-0.236 0-0.474-0.083-0.664-0.252l-5.060-4.498 5.341-4.748c0.412-0.365 1.044-0.33 1.411 0.083s0.33 1.045-0.083 1.412l-3.659 3.253 3.378 3.002c0.413 0.367 0.45 0.999 0.083 1.412-0.197 0.223-0.472 0.336-0.747 0.336zM14.664 14.748l5.341-4.748-5.060-4.498c-0.413-0.367-1.045-0.33-1.411 0.083s-0.33 1.045 0.083 1.412l3.378 3.003-3.659 3.252c-0.413 0.367-0.45 0.999-0.083 1.412 0.197 0.223 0.472 0.336 0.747 0.336 0.236 0 0.474-0.083 0.664-0.252zM9.986 16.165l2-12c0.091-0.545-0.277-1.060-0.822-1.151-0.547-0.092-1.061 0.277-1.15 0.822l-2 12c-0.091 0.545 0.277 1.060 0.822 1.151 0.056 0.009 0.11 0.013 0.165 0.013 0.48 0 0.904-0.347 0.985-0.835z"></path>
         </svg>`;
      case 'newTabItem':
        return `<svg class="icon-svg" style="fill:#000" data-ctxmenu="${type}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
             <path d="M6 2v24h24v-24h-24zM28 24h-20v-20h20v20zM4 28v-21l-2-2v25h25l-2-2h-21z"></path>
             <path d="M11 8l5 5-6 6 3 3 6-6 5 5v-13z"></path>
            </svg>`; 
      case 'breakpointItem':
        return `<svg  class="icon-svg" style="fill:#000" data-ctxmenu="${type}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M17 16a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4.01V4a1 1 0 0 1 1-1 1 1 0 0 1 1 1v6h1V2a1 1 0 0 1 1-1 1 1 0 0 1 1 1v8h1V1a1 1 0 1 1 2 0v9h1V2a1 1 0 0 1 1-1 1 1 0 0 1 1 1v13h1V9a1 1 0 0 1 1-1h1v8z"/>
                </svg>`;  
      default:
        break;
    }
  }

}