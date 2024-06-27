(() => {
  // src/index.js
  var container = document.getElementById("app");
  var nodeWrapper = document.createElement("div");
  nodeWrapper.style.background = "red";
  nodeWrapper.style.width = "100px";
  nodeWrapper.style.height = "100px";
  container.appendChild(nodeWrapper);
  new EventSource("/esbuild").addEventListener("change", () => location.reload());
})();
