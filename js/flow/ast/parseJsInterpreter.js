class ParseJsInterpreter {
  constructor(visitor) {
    this.visitor = visitor
  }
  
  interpret(nodes) {
    nodes = nodes.filter(node => node.type === 'FunctionDeclaration');
    this.validateNodes(nodes);
    return this.visitor.run(nodes)
  }
  
  validateNodes(nodes) {
    if (nodes.length > 0) {
      const node = nodes[0];
      if (node.type !== 'FunctionDeclaration')
        throw new Error(`first line should be function main`);
      if (node.id.name !== 'main')
        throw new Error(`first function should be called main`);
    }
  }
  
  getEditorLocationRows() {
    return this.visitor.getEditorLocationRows();
  }
}