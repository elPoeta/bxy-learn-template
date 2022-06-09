class Stack {
  constructor(...items) {
    this.items = [];
    this.push(...items);
  }

  push(...items) {
    return this.items = [...this.items, ...items];
  }

  pop(count = 0) {
    if (count === 0)
      return this.items.pop();
    else
      return this.items.splice(-count, count);
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  toArray() {
    return this.items;
  }
}