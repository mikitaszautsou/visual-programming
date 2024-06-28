import { Blocks } from "./Blocks"
import { DisplayBlock } from "./DisplayBlock";
import { ExecutionNode } from "./ExecutionNode"
import { globalState } from "./GlobalState";
import { Utils } from "./Utils";

// AI GENERATED


function connectElements(element1, element2, color = 'black', thickness = 2) {
    // Create SVG element if it doesn't exist
    let svg = document.getElementById('connector-svg');
    if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = 'connector-svg';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        document.body.appendChild(svg);
    }

    // Get the positions of the elements
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    // Calculate the path
    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const middleX = x1 + dx / 2;

    const path = `M ${x1} ${y1} Q ${middleX} ${y1} ${middleX} ${y1 + dy / 2} T ${x2} ${y2}`;

    // Create the path element
    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.setAttribute('d', path);
    pathElement.style.fill = 'none';
    pathElement.style.stroke = color;
    pathElement.style.strokeWidth = thickness;

    // Add the path to the SVG
    svg.appendChild(pathElement);

    // Return the path element in case we want to remove or modify it later
    return pathElement;
}





class ScriptBlock extends ExecutionNode {

    _nodeValue = null
    _textarea = null
    constructor() {
        super()
        this.changeStauts('new')

        // Create textarea
        const textarea = document.createElement('textarea');
        textarea.style.width = '90%';
        textarea.style.height = '60px';
        textarea.style.margin = '5px';
        textarea.style.resize = 'none';
        this._textarea = textarea
        this._htmlElement.appendChild(textarea);

        // Store reference to textarea
        this.textarea = textarea;

        // // Add execute button
        // const executeButton = document.createElement('button');
        // executeButton.textContent = 'Execute';
        // executeButton.style.margin = '5px';
        // executeButton.addEventListener('click', () => this.execute());
        // node.element.appendChild(executeButton);

        // Add output pin
        this.addPin('output');

        // Adjust node size
        this._htmlElement.style.width = '150px';
        this._htmlElement.style.height = 'auto';
    }   
    async execute() {
        this.changeStauts('progress')
        this._nodeValue = await Utils.executePythonCode(`${this.textarea.value}\nprint('ok')`)

        this.propagateValue(this._nodeValue)
        this.changeStauts('success')
    }
    async getNodeValue() {
        if (this._nodeValue == null) {
            this._nodeValue = Utils.executePythonCode(this.textarea.value)
        }
        return this._nodeValue

    }

}




function makeDraggableCanvas() {
    let isCanvasDragging = false;
    let startX, startY;


    document.addEventListener('mousedown', startCanvasDrag);
    document.addEventListener('mousemove', dragCanvas);
    document.addEventListener('mouseup', endCanvasDrag);
    document.addEventListener('wheel', zoom);

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
        const { globalPosition, nodes } = globalState
        nodes.forEach(n => {
            n.element.style.transform = `translate(${(globalState.globalPosition.x + n.x) * globalState.globalZoom}px, ${(globalPosition.y + n.y) * globalState.globalZoom}px) scale(${globalState.globalZoom})`;
        });
        globalState.connections.forEach(Utils.updateConnection);
    }
}
makeDraggableCanvas()

// const nodeWrapper2 = document.createElement('div')
// nodeWrapper2.style.background = 'green'
// nodeWrapper2.style.width = '100px'
// nodeWrapper2.style.height = '100px'
// nodeWrapper2.style.position = 'absolute'
// nodeWrapper2.style.left = '300px'
// container.appendChild(nodeWrapper2)
// connectElements(nodeWrapper, nodeWrapper2)

// console.log('ok')


// class Components {
//     static 
// }


class Main {
    static main() {
        // Blocks.createNode({ x: 10, y: 20 })
        new ScriptBlock()
        new DisplayBlock();
        // window.sendCode = (code) => Server.executePythonCode(code).then(console.log)
        // pin1 = addPin(node, 'input')
        // pin2 = addPin(node, 'output')
        // const node2 = createNode({ x: 100, y: 100})
        // setInitialNodeTransform(node2);
        // nodes.push(node2)
        // pin3 = addPin(node2)

        // const blockNode = Blocks.createTableNode({ x: 200, y: 200});
        // setInitialNodeTransform(blockNode)
        // nodes.push(blockNode)

    }
}

Main.main()

new EventSource('/esbuild').addEventListener('change', () => location.reload())