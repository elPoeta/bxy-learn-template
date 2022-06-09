class ReportBugFlow {
  constructor(canvas) {
     this.c = canvas;
  }

  show() {
    const div = document.createElement('div');
    div.setAttribute('id', 'reportBug');
    div.innerHTML = this.template();
    document.querySelector("body").insertBefore(div, document.querySelector("body").childNodes[0]);
    this.addListeners();
    return this;
  }

  template() {
    return (`
    <div class="moreOptions-overlay" style="height: 100%;">
      <span class="closeOverlay" id="closeReportForm">×</span>
      <section style="background:#fff;max-width:400px;height:400px;position:relative;top:45%;left:45%;transform:translate(-50%,-45%);padding: 20px;border: 4px solid #2181c7;">
      <div style="display:flex;">
        <h2 style="font-size:2em;font-weight:bold;color:#989797;">Report bug</h2>
        <svg class="icon-svg" style="fill:#060422a1;transform:rotate(-40deg);font-size:2.5em;position:absolute;top:12px;left:140px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M15.3 14.89l2.77 2.77a1 1 0 0 1 0 1.41 1 1 0 0 1-1.41 0l-2.59-2.58A5.99 5.99 0 0 1 11 18V9.04a1 1 0 0 0-2 0V18a5.98 5.98 0 0 1-3.07-1.51l-2.59 2.58a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41l2.77-2.77A5.95 5.95 0 0 1 4.07 13H1a1 1 0 1 1 0-2h3V8.41L.93 5.34a1 1 0 0 1 0-1.41 1 1 0 0 1 1.41 0l2.1 2.1h11.12l2.1-2.1a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41L16 8.41V11h3a1 1 0 1 1 0 2h-3.07c-.1.67-.32 1.31-.63 1.89zM15 5H5a5 5 0 1 1 10 0z"/></svg>
      </div>
      <form id="reportBugForm" style="margin:25px 0;">
        <textarea id="commentIssue" name="commentIssue" placeholder="Please, comment about issue." style="width: 400px;height: 260px;resize:none;overflow:auto;padding:3px;font-size:1.3em;" ></textarea>
        <p id="bugFormError" class="hide" style="margin-top:3px;color:red;text-align:center;font-size:1.2em;font-weight:bold;"></p>
        <div style="margin-top:20px;">
          <button id="sendReportButton" class="btn greenButtonFeed">Send</button>
        </div>  
      </form>
      </section> 
    </div>`);
  }

  addListeners() {
    this.overlay = document.querySelector('.moreOptions-overlay');
    this.close = document.querySelector('#closeReportForm');
    this.send = document.querySelector('#sendReportButton');
    this.close.addEventListener('click', this.closeForm.bind(this));
    this.overlay.addEventListener('click', this.closeOverlayClick.bind(this));
    this.send.addEventListener('click', this.sendHandler.bind(this));
  }

  sendHandler(ev) {
    ev.preventDefault();
    const comment = document.querySelector('#commentIssue').value;
    if(this.hasError(comment)) return;
    const flowErrorManager = new FlowErrorManager(this.c, 'user');
    flowErrorManager.executeCustom(comment);
    this.closeForm();
    this.c.log(`<div style='color: green; margin-top: 5px; margin-left: 5px;'>The report was sent</div>`, 'logFlowOutput');
  }

  hasError(comment) {
    if(Utils.isEmpty(comment)) {
      this.setErrorMessage(`Comment is empty`);
      return true;
    }  
    
    if(comment.length < 15) {
      this.setErrorMessage(`The comment must have at least 15 characters, actual: ${comment.length} `);
      return true;
    }
    
    return false;
  }
  
  setErrorMessage(message) {
    const pTag = document.querySelector('#bugFormError');
    pTag.innerText = message;
    pTag.classList.remove('hide');
    setTimeout(() => {
      pTag.classList.add('hide');
    },3000);
  }
  
  closeForm() {
    this.close.removeEventListener('click', this.closeForm.bind(this));
    this.overlay.removeEventListener('click', this.closeOverlayClick.bind(this));
    this.send.removeEventListener('click', this.sendHandler.bind(this));
    if (document.querySelector(".moreOptions-overlay")) {
      document.getElementById("reportBug").remove();
    }
  }

  closeOverlayClick(e) {
    if (e.target.classList == 'moreOptions-overlay') {
      this.closeForm();
    }
  }
}