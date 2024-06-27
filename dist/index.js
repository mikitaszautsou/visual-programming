(() => {
  // src/index.js
  var div = () => {
    return document.createElement("div");
  };
  var flex = (element) => {
    element.style.display = "flex";
  };
  var relative = (element) => {
    element.style.position = "relative";
  };
  var justifyCenter = (element) => {
    element.style.justifyContent = "center";
  };
  var bg = (element, color) => {
    element.style.background = color;
  };
  var fullWidth = (element) => {
    element.style.width = "100%";
  };
  function createNode({ x, y }) {
    const container = document.getElementById("app");
    const nodeWrapper = document.createElement("div");
    nodeWrapper.style.background = "red";
    nodeWrapper.style.position = "absolute";
    nodeWrapper.style.transform = `translate(${x}px, ${y}px)`;
    nodeWrapper.style.display = `flex`;
    nodeWrapper.style.flexDirection = `column`;
    nodeWrapper.style.alignItems = "center";
    const title = document.createElement("div");
    title.textContent = "Title";
    flex(title);
    justifyCenter(title);
    title.style.cursor = "move";
    nodeWrapper.appendChild(title);
    nodeWrapper.style.width = "100px";
    nodeWrapper.style.height = "120px";
    container.appendChild(nodeWrapper);
    const node3 = { x, y, element: nodeWrapper, pins: [] };
    let isDragging = false;
    let startX, startY;
    title.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", endDrag);
    function startDrag(e) {
      isDragging = true;
      startX = e.clientX - node3.x;
      startY = e.clientY - node3.y;
      e.preventDefault();
    }
    function drag(e) {
      if (!isDragging) return;
      node3.x = (e.clientX - startX) / globalZoom;
      node3.y = (e.clientY - startY) / globalZoom;
      nodeWrapper.style.transform = `translate(${(globalPosition.x + node3.x) * globalZoom}px, ${(globalPosition.y + node3.y) * globalZoom}px) scale(${globalZoom})`;
      updateAllConnections();
      e.stopPropagation();
    }
    function endDrag() {
      isDragging = false;
    }
    return node3;
  }
  function addPin({ element: target }, type) {
    const pinBlock = div();
    pinBlock.textContent = "Pin";
    flex(pinBlock);
    relative(pinBlock);
    justifyCenter(pinBlock);
    bg(pinBlock, "green");
    fullWidth(pinBlock);
    const pinCircle = div();
    if (type == "input") {
      Object.assign(pinCircle.style, {
        width: "7px",
        height: "7px",
        background: "blue",
        position: "absolute",
        right: "-2.5px",
        top: "50%",
        borderRadius: "50%",
        transform: "translateY(-50%)"
      });
    } else {
      Object.assign(pinCircle.style, {
        width: "7px",
        height: "7px",
        background: "blue",
        position: "absolute",
        left: "-2.5px",
        top: "50%",
        borderRadius: "50%",
        transform: "translateY(-50%)"
      });
    }
    pinBlock.appendChild(pinCircle);
    target.appendChild(pinBlock);
    return { pinBlock, pinCircle };
  }
  function connectPins(pin12, pin22, color = "black", thickness = 2) {
    let svg = document.getElementById("connector-svg");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = "connector-svg";
      svg.style.position = "absolute";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
      document.body.appendChild(svg);
    }
    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.style.fill = "none";
    pathElement.style.stroke = color;
    pathElement.style.strokeWidth = thickness;
    svg.appendChild(pathElement);
    const connection = { pin1: pin12, pin2: pin22, path: pathElement };
    connections.push(connection);
    updateConnection(connection);
    return pathElement;
  }
  function updateConnection(connection) {
    const { pin1: pin12, pin2: pin22, path } = connection;
    const rect1 = pin12.getBoundingClientRect();
    const rect2 = pin22.getBoundingClientRect();
    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;
    const pathD = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
    path.setAttribute("d", pathD);
    path.style.strokeWidth = 2 * globalZoom;
  }
  function setInitialNodeTransform(node3) {
    node3.element.style.transform = `translate(${(globalPosition.x + node3.x) * globalZoom}px, ${(globalPosition.y + node3.y) * globalZoom}px) scale(${globalZoom})`;
  }
  function updateAllConnections() {
    connections.forEach(updateConnection);
  }
  var connections = [];
  var globalPosition = {
    x: 0,
    y: 0
  };
  var globalZoom = 1;
  var nodes = [];
  var node = createNode({ x: 10, y: 10 });
  setInitialNodeTransform(node);
  nodes.push(node);
  pin1 = addPin(node);
  pin2 = addPin(node, "input");
  var node2 = createNode({ x: 100, y: 100 });
  setInitialNodeTransform(node2);
  nodes.push(node2);
  pin3 = addPin(node2);
  connectPins(pin1.pinCircle, pin3.pinCircle, "black");
  function makeDraggableCanvas() {
    let isCanvasDragging = false;
    let startX, startY;
    const canvas = document.getElementById("app");
    const container = document.getElementById("app");
    canvas.addEventListener("mousedown", startCanvasDrag);
    canvas.addEventListener("mousemove", dragCanvas);
    canvas.addEventListener("mouseup", endCanvasDrag);
    canvas.addEventListener("wheel", zoom);
    function startCanvasDrag(e) {
      if (e.target === canvas) {
        isCanvasDragging = true;
        startX = e.clientX;
        startY = e.clientY;
      }
    }
    function dragCanvas(e) {
      if (!isCanvasDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;
      globalPosition.x += deltaX;
      globalPosition.y += deltaY;
      updateNodesPosition();
    }
    function endCanvasDrag() {
      isCanvasDragging = false;
    }
    function zoom(e) {
      e.preventDefault();
      const delta = e.deltaY;
      const zoomFactor = 0.1;
      if (delta > 0) {
        globalZoom = Math.max(0.1, globalZoom - zoomFactor);
      } else {
        globalZoom += zoomFactor;
      }
      updateNodesPosition();
    }
    function updateNodesPosition() {
      nodes.forEach((n) => {
        n.element.style.transform = `translate(${(globalPosition.x + n.x) * globalZoom}px, ${(globalPosition.y + n.y) * globalZoom}px) scale(${globalZoom})`;
      });
      updateAllConnections();
    }
  }
  makeDraggableCanvas();
  new EventSource("/esbuild").addEventListener("change", () => location.reload());
})();
