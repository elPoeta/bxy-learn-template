class UndoRedoManager {

  constructor(canvas) {
    this.c = canvas;
    this.state = {};
    this.stack = new Array(this.state);
    this.stackIndex = 0;
    this.maxStackSize = 4;
    this.isUndoRedo = false;
  }

  undo() {
    return this.stackIndex > 0 ?
      this.state = this.stack[--this.stackIndex] : this.state;
  }

  redo() {
    return this.stackIndex < this.stack.length - 1 ?
      this.state = this.stack[++this.stackIndex] : this.state;
  }

  save(state) {
    if(this.isUndoRedo) return;
    if (this.stack.length === this.maxStackSize) {
      if (this.stackIndex === this.stack.length - 1) {
        --this.stackIndex;
      }
      this.stack.shift();
    }
    this.stackIndex++ + 1;
    this.state = state;
    this.stack = [...this.stack, state];
  }
  
  setIsUndoRedo() {
    this.isUndoRedo = !this.isUndoRedo;
  }
}