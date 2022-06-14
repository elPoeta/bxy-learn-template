const loadPages = () => {
  //const pageContainer = document.querySelector("#bxyPagesContainer");
  const canvasContainer = document.querySelector("#bxyCanvasContainer");
  //pageContainer.innerHTML = timelinePage();
  const items = document.querySelectorAll(".bxy-timeline li");

  const isElementInViewport = (el) => {
    let rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  const callbackFunc = (ev) => {
    if (pageContainer.classList.contains("hide")) return;
    let stop = false;
    for (let i = 0; i < items.length; i++) {
      if (
        !items[i].classList.contains("in-view") &&
        isElementInViewport(items[i])
      ) {
        items[i].classList.add("in-view");
        if (i === items.length - 1) {
          stop = true;
        }
      }
    }
    if (stop) {
      window.removeEventListener("scroll", callbackFunc);
      document.querySelector("#timeTask").scrollTop =
        document.querySelector("#timeTask").scrollHeight;
      //element.scrollTop = element.scrollHeight;
      //window.scrollTo(0, document.querySelector(".bxy-timeline").scrollHeight);
    }
  };

  const ul = document.querySelector("#timeTask");

  const handleTimeLineItems = (ev) => {
    const target = ev.target;
    if (
      target.tagName.toLowerCase() !== "li" &&
      target.tagName.toLowerCase() !== "ul"
    ) {
      pageContainer.classList.add("hide");
      canvasContainer.classList.remove("hide");
      document.querySelector("#flowContainer").style.height = `${
        window.innerHeight - 40
      }px`;
      window.flowChartEditor.createCanvas();
    }
  };

  //ul.addEventListener("click", handleTimeLineItems);
  //window.addEventListener("resize", callbackFunc);
  //window.addEventListener("scroll", callbackFunc);
  window.flowChartEditor = new FlowChart();
  window.configEditor = {
    flow: new CustomBlock(),
  };
  window.flowChartEditor.createCanvas();
};
