class WrapFunctionDeclarationJava extends WrapFunctionDeclaration {
  constructor(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput) {
    super(id, canvas, x, y, w, h, type, code, scaleFactor, isProgram, languageOutput);
    this.returnFunctionType = 'void';
    this.returnType = 'Normal';
    this.reservedWords = ['scanner', 'Class', 'new', 'String', 'char', 'byte', 'short', 'int', 'long', 'float', 'double', 'boolean', 'void'];
  }
  
  modal() {
    const values = {
      tabId: this.tabId,
      functionName: this.functionName,
      returnFunctionType: this.returnFunctionType,
      returnType: this.returnType,
      params: this.params,
      lineColor: this.lineColor,
      bgColor: this.bgColor,
      fontColor: this.fontColor,
    }
    const index = this.c.program.findIndex(block => block.id === this.id);
    const multiForm = WrapFormFactory.getImplementation(this.c, values, 'edit', '[]', index, []);
    multiForm.showModal('function');
  }
  
}