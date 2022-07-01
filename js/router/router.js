class Router {
  constructor() {
    this.route = new Route();
  }

  pathToRegex(path) {
    return new RegExp(
      "^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$"
    );
  }

  getParams(match) {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
      (result) => result[1]
    );

    return Object.fromEntries(
      keys.map((key, i) => {
        return [key, values[i]];
      })
    );
  }

  getQueryParams() {
    let queryParams = {};
    location.search
      .slice(location.search.indexOf("?") + 1)
      .split("&")
      .forEach((v) => {
        if (!Utils.isEmpty(v)) queryParams[v.split("=")[0]] = v.split("=")[1];
      });
    return queryParams;
  }

  potentialMatches() {
    return this.route.routes.map((route) => {
      return {
        route: route,
        result: location.pathname.match(this.pathToRegex(route.path)),
      };
    });
  }

  async routeMatches() {
    let match = this.potentialMatches().find(
      (potentialMatch) => potentialMatch.result !== null
    );

    if (!match) {
      match = {
        route: this.route.routes[0],
        result: [location.pathname],
      };
    }
    console.log("QUERY ", this.getQueryParams());
    const view = new match.route.view(this.getParams(match));

    document.querySelector("#root").innerHTML = await view.getHtml();
  }

  navigateTo(url) {
    history.pushState(null, null, url);
    this.routeMatches();
  }
}
