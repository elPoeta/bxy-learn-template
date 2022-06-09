class GenerateCode {
  constructor(canvas, nodes, isHighlight, runType, countHighlightLines) {
    this.c = canvas;
    this.nodes = nodes;
    this.output = '';
    this.fakeOutput = '';
    this.isHighlight = isHighlight;
    this.runType = runType;
    this.countHighlightLines = countHighlightLines;
  }

  visitNodes() {
    for (const node of this.nodes) {
      this.visitNode(node);
    };
  }

  visitNode(node) {
    const { index, block } = this.getBlockByNode(node);
    if (index < 0) return;
    switch (block.type) {
      case 'defineBlock':
      case 'codeBlock':
      case 'inputBlock':
      case 'outputBlock':
      case 'wrapBlock':
        return this.visitIOBlock(index, block);
      case 'whileBlock':
      case 'forBlock':
      case 'doWhileBlock':
        return this.visitLoopBlock(index, block);
      case 'ifBlock': return this.visitIfBlock(index, block);
      case 'endBlock': return;
    }
  }
  
  visitChild(children) {
    for (const child of children) {
      this.visitNode(child.id);
    }
  }

  visitIOBlock(index, block) {
    this.writeOutput(index, block);
  }

  visitLoopBlock(index, block) {
    this.writeOutput(index, block);
    const children = this.c.getSortedChildren(block.id, 'YES');
    this.visitChild(children);
    this.output += block.type === 'doWhileBlock' ? `} while(${block.code});` : '}\n';
    this.fakeOutput += block.type === 'doWhileBlock' ? `} while(${block.code}); /* ${JSON.stringify({ id: block.id, tabIndex: this.c.selectedTab })} */` : '}\n';
  }

  visitIfBlock(index, block) {
    this.writeOutput(index, block);
    const childrenBranchR = this.c.getSortedChildren(block.id, 'YES');
    const childrenBranchL = this.c.getSortedChildren(block.id, 'NO');
    const hasElse = this.hasElseStatement(childrenBranchL);
    const hasElseIf = hasElse ? this.hasElseIfStatement(childrenBranchL) : false;
    this.visitChild(childrenBranchR);
    if (hasElse) {
      this.output += hasElseIf ? `} else ` : `} else {`;
      this.fakeOutput += hasElseIf ? `} else ` : `} else {`;
      this.visitChild(childrenBranchL);
      this.output += hasElseIf ? '' : '}\n';
      this.fakeOutput += hasElseIf ? '' : '}\n';
    } else {
      this.output += '}\n';
      this.fakeOutput += '}\n';
    }
  }

  writeOutput(index, block) {
    this.errorWriteOutputHandler(index, block);
    switch (this.c.languageOutput) {
    case 'java':
      this.writeJavaOutput(index, block);
      break;
    case 'javascript':
      this.writeJavascriptOutput(index, block);
      break;  
    default:
      break;
    }
  }
  
  writeJavaOutput(index, block) {
    const code = this.writeCode(block);
  }
   
  writeJavascriptOutput(index, block) {
    const isElseIfOut = this.output.trim().endsWith('} else');
    const breakpoint = this.c.globalBreakpoint[block.id];
    if (this.isHighlight && !isElseIfOut) {
      if (this.runType === 'highlightBlock' || (this.runType === 'breakpoint' && breakpoint)) {
        this.output += `highlightBlock('${block.id}','${this.c.selectedTab}','${this.countHighlightLines}');\n`;
        this.countHighlightLines++;
      }
    }
    const code = this.writeCode(block);
    if (this.isHighlight && isElseIfOut) {
      if (this.runType === 'highlightBlock' || (this.runType === 'breakpoint' && breakpoint)) {
        this.countHighlightLines++;
        this.output += `highlightBlock('${block.id}','${this.c.selectedTab}','${this.countHighlightLines}');\n`;
      }
    }
  }

  writeCode(block) {
    const { type } = block;
    const blockType = {
      'defineBlock': () => this.writeCodeIOBlock(block),
      'codeBlock': () => this.writeCodeIOBlock(block),
      'inputBlock': () => this.writeCodeIOBlock(block),
      'outputBlock': () => this.writeCodeIOBlock(block),
      'wrapBlock': () => this.writeCodeIOBlock(block),
      'whileBlock': () => this.writeCodeWhileBlock(block),
      'forBlock': () => this.writeCodeForBlock(block),
      'doWhileBlock': () => this.writeCodeDoWhileBlock(block),
      'ifBlock': () => this.writeCodeIfBlock(block),
      'default': () => ''
    }
    return (blockType[type] && blockType[type]()) || blockType['default']();
  }

  writeCodeIOBlock(block) {
    const hasImport = (this.c.languageOutput === 'java' && block.type === 'codeBlock' && block.isImport);
    const code = hasImport ? '' : `${block.code};`;
    this.output += hasImport ? '' : `${code}\n`;
    this.fakeOutput += hasImport ? '' : `${code} /* ${JSON.stringify({ id: block.id, tabIndex: this.c.selectedTab })} */ \n`;
    return code;
  }

  writeCodeWhileBlock(block) {
    const code = `while(${block.code}) {`;
    this.output += `${code}\n`;
    this.fakeOutput += `while(${block.code}) /* ${JSON.stringify({ id: block.id, tabIndex: this.c.selectedTab })} */ {\n`;
    return code;
  }

  writeCodeForBlock(block) {
    const code = `for(${block.code}) {`;
    this.output += `${code}\n`;
    this.fakeOutput += `for(${block.code}) /* ${JSON.stringify({ id: block.id, tabIndex: this.c.selectedTab })} */ {\n`;
    return code;
  }

  writeCodeDoWhileBlock(block) {
    const code = `} while(${block.code});`;
    this.output += 'do {\n';
    this.fakeOutput += ` do /* ${JSON.stringify({ id: block.id, tabIndex: this.c.selectedTab })} */ { \n`;
    return code;
  }

  writeCodeIfBlock(block) {
    const code = `if(${block.code}) {`;
    this.output += `${code}\n`;
    this.fakeOutput += `if(${block.code}) /* ${JSON.stringify({ id: block.id, tabIndex: this.c.selectedTab })} */ {\n`;
    return code;
  }

  hasElseStatement(childrenBranchL) {
    return childrenBranchL.length > 0;
  }
  
  hasElseIfStatement(childrenBranchL) {
    return childrenBranchL[0].type === 'ifBlock';
  }

  getBlockByNode(node) {
    const index = this.c.getBlockIndex(node);
    if (index < 0) return { block: {}, index };
    return { block: this.c.program[index], index };
  }
  
  errorWriteOutputHandler(index, block) {
    if(this.c.isRunningTest) return;
    const { id, type, code } = block;
    if (Utils.isEmpty(code)) {
      this.throwFlowError({ index, error: { hasError: true, errorMessages: ['The code block does not contain any logic'] } });
    }
    if (!this.isQuotesBalance(code)) {
      this.throwFlowError({ index, error: { hasError: true, errorMessages: ['Double quotes is not balanced'] } });
    }
    if (this.c.program[index].type !== 'outputBlock' && !this.isBracketsBalanced(code)) {
      this.throwFlowError({ index, error: { hasError: true, errorMessages: ['Brackets not balanced'] } });
    }
    if (['startBlock', 'endBlock', 'defineBlock', 'codeBlock', 'inputBlock', 'outputBlock', 'wrapBlock'].includes(type)) return;
    const children = ['whileBlock', 'doWhileBlock', 'forBlock'].includes(type) ? this.c.getChildren(id) : this.c.getSortedChildren(id, 'YES');
    if (!children.length) {
      const messages = type === 'ifBlock' ? ['The block has no children', 'YES branch has no children'] : ['The block has no children'];
      this.throwFlowError({ index, error: { hasError: true, errorMessages: messages } });
    }
  }
  
  throwFlowError({ index, error }) {
    this.c.program[index].compileError = error;
    this.c.openAndLoadTabByIndex(this.c.currentTab, true);
    throw new Error(error.errorMessages[0]);
  }

  isBracketsBalanced(input) {
    const brackets = "[]{}()";
    const stack = [];
    for (let bracket of input) {
      const bracketsIndex = brackets.indexOf(bracket);
      if (bracketsIndex === -1) {
        continue;
      }
      if (bracketsIndex % 2 === 0) {
        stack.push(bracketsIndex + 1);
      } else {
        if (stack.length === 0 || stack.pop() !== bracketsIndex) {
          return false;
        }
      }
    }
    return stack.length === 0;
  }

  isQuotesBalance(input) {
    return (input.match(/\"/g) || []).length % 2 === 0;
  }
  
} 