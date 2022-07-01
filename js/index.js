// window.addEventListener("load", () => {
//   console.log("*****************");
//   const router = new Router();
//   document.body.addEventListener("click", (e) => {
//     if (e.target.matches("[data-link]")) {
//       e.preventDefault();
//       router.navigateTo(e.target.href);
//     }
//   });

//   window.addEventListener("popstate", () => {
//     router.routeMatches();
//   });

//   router.routeMatches();
// });

// toggleMode.addEventListener("click", (ev) => {
//   document.documentElement.classList.toggle("light-mode");
// });

//let prevScrollpos = window.pageYOffset;

//location.search.slice(location.search.indexOf('?') +1).split('&').forEach(v => queryParams[v.split('=')[0]] = v.split('=')[1]);
