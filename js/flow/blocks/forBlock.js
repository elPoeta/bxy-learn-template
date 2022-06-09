class ForBlock extends LoopBlock {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.r = -10;
    this.forScope = new BlockState();
    //this.setDroppedElementsBase();
  }
  
  setDroppedElementsBase() {
    if (!this.isProgram) return;
    if (this.droppedElements.length > 0) return;
    const items = this.getForWizardItems();
    const variableItem = items.filter(item => item.name === 'variable')[0];
    const numberItem = items.filter(item => item.name === 'number')[0];
    const assignItem = items.filter(item => item.name === 'assign')[0];
    const additionItem = items.filter(item => item.name === 'addition')[0];
    const lessThanItem = items.filter(item => item.name === 'less-than')[0];
    const extraProps = {
      name: "EDIT_ME",
      value: "0",
      declaration: "int",
      declarationType: "Normal",
      scope: "For scope",
      isInFlow: true
    }
    const compareItem = { ...numberItem, userValue: 10 };
    const varItemWithProps = { ...variableItem, ...{ extraProps } }
    this.droppedElements = [[variableItem, assignItem, numberItem],
    [varItemWithProps, lessThanItem, compareItem],
    [varItemWithProps, additionItem, additionItem]];
  }
 
  getForWizardItems() {
    const wizardItems = !this.c.wizardItems.length ? WizardItems.getDefaultItems() : this.c.wizardItems[0].items;
    const items = [];
    wizardItems.forEach(item => {
      item.items.forEach(subItem => {
        if (['variable', 'number', 'assign', 'addition', 'less-than'].includes(subItem.name)) {
          const { type, name, displayValue, value, color, pos, userValue } = subItem;
          items.push({ type, name, displayValue, value, color, pos, userValue: name === 'variable' ? 'EDIT_ME' : userValue });
        }
      });
    });
    return items;
  }
  
}