(() => {
  // src/Utils.js
  var Utils = class _Utils {
    static async executePythonCode(value) {
      const response = await fetch("http://localhost:3000/execute", {
        method: "POST",
        body: value,
        headers: {
          "Content-Type": "text/plain"
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    }
    static async saveState(state) {
      const response = await fetch("http://localhost:3000/save", {
        method: "POST",
        body: JSON.stringify(state, null, 2),
        headers: {
          "Content-Type": "text/plain"
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    }
    static async loadState(state) {
      const response = await fetch("http://localhost:3000/load", {
        method: "POST",
        body: state,
        headers: {
          "Content-Type": "text/plain"
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    }
    static updateConnection(connection) {
      const { pin1, pin2, path } = connection;
      const rect1 = pin1.getBoundingClientRect();
      const rect2 = pin2.getBoundingClientRect();
      const x1 = rect1.left + rect1.width / 2;
      const y1 = rect1.top + rect1.height / 2;
      const x2 = rect2.left + rect2.width / 2;
      const y2 = rect2.top + rect2.height / 2;
      const pathD = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
      path.setAttribute("d", pathD);
      path.style.strokeWidth = 2 * globalState.globalZoom;
    }
    static createNode({ x, y, titleValue = "unknown" }) {
      const container = document.getElementById("app");
      const nodeWrapper = document.createElement("div");
      nodeWrapper.style.background = "green";
      nodeWrapper.style.position = "absolute";
      nodeWrapper.style.transform = `translate(${x}px, ${y}px)`;
      nodeWrapper.style.display = `flex`;
      nodeWrapper.style.flexDirection = `column`;
      nodeWrapper.style.alignItems = "center";
      const title = document.createElement("div");
      title.textContent = titleValue;
      title.style.display = "flex";
      title.style.justifyContent = "center";
      title.style.cursor = "move";
      nodeWrapper.appendChild(title);
      nodeWrapper.style.width = "100px";
      nodeWrapper.style.height = "120px";
      container.appendChild(nodeWrapper);
      const node = { x, y, element: nodeWrapper, titleElement: title, pins: [] };
      let isDragging = false;
      let startX, startY;
      title.addEventListener("mousedown", startDrag);
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", endDrag);
      function startDrag(e) {
        isDragging = true;
        startX = e.clientX - node.x;
        startY = e.clientY - node.y;
        e.preventDefault();
      }
      function drag(e) {
        if (!isDragging) return;
        node.x = (e.clientX - startX) / globalState.globalZoom;
        node.y = (e.clientY - startY) / globalState.globalZoom;
        nodeWrapper.style.transform = `translate(${(globalState.globalPosition.x + node.x) * globalState.globalZoom}px, ${(globalState.globalPosition.y + node.y) * globalState.globalZoom}px) scale(${globalState.globalZoom})`;
        globalState.connections.forEach(_Utils.updateConnection);
        e.stopPropagation();
      }
      function endDrag() {
        isDragging = false;
      }
      return node;
    }
    static setInitialNodeTransform(node) {
      const { globalPosition } = globalState;
      node.element.style.transform = `translate(${(globalState.globalPosition.x + node.x) * globalState.globalZoom}px, ${(globalPosition.y + node.y) * globalState.globalZoom}px) scale(${globalState.globalZoom})`;
    }
    static addPin({ element: target }, type, title) {
      const pinBlock = document.createElement("div");
      pinBlock.textContent = title;
      pinBlock.style.display = "flex";
      pinBlock.style.position = "relative";
      pinBlock.style.justifyCenter = "center";
      pinBlock.style.width = "100%";
      const pinCircle = document.createElement("div");
      if (type == "output") {
        Object.assign(pinCircle.style, {
          width: "10px",
          height: "10px",
          background: "blue",
          position: "absolute",
          right: "-5px",
          top: "50%",
          borderRadius: "50%",
          transform: "translateY(-50%)"
        });
      } else {
        Object.assign(pinCircle.style, {
          width: "10px",
          height: "10px",
          background: "blue",
          position: "absolute",
          left: "-10px",
          top: "50%",
          borderRadius: "50%",
          transform: "translateY(-50%)"
        });
      }
      pinBlock.appendChild(pinCircle);
      pinCircle.classList.add("pin-circle");
      pinCircle.addEventListener("mousedown", _Utils.startPinDrag);
      target.appendChild(pinBlock);
      return { pinBlock, pinCircle };
    }
    static startPinDrag(e) {
      e.stopPropagation();
      globalState.draggingPin = e.target;
      let svg = _Utils.getOrCreateSVG();
      globalState.tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      globalState.tempPath.style.fill = "none";
      globalState.tempPath.style.stroke = "black";
      globalState.tempPath.style.strokeWidth = 2;
      svg.appendChild(globalState.tempPath);
      document.addEventListener("mousemove", _Utils.dragPin);
      document.addEventListener("mouseup", _Utils.endPinDrag);
    }
    static dragPin(e) {
      if (!globalState.draggingPin) return;
      const startRect = globalState.draggingPin.getBoundingClientRect();
      const startX = startRect.left + startRect.width / 2;
      const startY = startRect.top + startRect.height / 2;
      const endX = e.clientX;
      const endY = e.clientY;
      const pathD = `M ${startX} ${startY} C ${(startX + endX) / 2} ${startY}, ${(startX + endX) / 2} ${endY}, ${endX} ${endY}`;
      globalState.tempPath.setAttribute("d", pathD);
    }
    static connectPins(pin1, pin2, color = "black", thickness = 2) {
      let svg = _Utils.getOrCreateSVG();
      const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathElement.style.fill = "none";
      pathElement.style.stroke = color;
      pathElement.style.strokeWidth = thickness;
      svg.appendChild(pathElement);
      const connection = { pin1, pin2, path: pathElement };
      globalState.connections.push(connection);
      _Utils.updateConnection(connection);
      const pin1Obj = globalState.pins.find((p) => p._htmlElement === pin1);
      const pin2Obj = globalState.pins.find((p) => p._htmlElement === pin2);
      const connectionObj = new Connection(pin1Obj, pin2Obj, connection.path);
      pin1Obj.connections.push(connectionObj);
      pin2Obj.connections.push(connectionObj);
      return pathElement;
    }
    static endPinDrag(e) {
      if (!globalState.draggingPin) return;
      const endPin = document.elementFromPoint(e.clientX, e.clientY);
      if (endPin && endPin.classList.contains("pin-circle") && endPin !== globalState.draggingPin) {
        _Utils.connectPins(globalState.draggingPin, endPin);
      }
      if (globalState.tempPath) {
        globalState.tempPath.remove();
        globalState.tempPath = null;
      }
      globalState.draggingPin = null;
      document.removeEventListener("mousemove", _Utils.dragPin);
      document.removeEventListener("mouseup", _Utils.endPinDrag);
    }
    static getOrCreateSVG() {
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
      return svg;
    }
  };

  // src/Pin.js
  var Pin = class {
    name;
    type;
    _pinBlock;
    _pinCircle;
    /**
     * @type {ExecutionNode}
     */
    ownerNode;
    value;
    /**
     * @type {HTMLElement}
     */
    _htmlElement;
    /**
     * @type {Array<Connection>}
     */
    connections = [];
    /**
     * 
     * @param {ExecutionNode} node 
     * @param {string} name 
     * @param {'input' | 'output'}  type 
     */
    constructor(node, name, type) {
      this.name = name;
      this.type = type;
      const { pinBlock, pinCircle } = Utils.addPin({ element: node._htmlElement }, type, name);
      this._pinBlock = pinBlock;
      this._pinCircle = pinCircle;
      this.ownerNode = node;
      this._htmlElement = pinCircle;
      globalState.pins.push(this);
    }
  };

  // src/ExecutionNode.js
  var ExecutionNode = class {
    _title;
    _position = null;
    _htmlElement = null;
    _titleElement = null;
    /**
     * @type {Array<Pin>}
     */
    _pins = [];
    constructor(title = "unknown") {
      const node = Blocks.createNode({ x: 10, y: 10, title });
      this._title = title;
      this._position = { x: node.x, y: node.y };
      this._htmlElement = node.element;
      this._titleElement = node.titleElement;
      this._pins = node.pins;
      let buttonElement = document.createElement("button");
      buttonElement.textContent = "e";
      buttonElement.addEventListener("click", () => {
        this.execute();
      });
      this._titleElement.style.width = "100%";
      this._titleElement.appendChild(buttonElement);
      globalState.nodeObjects.push(this);
    }
    toJSON() {
      return {
        x: this._position.x,
        y: this._position.y,
        title: this._title
      };
    }
    setPosition(x, y) {
      this._position.y = x;
      this._position.y = y;
      this._htmlElement.style.transform = `translate(${x}px, ${y}px)`;
    }
    changeStatus(status) {
      if (status === "success") {
        this._htmlElement.style.background = "#0D9276";
      } else if (status === "new") {
        this._htmlElement.style.background = "#667BC6";
      } else if (status === "progress") {
        this._htmlElement.style.background = "#F4A261";
      }
    }
    async execute() {
      throw new Error("not implemented");
    }
    /**
     * 
     * @typedef {'input' | 'output'} SortOrder
     * @param {SortOrder} type 
     * @param {string} title
     */
    addPin(type, title = "pin") {
      this._pins.push(new Pin(this, title, type));
    }
    async onExecution() {
      await this.execute();
    }
    setPinsValue(value) {
      this._pins.filter((p) => p.type === "output").forEach((p) => {
        p.value = value;
      });
    }
    async propagateValue(value) {
      this.setPinsValue(value);
      for await (const pin of this._pins.filter((p) => p.type === "output")) {
        for await (const connection of pin.connections) {
          connection.to.value = pin.value;
          await connection.to.ownerNode.execute();
        }
      }
    }
  };

  // src/Connection.js
  var Connection = class {
    /**
     * @type {Pin}
     */
    from;
    /**
     * @type {Pin}
     */
    to;
    /**
     * @type {SVGElement}
     */
    htmlElement;
    /**
     * 
     * @param {Pin} from 
     * @param {Pin} to
     * @param {SVGElement} element 
     */
    constructor(from, to, element) {
      this.from = from;
      this.to = to;
      this.element = element;
    }
  };

  // src/GlobalState.js
  var GlobalState = class {
    /**
     * @type {Array<Connection>}
     */
    connections = [];
    globalPosition = {
      x: 0,
      y: 0
    };
    globalZoom = 1;
    nodes = [];
    /**
    * @type {Array<ExecutionNode>}
    */
    nodeObjects = [];
    draggingPin = null;
    tempPath = null;
    /** @type {Array<Pin>} */
    pins = [];
    async store() {
      const stateObject = {
        nodes: this.nodeObjects.map((n) => n.toJSON())
      };
      await Utils.saveState(stateObject);
      console.log(stateObject);
    }
  };
  var globalState = new GlobalState();

  // src/Blocks.js
  var Blocks = class {
    static createValueNode({ x, y, value }) {
      const node = createNode({ x, y });
    }
    static createTableNode({ x, y }) {
      const node = createNode({ x, y });
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      const rows = 3;
      const cols = 3;
      for (let i = 0; i < rows; i++) {
        const row = table.insertRow();
        for (let j = 0; j < cols; j++) {
          const cell = row.insertCell();
          cell.textContent = `${i + 1},${j + 1}`;
          cell.style.border = "1px solid black";
          cell.style.padding = "2px";
          cell.style.textAlign = "center";
        }
      }
      node.element.appendChild(table);
      node.element.style.width = "auto";
      node.element.style.height = "auto";
      node.element.style.padding = "5px";
      return node;
    }
    static createNode({ x, y, title }) {
      const node = Utils.createNode({ x: 10, y: 10, titleValue: title });
      Utils.setInitialNodeTransform(node);
      globalState.nodes.push(node);
      return node;
    }
  };

  // src/DisplayBlock.js
  var DisplayBlock = class extends ExecutionNode {
    _nodeValue = null;
    _displayBlock = null;
    _target = null;
    constructor() {
      super();
      this.changeStatus("new");
      const configureButton = document.createElement("button");
      configureButton.textContent = "C";
      this._titleElement.appendChild(configureButton);
      configureButton.addEventListener("click", () => {
        this._target = prompt("Targt");
        console.log(this._target);
      });
      this._displayBlock = document.createElement("div");
      this._displayBlock.style.width = "100px";
      this._displayBlock.style.height = "100px";
      this._displayBlock.textContent = "NOTHING";
      this._displayBlock.style.justifyContent = "center";
      this._displayBlock.style.display = "flex";
      this._displayBlock.style.alignItems = "center";
      this._displayBlock.style.background = "white";
      this._htmlElement.appendChild(this._displayBlock);
      this.addPin("input", "input");
      this._htmlElement.style.width = "150px";
      this._htmlElement.style.height = "auto";
    }
    async getNodeValue() {
    }
    async execute() {
      const { _displayBlock } = this;
      this.changeStatus("progress");
      const inputPin = this._pins.find((p) => p.type === "input");
      const value = inputPin.value;
      _displayBlock.textContent = value;
      this.changeStatus("success");
    }
    toJSON() {
      return {
        x: this._position.x,
        y: this._position.y,
        title: this._title
      };
    }
  };

  // src/index.js
  function makeDraggableCanvas() {
    let isCanvasDragging = false;
    let startX, startY;
    document.addEventListener("mousedown", startCanvasDrag);
    document.addEventListener("mousemove", dragCanvas);
    document.addEventListener("mouseup", endCanvasDrag);
    document.addEventListener("wheel", zoom);
    function startCanvasDrag(e) {
      if (e.target === document.documentElement) {
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
      globalState.globalPosition.x += deltaX;
      globalState.globalPosition.y += deltaY;
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
      const { globalPosition, nodes } = globalState;
      nodes.forEach((n) => {
        n.element.style.transform = `translate(${(globalState.globalPosition.x + n.x) * globalState.globalZoom}px, ${(globalPosition.y + n.y) * globalState.globalZoom}px) scale(${globalState.globalZoom})`;
      });
      globalState.connections.forEach(Utils.updateConnection);
    }
  }
  makeDraggableCanvas();
  var Main = class {
    static main() {
      new DisplayBlock();
      setInterval(() => {
        globalState.store();
      }, 2e3);
    }
  };
  Main.main();
  new EventSource("/esbuild").addEventListener("change", () => location.reload());
})();
