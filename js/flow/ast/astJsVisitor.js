class AstJsVisitor {
  constructor() {
    this.init();
  }

  init() {
    this.codeParsed = {
      '0': [],
      '1': []
    };
    this.tabId = null;
    this.tabType = "main";
    this.hookStack = new Stack();
    this.wrapCallingBlocks = [];
    this.editorLocationRows = {};
  }
  
  setTabId() {
    this.tabId = this.tabId === null ? "0"
      : this.tabId === "0" ? "2" : (Number(this.tabId) + 1).toString();
    this.setTabType(this.tabId === "0" ? "main" : "f_body");
  }

  setTabType(tabType) {
    this.tabType = tabType;
  }
  
  setDefaultHooks() {
    this.currentHook = 'out';
    this.previusId = 'start-id';
  }

  fixCurrentHook() {
    const hook = (this.currentHook === 'inner-out-yes'
      || this.currentHook === 'inner-out-no')
      ? "bottom-" + this.currentHook
      : (this.currentHook === 'bottom-inner-out-yes'
        || this.currentHook === 'bottom-inner-out-no') ? this.currentHook
        : "out";
    this.currentHook = hook;
  }

  popHook() {
    const hook = (this.hookStack.peek() === 'inner-out-yes'
      || this.hookStack.peek() === 'inner-out-no') ? "bottom-" + this.hookStack.pop()
      : this.hookStack.pop();
    this.currentHook = hook;
  }
  
  addNewBlock(block) {
    if (this.codeParsed[this.tabId] === undefined) this.codeParsed[this.tabId] = [];
    this.codeParsed[this.tabId].push(block);
  }
  
  addWrappedBlockToList(name) {
    const pos = this.codeParsed[this.tabId].length - 1;
    this.wrapCallingBlocks.push({ tabId: this.tabId, pos, name });
  }
  
  setWrapTabId() {
    this.wrapCallingBlocks.forEach(callingBlocks => {
      let id = -1;
      for (const [key, value] of Object.entries(this.codeParsed)) {
        if (value.length > 0 && value[0].typeBlock === 'wrapBlock') {
          const wrapBlock = value[0];
          if (wrapBlock.functionName === callingBlocks.name) {
            id = wrapBlock.tabId;
          }
        }
      }
      this.codeParsed[callingBlocks.tabId][callingBlocks.pos].tabId = id;
    });
  }
  
  getEditorLocationRows() {
    return this.editorLocationRows;
  }
  
  run(nodes) {
    return this.visitNodes(nodes);
  }

  visitNodes(nodes) {
    for (const node of nodes) {
      this.visitNode(node);
    }
  }
  
  visitNode(node) {
    switch (node.type) {
      case 'FunctionDeclaration':
        return this.visitFunctionDeclaration(node);
      case 'BlockStatement':
        return this.visitBlockStatement(node);  
      case 'VariableDeclaration':
        return this.visitVariableDeclaration(node);
      case 'VariableDeclarator':
        return this.visitVariableDeclarator(node);  
      case 'ExpressionStatement':
        return this.visitExpressionStatement(node);
      case "CallExpression":
        return this.visitCallExpression(node);
      case 'Literal':
        return this.visitLiteral(node);
      case 'Identifier':
        return this.visitIdentifier(node);
      case 'BinaryExpression':
      case 'LogicalExpression':  
        return this.visitBinaryExpression(node); 
      case 'UnaryExpression':
        return this.visitUnaryExpression(node);
      case 'UpdateExpression':
        return this.visitUpdateExpression(node);    
      case 'MemberExpression':
        return this.visitMemberExpression(node);   
      case 'AssignmentExpression':
        return this.visitAssignmentExpression(node);
      case 'WhileStatement':
      case 'DoWhileStatement':  
        return this.visitLoopWhileStatement(node);  
      case 'ForStatement':
        return this.visitForStatement(node);  
      case 'IfStatement':
        return this.visitIfStatement(node);  
      case 'ConditionalExpression':
        return this.visitConditionalExpression(node);  
      case 'ReturnStatement':
        return this.visitReturnStatement(node);
      case 'BreakStatement':
        return this.visitBreakStatement(node);  
      case 'ParenthesizedExpression':
        return this.visitParenthesizedExpression(node);  
      default:
        throw new Error(`Expression node: \n ${JSON.stringify(node, null, 2)}\n was not captured`); 
    } 
  }
  
  visitFunctionDeclaration(node) {
    this.setTabId();
    this.setDefaultHooks();
    const name = node.id.name;
    const paramIdentifier = node.params.map(param => param.name).join(', ');
    this.addNewBlock(this.getWrapBlockProps('none', { tabType: 'f_repo', wrapType: 'function_declaration', functionName: name, params: this.getParams(node.params), code: `${name}(${paramIdentifier})`, previus: 'none', hook: 'out' }));
    this.visitNode(node.body);
  }
  
  visitBlockStatement(node) {
    for(const child of node.body) {
      this.visitNode(child);
    }
  }

  visitVariableDeclaration(node) {
    return this.visitNodes(node.declarations);
  }

  visitVariableDeclarator(node) {
    const id = flowChartEditor.uuid();
    if (!node.init) {
      this.addNewBlock(this.getDefineBlockProps(id, { name: node.id.name, value: node.init, decType: 'Normal', kind: 'var' }));
    } else if (node.init.type === 'CallExpression') {
      if (['GET', 'prompt', 'parseInt', 'parseFloat'].includes(node.init.callee.name)) {
        const _arguments = this.evalArgs(node.init.arguments);
        const declaration = node.init.callee.name === 'parseInt' ? 'int' : node.init.callee.name === 'parseFloat' ? 'float' : 'String';
        this.addNewBlock(this.getInputBlockProps(id, { kind: 'var', name: node.id.name, arguments: _arguments.join(''), value: node.init, declaration }));    
      } else {
         const name = this.visitNode(node.init.callee);
         const _arguments = this.evalArgs(node.init.arguments);
         const value = `${name}(${_arguments.join(',')})`;
         this.addNewBlock(this.getDefineBlockProps(id, { name: node.id.name, value, decType: 'Normal', kind: 'var' }));
      }
    } else if (node.init.type === 'Literal') {
        this.addNewBlock(this.getDefineBlockProps(id, { name: node.id.name, value: node.init.raw, decType: 'Normal', kind: 'var' }));
    } else if (node.init.type === 'ArrayExpression') {
        const decType = this.getArrayLevel(node.init);
        const elements = this.evalArrayElements(node.init.elements, decType);
        this.addNewBlock(this.getDefineBlockProps(id, { name: node.id.name, value: elements, decType, kind: 'var' }));
    } else if (['BinaryExpression', 'LogicalExpression', 'Identifier', 'UnaryExpression', 'ConditionalExpression', 'ParenthesizedExpression'].includes(node.init.type)) {
        const value = this.visitNode(node.init);
        this.addNewBlock(this.getDefineBlockProps(id, { name: node.id.name, value, decType: 'Normal', kind: 'var' }));
    } else if (node.init.type === 'NewExpression') {
      const newVal = `new ${node.init.callee.name}(${node.init.arguments[0].value})`;
      this.addNewBlock(this.getDefineBlockProps(id, { name: node.id.name, value: newVal, decType: 'Array', kind: 'var' }));
    } else {
        throw new Error(`Expression variable declarator: \n ${JSON.stringify(node, null, 2)}\n was not captured`);
    }
    this.previusId = id;
    this.fixCurrentHook();
  }
  
  visitExpressionStatement(node) {
    this.visitNode(node.expression);
  }
  
  visitCallExpression(node) {
    const id = flowChartEditor.uuid();
    const exprName = node.callee.name;
    let _arguments;
    switch (exprName) {
      case 'main':
        break;
      case 'PRINTLN':  
      case 'PRINT':
      case 'alert':
        _arguments = this.evalArgs(node.arguments);
        const radioOption = exprName !== 'PRINT' ? 'println' : 'print'
        this.addNewBlock(this.getOutputBlockProps(id, { args: _arguments, radioOption }));
        break;
      case 'highlightBlock':
        const blockId = node.arguments[0].value;
        const countHighlightLines = parseInt(node.arguments[2].value);
        const tabIndex = parseInt(node.arguments[1].value);
        const location = node.loc.start.line;
        const row = location - countHighlightLines;
        this.editorLocationRows[node.arguments[0].value] = { id: blockId, tabIndex, countHighlightLines, location, row };
        break;  
      default:
        _arguments = this.evalArgs(node.arguments);
        const code = `${exprName}(${_arguments.join(',')})`;
        if (this.isEvalWrappedBlock) {
          this.isEvalWrappedBlock = false;
          return code;
        }
        this.addNewBlock(this.getWrapBlockProps(id, { wrapType: 'function_calling', functionName: exprName, params: this.getParams(_arguments), code, tabType: 'f_body', previus: this.previusId, hook: this.currentHook }));
        this.addWrappedBlockToList(exprName);
        break;
    }
    this.isEvalWrappedBlock = false;
    if(exprName !== 'main') {
      this.previusId = id;
      this.fixCurrentHook();
    }
  }
  
  visitBinaryExpression(node) {
    let leftNode;
    let rightNode;
    const operator = node.operator;
    if (node.left.type === 'CallExpression') {
      const _arguments = this.evalArgs(node.left.arguments);
      leftNode = `${node.left.callee.name}(${_arguments.join(',')})`;
    } else {
      leftNode = this.visitNode(node.left);
    }
    if (node.right.type === 'CallExpression') {
      const _arguments = this.evalArgs(node.right.arguments);
      rightNode = `${node.right.callee.name}(${_arguments.join(',')})`;
    } else {
      rightNode = this.visitNode(node.right);
    }
    return `${leftNode} ${operator} ${rightNode}`;
  }
  
  visitLiteral(node) {
    return typeof node.value === 'string' ? node.raw : node.value;
  }
  
  visitIdentifier(node) {
    return node.name;
  }
  
  visitUnaryExpression(node) {
    const arg = this.visitNode(node.argument);
    return node.prefix ? `${node.operator}${arg}` : `${arg}{operator}`;
  }
  
  visitParenthesizedExpression(node) {
    const expression = this.visitNode(node.expression);
    return `(${expression})`;
  }

  visitMemberExpression(node) {
    const leftNode = this.visitNode(node.object);
    const property = this.visitNode(node.property);
    return `${leftNode}${node.computed ? `[${property}]` : `.${property}`}`;
  }
  
  visitUpdateExpression(node) {
    const id = flowChartEditor.uuid();
    const { prefix, operator, argument } = node;
    const code = prefix ? `${operator}${argument.name}` : `${argument.name}${operator}`;
    this.addNewBlock(this.getBlockProps(id, { code, typeBlock: 'codeBlock' }));
    this.previusId = id;
    this.fixCurrentHook();
  }
  
  visitConditionalExpression(node) {
    const test = this.visitNode(node.test);
    const consequent = this.visitNode(node.consequent);
    const alternate = this.visitNode(node.alternate);
    return `${test} ? ${consequent} : ${alternate}`;
  }
  
  visitAssignmentExpression(node) {
    const id = flowChartEditor.uuid();
    const leftNode = this.visitNode(node.left);
    const operator = node.operator;
    switch (node.right.type) {
      case 'Literal':
      case 'Identifier':  
      case 'UnaryExpression':  
        if (operator === '=') {
          if (node.left.type !== 'MemberExpression') {
            const rightNode = this.visitNode(node.right);
            this.addNewBlock(this.getDefineBlockProps(id, { name: leftNode, value: rightNode, decType: 'Normal', kind: null }));
          } else {
              const rightNode = this.visitNode(node.right);
              const codeMember = `${leftNode} = ${rightNode}`;
              this.addNewBlock(this.getBlockProps(id, { code: codeMember, typeBlock: 'codeBlock' }));
          }        
         } else {
          const rn = this.visitNode(node.right);
          const opBlkCode = `${leftNode} ${operator} ${rn}`
          this.addNewBlock(this.getBlockProps(id, { code: opBlkCode, typeBlock: 'codeBlock' }));
        }
        break;
      case 'ArrayExpression':
        const decType = this.getArrayLevel(node.right);
        const elements = this.evalArrayElements(node.right.elements, decType);
        this.addNewBlock(this.getDefineBlockProps(id, { name: leftNode, value: elements, decType, kind: null }));
        break;
      case 'CallExpression':
        if (['GET', 'prompt', 'parseInt', 'parseFloat'].includes(node.right.callee.name)) {
          const _argumentsCall = this.evalArgs(node.right.arguments);
          const declaration = node.right.callee.name === 'parseInt' ? 'int' : node.right.callee.name === 'parseFloat' ? 'float' : 'String';
          this.addNewBlock(this.getInputBlockProps(id, { kind: null, name: leftNode, arguments: _argumentsCall.join(''), value: node.right.arguments[0].value, declaration }));
        } else if (['PRINT', 'PRINTLN', 'alert'].includes(node.right.callee.name)) {
          throw new Error(`Expression Call Assign:\n ${JSON.stringify(node, null, 2)}\n`);
        } else if (node.right.callee.type === 'MemberExpression') {
           const valR = this.visitNode(node.right.callee);
           const _argumentsM = this.evalArgs(node.right.arguments);
           const codeMember = `${leftNode} ${operator} ${valR}(${_argumentsM.join(',')})`;
           this.addNewBlock(this.getBlockProps(id, { code: codeMember, typeBlock: 'codeBlock' }));
        } else {
           const name = node.right.callee.name;
           const _arguments = this.evalArgs(node.right.arguments);
           const code = `${leftNode} ${operator} ${name}(${_arguments.join(',')})`;
           this.addNewBlock(this.getWrapBlockProps(id, { wrapType: 'function_calling', functionName: name, params: this.getParams(_arguments), code, tabType: 'f_body', previus: this.previusId, hook: this.currentHook }));
           this.addWrappedBlockToList(name);
        }
        break;
      case 'BinaryExpression':
      case 'LogicalExpression':
      case 'ConditionalExpression':
      case 'ParenthesizedExpression':
      case 'MemberExpression':
        const exp = this.visitNode(node.right);
        const blockCode = `${leftNode} ${operator} ${exp}`
        this.addNewBlock(this.getBlockProps(id, { code: blockCode, typeBlock: 'codeBlock' }));
        break;  
      case 'NewExpression':
        const codeNew = `${leftNode} ${operator} new ${node.right.callee.name}(${node.right.arguments[0].value})`;
        this.addNewBlock(this.getBlockProps(id, { code: codeNew, typeBlock: 'codeBlock' }));
        break; 
      default:
        throw new Error(`Expression Assign: \n ${JSON.stringify(node, null, 2)}\n was not captured`);
    }
    this.previusId = id;
    this.fixCurrentHook();
  }
  
  visitLoopWhileStatement(node) {
    const id = flowChartEditor.uuid();
    const typeBlock = node.type === 'WhileStatement' ? 'whileBlock' : 'doWhileBlock';
    const test = this.visitNode(node.test);
    const block = this.getBlockProps(id, { code: test, typeBlock });
    this.addNewBlock(block);
    this.previusId = id;
    this.hookStack.push(this.currentHook);
    this.currentHook = 'inner-out-yes';
    this.visitNode(node.body);
    this.previusId = block.id;
    this.popHook();
  }
  
  visitForStatement(node) {
    const id = flowChartEditor.uuid();
    const kind = node.init.kind;
    const name = node.init.declarations[0].id.name;
    const value = this.visitNode(node.init.declarations[0].init);
    const leftNode = this.visitNode(node.test.left);
    const operator = node.test.operator;
    const rightNode = this.visitNode(node.test.right);
    const update =  node.update.type === 'UpdateExpression' ? 
      `${node.update.argument.name}${node.update.operator}` :
       this.updateExpressionFor(node.update);
    const code = `${kind} ${name} = ${value}; ${leftNode} ${operator} ${rightNode}; ${update}`;
    const forBlock = this.getForBlockProps(id, { code, name, value, radioVar: kind ? 'defineVar' : 'selectVar', radioOption: operator, variableCompareValue: rightNode, update });
    this.addNewBlock(forBlock);
    this.previusId = id;
    this.hookStack.push(this.currentHook);
    this.currentHook = 'inner-out-yes';
    this.visitNode(node.body)
    this.previusId = forBlock.id;
    this.popHook();
  }
  
  updateExpressionFor(node) {
    const leftNode = this.visitNode(node.left);
	const operator = node.operator;
	switch (node.right.type) {
	  case 'Literal':
	  case 'Identifier':  
	  case 'UnaryExpression':  
	    if (operator === '=') {
	      const rightNode = this.visitNode(node.right);
	      return`${leftNode} = ${rightNode}`;     
	     } else {
	        const rn = this.visitNode(node.right);
	        return`${leftNode} ${operator} ${rn}`;  
        }
	    case 'BinaryExpression':
	    case 'LogicalExpression':
	    case 'ConditionalExpression':
	    case 'ParenthesizedExpression':
	    case 'MemberExpression':
	      const exp = this.visitNode(node.right);
	      return `${leftNode} ${operator} ${exp}`
	    default:
	      throw new Error(`Expression Assign: \n ${JSON.stringify(node, null, 2)}\n was not captured`);
	    }
  }
  
  visitIfStatement(node) {
    const id = flowChartEditor.uuid();
    const test = this.visitNode(node.test);
    const block = this.getBlockProps(id, { code: test, typeBlock: 'ifBlock' });
    this.addNewBlock(block);
    this.previusId = id;
    this.hookStack.push(this.currentHook);
    this.currentHook = 'inner-out-yes';
    this.visitNode(node.consequent);
    if (node.alternate !== null) {
      this.previusId = block.id;
      this.currentHook = 'inner-out-no';
      this.visitNode(node.alternate);
    }
    this.previusId = block.id;
    this.popHook();
  }
  
  visitReturnStatement(node) {
    const id = flowChartEditor.uuid();
    const { argument } = node;
    const _arg = argument.type === 'Identifier' ? argument.name : this.visitNode(argument)
    const code = `return ${_arg}`;
    this.addNewBlock(this.getBlockProps(id, { code, typeBlock: 'codeBlock' }));
    this.previusId = id;
    this.fixCurrentHook();
  }
  
  visitBreakStatement(node) {
    const id = flowChartEditor.uuid();
    const block = this.getBlockProps(id, { code: 'break', typeBlock: 'codeBlock' });
    this.addNewBlock(block);
    this.previusId = id;
    this.fixCurrentHook();
  }
  
  getParams(params) {
    return params.map(param => {
      return {
        name: param.name || param,
        declarationType: '',
        type: 'Normal'
      }
    });
  }
  
  evalArgs(nodeArgs) {
    let _args = [];
    for (const nodeArg of nodeArgs) {
      if (nodeArg.type === 'CallExpression') this.isEvalWrappedBlock = true;
      _args.push(this.visitNode(nodeArg));
    }
    return _args;
  }
  
  getArrayLevel(node) {
    if (!node.elements.length) {
      return 'Array'
    }
    if (node.elements.length > 1 && node.elements[0].type !== 'ArrayExpression') {
      return 'Array';
    } else {
      return 'MultiDimensional Array';
    }
  }
  
  evalArrayElements(elements, decType) {
    let arrayElements = [];
    for (const elementLevel1 of elements) {
      if (decType === 'Array') {
        arrayElements.push(this.visitNode(elementLevel1));
      } else {
        let innerArrayElements = [];
        for (const elementLevel2 of elementLevel1.elements) {
          innerArrayElements.push(this.visitNode(elementLevel2));
        }
        arrayElements.push(innerArrayElements);
      }
    }
    return JSON.stringify(arrayElements).replace(/\\"/g, '');
  }
  
  getWrapBlockProps(id, props) {
    const { blockColor, fontColor, lineColor } = configEditor.flow.customizedBlocks.wrapBlock;
    return {
      id,
      typeBlock: 'wrapBlock',
      wrapType: props.wrapType,
      tabId: this.tabId,
      tabType: props.tabType,
      functionName: props.functionName,
      params: props.params,
      lineColor,
      bgColor: blockColor,
      fontColor,
      code: props.code,
      returnType: null,
      previus: props.previus,
      hook: props.hook,
    }
  }
  
  getDefineBlockProps(id, props) {
    return {
      id,
      typeBlock: 'defineBlock',
      tabId: this.tabId,
      tabType: this.tabType,
      code: `${props.kind ? `var ` : ''}${props.name}${props.value !== null ? ` = ${props.value}` : ''}`,
      declarationType: props.decType,
      variableName: props.name,
      variableValue: props.value !== null ? props.value : '',
      hook: this.currentHook,
      previus: this.previusId,        
    }
  }
  
  getInputBlockProps(id, props) {
    const { declaration } = props;
    const inputCode = declaration === 'int' ? `parseInt(${props.arguments})` : declaration === 'float' ? `parseFloat(${props.arguments})` : `GET(${props.arguments})`;
    const expression = declaration === 'String' ? props.arguments : props.arguments.split('GET(').pop().slice(0, -1);
    return {
      id,
      typeBlock: 'inputBlock',
      tabId: this.tabId,
      tabType: this.tabType,
      code: `${props.kind !== null ? 'var ' : ''}${props.name} = ${inputCode}`,
      expression,
      hook: this.currentHook,
      previus: this.previusId,
      declarationType: 'Normal',
      declaration,
      variableName: props.name,
      variableValue: props.value,
      radioOption: 'defineVar'
    }
  }
 
  getOutputBlockProps(id, props) {
    const printTemplate = props.radioOption === 'println' ? 'PRINTLN(' : 'PRINT(';
    return {
      id,
      typeBlock: 'outputBlock',
      tabId: this.tabId,
      tabType: this.tabType,
      code: `${printTemplate}${props.args.join(",")})`,
      expression: props.args.join(','),
      radioOption: props.radioOption,
      hook: this.currentHook,
      previus: this.previusId,
    }
  }
  
  getForBlockProps(id, props) {
    return {
      id,
      typeBlock: 'forBlock',
      tabId: this.tabId,
      tabType: this.tabType,
      code: props.code,
      hook: this.currentHook,
      previus: this.previusId,
      initialValue: props.value,
      radioVar: props.radioVar,
      radioOption: props.radioOption,
      variableName: props.name,
      variableValue: props.value,
      variableCompareValue: props.variableCompareValue
    }
  }
  
  getBlockProps(id, props) {
    return {
      id,
      typeBlock: props.typeBlock,
      tabId: this.tabId,
      tabType: this.tabType,
      code: props.code,
      hook: this.currentHook,
      previus: this.previusId
    }
  }
}