class BlockState {
  constructor() {
    this.state = new Map();
  }

  add(key, value) {
    if ((!key || (typeof key !== 'string')) ||
      (!value || (typeof value !== 'object'))) throw new Error("Missing key or value");
    this.state.set(key, value);
  }

  get(key) {
    return this.state.has(key) ? this.state.get(key) : null;
  }
  
  hasKey(key) {
    return this.state.has(key);
  }

  update(key, value) {
    if (key !== null) {
      const stateFound = { ...this.get(key), ...value };
      this.state.set(key, stateFound);
    } else {
      this.add(key, value);
    }
  }
  
  remove(key) {
    if (!this.state.has(key)) return;
    this.state.delete(key);
  }
  
  size() {
    return this.state.size;
  }

  isEmpty() {
    return this.size() === 0;
  }

  toArray() {
    return [...this.state];
  }

  clear() {
    this.state.clear();
  }
  
  print() {
    const myMap = this.state
    this.state.forEach((value, key) => {
      console.log(key, ': ', value)
    });
  }
}