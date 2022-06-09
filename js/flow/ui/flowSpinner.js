class FlowSpinner {

  static mount() {
    if (document.querySelector('#flowSpinner')) return;
    const div = document.createElement('div');
    div.setAttribute('id', 'flowSpinner');
    const style = `position: absolute; top: 0; height: 100vh; width: 100vw; background: transparent; z-index: 5000;`;
    div.setAttribute('style', style);
    div.innerHTML = `<div class="progress-flow-spinner"></div>`;
    document.querySelector('body').appendChild(div);
  }

  static unMount() {
    if (document.querySelector('#flowSpinner'))
      document.querySelector('#flowSpinner').remove();
  }
}