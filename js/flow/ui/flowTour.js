class Tour {
  constructor(canvas) {
    this.c = canvas;
    this.steps = [{ method: 'renderWelcome', title: 'Welcome!', description: '<p>Welcome to the quick tour of the Browxy flowchart.</p><p>You can build Java/Javascript flows.</p><p>Run, Debug, and more...</p><p>Click next to continue tour or close to start.</p>' },
      { method: 'renderPalette', title: 'Block Palette', description: '<p>Drag block to workspace.</p><p>Drag the palette vertically to reveal hidden blocks</p>' },
      { method: 'renderWorkspace', title: 'Workspace', description: '<p>Drop blocks to build your flowchart</p>' },
      { method: 'renderDropBlock', title: 'Drop Block', description: '<p>Drop block when tap down arrow</p>' },
      { method: 'renderBlockSetup', title: 'Setup Block', description: '<p>Right click inside the block to display the context menu</p><p>Or click the cogwheel to display the context menu</p>' },
      { method: 'renderWorkspaceContextMenu', title: 'Workspace', description: '<p>Right click on the workspace to show the contextual menu</p><p>Roll the mouse wheel to zoom in/out</p>' },
      { method: 'renderBlockDelete', title: 'Delete Block', description: '<p>Drag the block from the workspace and drop it on the palette to remove it</p>' },
      { method: 'renderFinish', title: 'Finish!', description: '<p>Click close to start.</p><p>Have fun coding!!</p><p style="text-align:right;font-weight:bold;font-style:italic;color:#1B3F91">Browxy team.</p>' }];
    this.currentStep = 0;
    this.color = { line: 'rgb(255, 0, 0)', ligth: 'rgba(255, 255, 255, 0)', dark: 'rgba(0, 0, 0, 0.5)' };
    this.popoverTour = document.createElement('div');
    this.popoverTour.id = 'tour-popover-item';
  }

  renderByStep() {
    const { method } = this.steps[this.currentStep];
    this[method]();
  }
  
  renderWelcome() {
    this.canvasStyle();
    this.renderSquare(0, 0, this.c.canvas.width, this.c.canvas.height, 0, 0, this.c.canvas.width, this.c.canvas.height, false);
  }

  renderPalette() {
    this.updatePopoverContent(`display: block; left: 210px; top: ${this.getCanvasDimension().height / 2}px`, 'tour-popover-position-center tour-popover-left');
    this.renderSquare(0, 0, 200, this.c.canvas.height, 200, 0, this.c.canvas.width, this.c.canvas.height, true);
  }
  
  renderWorkspace() {
    this.updatePopoverContent(`display: block; left: ${(this.getCanvasDimension().width - 125) / 2}px; top: 0px`, 'tour-popover-bottom');
    this.renderSquare(200, 0, this.c.canvas.width - 200, this.c.canvas.height, 0, 0, 200, this.c.canvas.height, true);
  }
  

  renderDropBlock() {
    this.removeBlockFromWorkspace();
    this.updatePopoverContent(`display: block; left:${(this.getCanvasDimension().width / 2) - 300}px; top: 210px`, 'tour-popover-right');
    this.renderComplexSquare(250, 210.3);
  }
  
  renderBlockSetup() {
    this.addBlockToWorkspace();
    this.c.program[2].code = '';
    this.updatePopoverContent(`display: block; left:${(this.getCanvasDimension().width / 2) + 230}px; top: 255px`, 'tour-popover-left');
    this.renderComplexSquare(360, 210.3);

  }
  
  renderWorkspaceContextMenu() {
    this.c.program[2].code = 'System.out.println("Browxy")';
    this.updatePopoverContent(`display: block; left: ${(this.getCanvasDimension().width - 300) / 2}px; top: ${(this.getCanvasDimension().height / 2) + 80}px`, 'tour-popover-bottom');
    this.renderSquare(200, 0, this.c.canvas.width - 200, this.c.canvas.height, 0, 0, 200, this.c.canvas.height, true);
  }
  
  renderBlockDelete() {
    this.renderPalette();
  }
  
  renderFinish() {
    this.renderWelcome();
  }
  
  renderSquare(xd, yd, wd, hd, xh, yh, wh, hh, isDark) {
    this.c.ctx.save();
    this.c.ctx.beginPath();
    this.c.ctx.lineWidth = 5;
    this.c.ctx.strokeStyle = this.color.line;
    this.c.ctx.fillStyle = this.color.ligth;
    this.c.ctx.fillRect(xd, yd, wd, this.c.canvas.height);
    this.c.ctx.strokeRect(xd, yd, wd, hd);
    if (isDark) this.c.ctx.fillStyle = this.color.dark;
    this.c.ctx.fillRect(xh, yh, wh, hh);
    this.c.ctx.closePath();
    this.c.ctx.restore();
  }
  
  renderComplexSquare(a, b) {
    this.c.ctx.save();
    this.c.ctx.beginPath();
    this.c.ctx.fillStyle = this.color.dark;
    this.c.ctx.fillRect(0, 0, this.c.canvas.width / 2, this.c.canvas.height);
    this.c.ctx.fillRect((this.c.canvas.width + 420) / 2, 0, this.c.canvas.width, this.c.canvas.height);
    this.c.ctx.fillRect((this.c.canvas.width / 2)-0.15, a, b, this.c.canvas.height);
    this.c.ctx.lineWidth = 3;
    this.c.ctx.strokeStyle = this.color.line;
    this.c.ctx.strokeRect(this.c.canvas.width / 2, 0, b, a);
    this.c.ctx.closePath();
    this.c.ctx.restore();
  }
  
  addBlockToWorkspace() {
    if (this.c.program.length > 2) return;
    this.c.program.push(BlockFactory.getImplementation(flowChartEditor.uuid(), this.c, 'outputBlock', 0, 0, 120, 60, '', true, this.c.languageOutput, ''));
    this.c.program[2].x = this.c.eventHandler.setXOnDrop(this.c.program[2], this.c.program[0], 'out');
    this.c.interceptedProgram = { programRing: this.c.program[2], programHook: this.c.program[0], arrowType: 'out' };
    this.c.eventHandler.dropInterceptedProgram();
  }

  removeBlockFromWorkspace() {
    if (this.c.program.length > 2) {
      this.c.eventHandler.removeBlockFromGraph(this.c.program[2], 2);
      this.c.program[1].y = 150;
      this.c.program[1].hooks[0].y = 150;
    }
  }
  
  canvasStyle() {
    this.createOverlay();
    this.c.canvas.style.zIndex = "2000";
    this.c.canvas.style.position = "relative";
  }
  
  createOverlay() {
    if (document.querySelector('#tourOverlay')) {
      if (!document.querySelector('#tour-popover-item')) return;
      this.updatePopoverContent(`display: block; left: 250px; top: ${this.c.canvas.getBoundingClientRect().top + 45}px`, 'tour-popover-bottom');

    } else {
       const div = document.createElement('div');
       div.id = 'tourOverlay'
       div.className = 'overlay';
       document.querySelector('body').appendChild(div);
       setTimeout(() => {
        this.popoverTour.innerHTML = this.popoverTemplate({ classNameTip: 'tour-popover-bottom' });
        this.popoverTour.style = `display: block; left: 250px; top: ${this.c.canvas.getBoundingClientRect().top + 45}px`;
        document.querySelector('body').appendChild(this.popoverTour);
        this.addPopoverListeners();
      }, 10);
    }
  }
  
  popoverTemplate({ classNameTip }) {
    return (`
      <div id="tour-popover-content">${this.popoverContentTemplate(classNameTip)}</div>
      <div class="tour-clearfix tour-popover-footer" style="display: block;">
        <button id="tour-close-btn" class="tour-close-btn">Close</button>
        <span class="tour-btn-group tour-navigation-btns">
          <button id="tour-prev-btn" class="tour-prev-btn tour-disabled" style="display: inline-block;">← Previous</button>
          <button id="tour-next-btn" class="tour-next-btn" style="display: inline-block;">Next →</button>
        </span>
      </div>`);
  }

  popoverContentTemplate(classNameTip) {
    const { title, description } = this.steps[this.currentStep];
    return (`
      <div class="tour-popover-tip ${classNameTip}"></div>
      <div class="tour-popover-title">${title}</div>
      <div class="tour-popover-description">${description}</div>`);
  }

  updatePopoverContent(popoverStyle, classNameTip) {
    document.querySelector('#tour-popover-item').style = popoverStyle;
    document.querySelector('#tour-popover-content').innerHTML = this.popoverContentTemplate(classNameTip);
  }

  getCanvasDimension() {
    const { width, height } = this.c.canvas.getBoundingClientRect();
    return { width, height }
  }
  
  addPopoverListeners() {
    this.footer = document.querySelector('.tour-popover-footer');
    this.closeBtn = document.querySelector('#tour-close-btn');
    this.prevBtn = document.querySelector('#tour-prev-btn');
    this.nextBtn = document.querySelector('#tour-next-btn');
    this.footer.addEventListener('click', this.buttonsHandler.bind(this));
  }
  
  buttonsHandler(ev) {
    if (ev.target.tagName.toLowerCase() === 'button') {
      switch (ev.target.id) {
        case 'tour-close-btn':
          this.closeTour();
          break;
        case 'tour-prev-btn':
          this.previus();
          break;
        case 'tour-next-btn':
          this.next();
          break;
        default:
          break;
      }
    }
  }
  
  previus() {
    this.currentStep--;
    if(this.currentStep < 1) {
      this.currentStep = 0;
      this.prevBtn.classList.add('tour-disabled');  
    }
    this.renderByStep();
    this.nextBtn.classList.remove('tour-disabled');
    this.c.update();  
  }

  next() {
    this.currentStep++;
    if(this.currentStep > this.steps.length - 1) {
      this.currentStep = this.steps.length - 1;
      return;
    }
    if (this.currentStep === this.steps.length - 1)
      this.nextBtn.classList.add('tour-disabled');
    this.renderByStep();
    this.prevBtn.classList.remove('tour-disabled');
    this.c.update();
  }

  closeTour() {
    this.c.canvas.style.removeProperty("position");
    this.c.canvas.style.removeProperty("z-index");
    document.querySelector('#tour-popover-item').remove();
    document.querySelector('#tourOverlay').remove();
    this.c.activeTour = false;
    this.footer.removeEventListener('click', this.buttonsHandler.bind(this));
    flowChartEditor.resetFlowProps();
    this.c.paletteManager.setReadyToRender(true); 
    this.c.update();
  }
}