class BlockFactory {
  static getImplementation(
    id,
    canvas,
    type,
    x,
    y,
    w,
    h,
    code,
    isProgram,
    languageOutput,
    wrapType
  ) {
    switch (languageOutput.toLowerCase()) {
      case "java":
        return BlockFactory.getJavaBlock(
          id,
          canvas,
          type,
          x,
          y,
          w,
          h,
          code,
          isProgram,
          languageOutput,
          wrapType
        );
      case "javascript":
        return BlockFactory.getJavaScriptBlock(
          id,
          canvas,
          type,
          x,
          y,
          w,
          h,
          code,
          isProgram,
          languageOutput,
          wrapType
        );
      default:
        return BlockFactory.getBlock(
          id,
          canvas,
          type,
          x,
          y,
          w,
          h,
          code,
          isProgram,
          languageOutput
        );
    }
  }

  static getBlock(
    id,
    canvas,
    type,
    x,
    y,
    w,
    h,
    code,
    isProgram,
    languageOutput
  ) {
    switch (type) {
      case "startBlock":
        return new StartBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          false,
          languageOutput
        );
      case "endBlock":
        return new EndBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          false,
          languageOutput
        );
      case "defineBlock":
        return new DefineBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "codeBlock":
        return new CodeBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "inputBlock":
        return new InputBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "outputBlock":
        return new OutputBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "whileBlock":
        return new WhileBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "forBlock":
        return new ForBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "doWhileBlock":
        return new DoWhileBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "ifBlock":
        return new IfBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "wrapBlock":
        return new WrapBlock(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
    }
  }

  static getJavaBlock(
    id,
    canvas,
    type,
    x,
    y,
    w,
    h,
    code,
    isProgram,
    languageOutput,
    wrapType
  ) {
    switch (type) {
      case "defineBlock":
        return new DefineBlockJava(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "codeBlock":
        return new CodeBlockJava(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "inputBlock":
        return new InputBlockJava(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "outputBlock":
        return new OutputBlockJava(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "whileBlock":
        return new WhileBlockJava(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "forBlock":
        return new ForBlockJava(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "doWhileBlock":
        return new DoWhileBlockJava(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "ifBlock":
        return new IfBlockJava(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "wrapBlock":
        if (wrapType === "function_calling")
          return new WrapFunctionCallJava(
            id,
            canvas,
            x,
            y,
            w,
            h,
            type,
            code,
            1,
            isProgram,
            languageOutput
          );
        return new WrapFunctionDeclarationJava(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
    }
  }

  static getJavaScriptBlock(
    id,
    canvas,
    type,
    x,
    y,
    w,
    h,
    code,
    isProgram,
    languageOutput,
    wrapType
  ) {
    switch (type) {
      case "defineBlock":
        return new DefineBlockJavascript(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "codeBlock":
        return new CodeBlockJavascript(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "inputBlock":
        return new InputBlockJavascript(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "outputBlock":
        return new OutputBlockJavascript(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "whileBlock":
        return new WhileBlockJavascript(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "forBlock":
        return new ForBlockJavascript(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "doWhileBlock":
        return new DoWhileBlockJavascript(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "ifBlock":
        return new IfBlockJavascript(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
      case "wrapBlock":
        if (wrapType === "function_calling")
          return new WrapFunctionCallJavascript(
            id,
            canvas,
            x,
            y,
            w,
            h,
            type,
            code,
            1,
            isProgram,
            languageOutput
          );
        return new WrapFunctionDeclarationJavascript(
          id,
          canvas,
          x,
          y,
          w,
          h,
          type,
          code,
          1,
          isProgram,
          languageOutput
        );
    }
  }
}
