class WrapFormFactory {

  static getImplementation(canvas, values, formType, wrappedBlocks, index, selectedBlocks) {
    switch (canvas.languageOutput.toLowerCase()) {
      case 'java':
        return new WrapJavaBlockWizardForm(canvas, values, formType, wrappedBlocks, index, selectedBlocks);          
      case 'javascript':
        return new WrapJavascriptBlockForm(canvas, values, formType, wrappedBlocks, index, selectedBlocks);
      default:
        break;
    }
  }

}