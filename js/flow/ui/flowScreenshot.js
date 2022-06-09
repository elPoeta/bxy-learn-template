class Screenshot {
  constructor(canvas) {
    this.c = canvas;
    this.screenshotCanvas = document.createElement('canvas');
    this.context = this.screenshotCanvas.getContext('2d');
    this.isExpanded = canvas.expanded;
  }

  showForm() {
    if (this.c.scale === 1) {
      this.setScaleAndPosition(false).setupDimensions().expandBlocks().generateImage().saveImage();
      return this;
    }
    const div = document.createElement('div');
    div.setAttribute("id", "containerExportImage");
    div.innerHTML = this.template();
    document.querySelector('body').insertBefore(div, document.querySelector('body').childNodes[0]);
    this.addListener();
    return this;
  }

  template() {
    return (`
      <div class="moreOptions-overlay" style="height: 100%;">
      <span class="closeOverlay" id="closeExportImageForm">×</span>
      <section style="background:#fff;max-width:400px;height:150px;position:relative;top:45%;left:45%;transform:translate(-50%,-45%);padding: 20px;border: 4px solid #2181c7;">
      <div style="display:flex;">
        <h2 style="font-size:2em;font-weight:bold;color:#989797;">Export flowchart as JPEG</h2>
      </div>
      <div style="margin:25px 0;">
      <div id="radioExportGroup" style="display: flex;font-size: 1.4em;justify-content: space-around;">
        <div class="containerRadio" style="display:flex;">
         <label style="font-size: 1.1em;" for='originalRadio'>Original
           <input type="radio" id='originalRadio' name="exportRadio" value='original' checked> 
           <span class="checkmarkRadio" style="border: 0.5px solid #ababab;"></span>
         </label>
        </div>
        <div class="containerRadio" style="display:flex;">
         <label style="font-size: 1.1em;" for='scaledRadio'>Scaled
           <input type="radio" id='scaledRadio' name="exportRadio" value='scaled'> 
           <span class="checkmarkRadio" style="border: 0.5px solid #ababab;"></span>
         </label>
        </div>
        </div>
        <div style="margin-top:20px;">
          <button id="exportButton" class="btn greenButtonFeed">Export</button>
        </div>  
      </div>
      </section> 
    </div>`);
  }
  
  addListener() {
    this.closeExportImageForm = document.querySelector('#closeExportImageForm');
    this.exportButton = document.querySelector('#exportButton');
    this.closeExportImageForm.addEventListener('click', this.closeForm.bind(this));
    this.exportButton.addEventListener('click', this.exportHandler.bind(this));
  }

  exportHandler() {
    const radioValue = document.querySelector('input[name="exportRadio"]:checked').value;
    const value = radioValue === 'scaled';
    this.closeForm();
    this.setScaleAndPosition(value).setupDimensions().expandBlocks().generateImage().saveImage();
  }

  closeForm() {
    this.closeExportImageForm.removeEventListener('click', this.closeForm.bind(this));
    this.exportButton.removeEventListener('click', this.exportHandler.bind(this));
    if (document.querySelector(".moreOptions-overlay")) {
      document.getElementById("containerExportImage").remove();
    }
  }
  
  setScaleAndPosition(scaled) {
    if (scaled) return this;
    this.c.xScroll = 0;
    this.c.yScroll = 0;
    this.c.scale = 1;
    this.c.update();
    return this;
  }
  
  setupDimensions() {
    this.canvasWidth = this.c.canvas.width;
    this.canvasHeight = this.c.canvas.height;
    this.width = this.c.workSpaceWidth;
    this.height = this.c.workSpaceHeight;
    this.screenshotCanvas.width = this.width;
    this.screenshotCanvas.height = this.height;
    this.c.canvas.width = this.width;
    this.c.canvas.height = this.height;
    this.c.update();
    return this;
  }

  expandBlocks() {
    if (this.isExpanded) return this;
    this.c.expandShrinkBlocks();
    return this;
  }
  
  generateImage() {
    this.context.globalCompositeOperation = 'destination-over';
    const imageContentRaw = this.c.canvas.getContext('2d').getImageData(200, 0, this.width, this.height);
    this.context.putImageData(imageContentRaw, 0, 0);
    this.context.fillStyle = this.c.colors.background;
    this.context.fillRect(0, 0, this.screenshotCanvas.width, this.screenshotCanvas.height);
    return this;
  }

  saveImage() {
    this.screenshotCanvas.toBlob(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${this.c.flowchartName.toLowerCase()}_${this.c.tabs[this.c.selectedTab].name}_${new Date().toISOString()}.jpeg`;
      link.click();
      this.c.canvas.width = this.canvasWidth;
      this.c.canvas.height = this.canvasHeight;
      this.c.workSpaceWidth = this.canvasWidth
      this.c.workSpaceHeight = this.canvasHeight;
      flowChartEditor.resetFlowchartEditor();
      setTimeout(() => {
        flowChartEditor.resetFlowchartEditor(1);
        this.expandBlocks();
      }, 500);
      this.screenshotCanvas = null;
    }, 'image/jpeg', 1);
  }
}

