class ContextMenuBase {
  constructor(canvas, items) {
    this.c = canvas;
    this.body = document.querySelector("body");
    this.menuItems = items;
  }

  template() {
    return (
      ` <ul id='contextMenu' class="canvasContextMenu canvasContextMenu-show">
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
    </ul>`);
  }

  show(ev, props) {
    const { x, y, selection } = props;
    this.coords = { x, y };
    this.blocksSelected = selection;
    const div = document.createElement("div");
    div.setAttribute("id", "containerMenuContext");
    div.innerHTML = this.template();
    this.body.insertBefore(div, this.body.childNodes[0]);
    this.addMenuListener(ev);
    return this;
  }

  addMenuListener(ev) {
    this.menu = document.querySelector('#contextMenu');
    this.menu.style.top = `${ev.clientY - 30}px`;
    this.menu.style.left = `${ev.clientX - 80}px`;
    this.menu.addEventListener('click', this.handlerMenu.bind(this));
    this.menu.addEventListener('mouseleave', this.hideContextMenu.bind(this));
  }

  handlerMenu(ev) {
    ev.preventDefault();
    const itemId = ev.target.getAttribute('data-ctxmenu');
    this.handlerItems(itemId);
  }

  hideContextMenu() {
    this.menu.removeEventListener('click', this.handlerMenu.bind(this));
    this.menu.removeEventListener('mouseleave', this.hideContextMenu.bind(this));
    this.body.removeChild(document.querySelector("body").childNodes[0]);
    this.c.eventHandler.isEditing = false;
    this.c.ungrabedUi();
  }

}