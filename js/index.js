toggleMode.addEventListener("click", (ev) => {
  document.documentElement.classList.toggle("light-mode");
});

let prevScrollpos = window.pageYOffset;
let items = document.querySelectorAll(".bxy-timeline li");

function isElementInViewport(el) {
  let rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
    (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function callbackFunc() {
  // let currentScrollPos = window.pageYOffset;
  // if (prevScrollpos > currentScrollPos) {
  //   document.querySelector("#header").style.top = "0";
  // } else {
  //   document.querySelector("#header").style.top = "-50px";
  // }
  // prevScrollpos = currentScrollPos;
  for (let i = 0; i < items.length; i++) {
    if (isElementInViewport(items[i])) {
      items[i].classList.add("in-view");
    }
  }
}

window.addEventListener("load", callbackFunc);
window.addEventListener("resize", callbackFunc);
window.addEventListener("scroll", callbackFunc);
