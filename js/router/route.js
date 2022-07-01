class Route {
  constructor() {
    this.routes = this.getRoutes();
  }

  getRoutes() {
    return [
      { path: "/", query: "", title: "Browxy Learn", view: Home },
      { path: "/flowchart", query: "", title: "Flowchart", view: FlowView },
    ];
  }
}
