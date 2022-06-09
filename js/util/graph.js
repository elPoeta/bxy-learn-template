class Graph {
  constructor() {
    this.nodes = new Map();
  }

  clear() {
    this.nodes.clear();
  }
  
  addNode(node) {
    this.nodes.set(node, [])
  }

  addEdge(source, destination) {
    this.nodes.get(source).push(destination)
  }

  getNodeEdges(source) {
    return this.nodes.get(source) || null;
  }

  removeNode(node) {
    let neighbors = this.nodes.get(node) || [];
    for (let neighbor of neighbors) {
      let adjacencyListOfNeighbor = this.nodes.get(neighbor);
      this.getIndexAndRemoveItem(node, adjacencyListOfNeighbor);
    }

    this.nodes.delete(node);
  }

  removeEdge(source, destination) {
    let adjacencyListOfSource = this.nodes.get(source);
    this.getIndexAndRemoveItem(destination, adjacencyListOfSource);
  }

  getIndexAndRemoveItem(item, list) {
    if(!list) return;
    const index = list.indexOf(item);
    list.splice(index, 1);
  }

  depthFirstSearch(startingNode) {
    let visitedNode = [];
    this.dfsRecursion(startingNode, visitedNode);
    return visitedNode;
  }

  dfsRecursion(currentNode, visitedNode) {
    visitedNode[currentNode] = true;
    let adjacencyListOfCurrentNode = this.nodes.get(currentNode) || [];
    for (var node of adjacencyListOfCurrentNode) {
      if (!visitedNode[node]) this.dfsRecursion(node, visitedNode);
    }
  }

  breadthFirstSearch(startingNode) {
    let visitedNode = [];
    let queue = [];
    let nodePath = [];
    visitedNode[startingNode] = true;
    queue.push(startingNode);
    while (queue.length > 0) {
      const currentNode = queue.shift();
      const adjacencyListOfCurrentNode = this.nodes.get(currentNode) || [];
      for (let node of adjacencyListOfCurrentNode) {
        if (!visitedNode[node]) {
          visitedNode[node] = true;
          queue.push(node);
          if(node)
          nodePath.push(node)
        }
      }
    }
    return nodePath;
  }

  getAdjacencyList() {
    const list = {}
    for (let [node, adjacencyList] of this.nodes) {
      list[node]= list[node] ? [...list[node],adjacencyList] : [...adjacencyList];
    }
    return list;
  }
  
  setNodesFromList(listOfNodes) {
    this.nodes = new Map();
    for (let [key, value] of Object.entries(listOfNodes)) {
      this.addNodes(key,value);
    }  
  }
  
  addNodes(node, list) {
    this.nodes.set(node, list);
  }

  shortestPath(source, target) {
    if (source == target) {          
      return [source];                 
    }                         
    let queue = [ source ];
    let visited = { source: true };
    let predecessor = {};
    let tail = 0;
    while (tail < queue.length) {
      let u = queue[tail++];
      let neighbors = this.nodes.get(u) || [];
      for (let i = 0; i < neighbors.length; ++i) {
        let v = neighbors[i];
        if (visited[v]) {
          continue;
        }
        visited[v] = true;
        if (v === target) {   
          let path = [ v ];
          while (u !== source) {
            path.push(u);
            u = predecessor[u];          
          }
          path.push(u);
          path.reverse();
          return path;
        }
        predecessor[v] = u;
        queue.push(v);
      }
    }
  }
  
  print() {
    const list = {}
    for (let [node, adjacencyList] of this.nodes) {
      list[node]= list[node] ? [...list[node],adjacencyList] : [...adjacencyList] 
      console.log(`${node}: ${adjacencyList}`);
    }
    return list;
  }
  
}
