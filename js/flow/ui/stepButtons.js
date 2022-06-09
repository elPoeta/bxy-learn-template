class StepButton {
  constructor(type, nextTitle) {
    this.type = type;
    this.nextTitle = nextTitle;
  }

  render() {
    const div = document.createElement('div');
    div.setAttribute('id', 'stepByStep-btnContainer');
    div.innerHTML = this.getStepByStepButtons();
    document.querySelector('body').appendChild(div);
    return this;
  }

  getStepByStepButtons() {
    return `<button id="stepBtnRun" class="step-btn step-grow-btn">
              <div class="step-btn-icon">
                ${this.getIcon(this.type)}
              </div>
              <div class="step-btn-txt" style="color:green;">${this.nextTitle}</div>
            </button>
            <button id="stepBtnStop" class="step-btn step-grow-btn">  
              <div class="step-btn-icon">
                ${this.getIcon('stopBtn')}
              </div>
              <div class="step-btn-txt" style="color:red;">Stop</div>
            </button>`;
  }

  getIcon(type) {
    switch (type) {
      case 'stepBtn':
        return `<svg class="icon-svg" style="fill:green; font-size: 2em;"  version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        width="515.458px" height="515.458px" viewBox="0 0 515.458 515.458" style="enable-background:new 0 0 515.458 515.458;"
        xml:space="preserve">
        <g>
        <path d="M298.794,386.711c27.805,9.522,52.357,15.587,87.633,26.427C372.875,584.374,210.952,516.371,298.794,386.711z
          M443.366,229.409c-1.826-51.415-10.882-118.86-83.017-108.292c-33.815,8.825-58.8,45.962-70.551,110.035
         c-6.454,35.229-2.701,84.678,4.912,114.32c6.951,20.889,4.587,19.605,12.058,23.572c28.916,6.514,57.542,13.725,86.693,21.078
         C423.075,369.209,447.397,258.182,443.366,229.409z M220.752,225.463c7.607-29.646,11.36-79.095,4.909-114.32
         C213.919,47.067,188.931,9.924,155.11,1.105C82.975-9.463,73.919,57.981,72.093,109.399
         c-4.031,28.768,20.294,139.802,49.911,160.711c29.149-7.353,57.771-14.558,86.696-21.078
         C216.162,245.069,213.798,246.352,220.752,225.463z M129.029,293.132c13.547,171.234,175.47,103.231,87.63-26.427
         C188.854,276.228,164.304,282.292,129.029,293.132z"/>
        </g>
        </svg>`;
      case 'breakBtn':
        return `<svg  class="icon-svg" style="fill:green; font-size: 2em;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M17 16a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4.01V4a1 1 0 0 1 1-1 1 1 0 0 1 1 1v6h1V2a1 1 0 0 1 1-1 1 1 0 0 1 1 1v8h1V1a1 1 0 1 1 2 0v9h1V2a1 1 0 0 1 1-1 1 1 0 0 1 1 1v13h1V9a1 1 0 0 1 1-1h1v8z"/>
                </svg>`;
      case 'stopBtn':
        return `<svg class="icon-svg" style="fill:red; font-size: 2em;"  version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
           <path d="M6 6h12v12h-12v-12z"></path>
           </svg>`;
      default:
        return ``;
    }
  }

}