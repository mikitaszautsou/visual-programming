import { Connection } from "./Connection";
import { globalState } from "./GlobalState";

export class Utils {
    static async executePythonCode(value) {

        const response = await fetch('http://localhost:3000/execute', {
            method: 'POST',
            body: value,
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.text()  
    }
    static async saveState(state) {

        const response = await fetch('http://localhost:3000/save', {
            method: 'POST',
            body: JSON.stringify(state, null, 2),
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.text()  
    }
    static async loadState(state) {

        const response = await fetch('http://localhost:3000/load', {
            method: 'POST',
            body: state,
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.text()  
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
        path.setAttribute('d', pathD);
        path.style.strokeWidth = 2 * globalState.globalZoom; // Adjust stroke width based on zoom
    }

    static createNode({ x, y, titleValue = 'unknown' }) {
        const container = document.getElementById('app');
        const nodeWrapper = document.createElement('div');
        nodeWrapper.style.background = 'green';
        nodeWrapper.style.position = 'absolute';
        nodeWrapper.style.transform = `translate(${x}px, ${y}px)`;
        nodeWrapper.style.display = `flex`;
        nodeWrapper.style.flexDirection = `column`;
        nodeWrapper.style.alignItems = 'center';

        const title = document.createElement('div');
        title.textContent = titleValue;
        title.style.display = 'flex'
        title.style.justifyContent = 'center'
        title.style.cursor = 'move'; // Change cursor to indicate draggable
        nodeWrapper.appendChild(title);

        nodeWrapper.style.width = '100px';
        nodeWrapper.style.height = '120px';
        container.appendChild(nodeWrapper);

        const node = { x, y, element: nodeWrapper, titleElement: title, pins: [] };

        // Add dragging functionality
        let isDragging = false;
        let startX, startY;

        title.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);

        function startDrag(e) {
            isDragging = true;
            startX = e.clientX - node.x;
            startY = e.clientY - node.y;
            e.preventDefault(); // Prevent text selection during drag
        }

        function drag(e) {
            if (!isDragging) return;

            node.x = (e.clientX - startX) / globalState.globalZoom;
            node.y = (e.clientY - startY) / globalState.globalZoom;
            nodeWrapper.style.transform = `translate(${(globalState.globalPosition.x + node.x) * globalState.globalZoom}px, ${(globalState.globalPosition.y + node.y) * globalState.globalZoom}px) scale(${globalState.globalZoom})`;

            globalState.connections.forEach(Utils.updateConnection);
            e.stopPropagation();
        }

        function endDrag() {
            isDragging = false;
        }
        return node;
    }

    static setInitialNodeTransform(node) {
        const { globalPosition } = globalState
        node.element.style.transform = `translate(${(globalState.globalPosition.x + node.x) * globalState.globalZoom}px, ${(globalPosition.y + node.y) * globalState.globalZoom}px) scale(${globalState.globalZoom})`;

    }

    static addPin({ element: target }, type, title) {
        const pinBlock = document.createElement('div')
        pinBlock.textContent = title
        pinBlock.style.display = 'flex'
        pinBlock.style.position = 'relative'
        pinBlock.style.justifyCenter = 'center'
        pinBlock.style.width = '100%'

        const pinCircle = document.createElement('div')
        if (type == 'output') {
            Object.assign(pinCircle.style, {
                width: '10px',
                height: '10px',
                background: 'blue',
                position: 'absolute',
                right: '-5px',
                top: '50%',
                borderRadius: "50%",
                transform: 'translateY(-50%)'
            })
        } else {
            Object.assign(pinCircle.style, {
                width: '10px',
                height: '10px',
                background: 'blue',
                position: 'absolute',
                left: '-10px',
                top: '50%',
                borderRadius: "50%",
                transform: 'translateY(-50%)'
            })
        }
        pinBlock.appendChild(pinCircle)
        pinCircle.classList.add('pin-circle');
        pinCircle.addEventListener('mousedown', Utils.startPinDrag);

        target.appendChild(pinBlock)
        return { pinBlock, pinCircle }

    }

    static startPinDrag(e) {
        e.stopPropagation();
        globalState.draggingPin = e.target;

        // Create temporary SVG path
        let svg = Utils.getOrCreateSVG();
        globalState.tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        globalState.tempPath.style.fill = 'none';
        globalState.tempPath.style.stroke = 'black';
        globalState.tempPath.style.strokeWidth = 2;
        svg.appendChild(globalState.tempPath);

        document.addEventListener('mousemove', Utils.dragPin);
        document.addEventListener('mouseup', Utils.endPinDrag);
    }

    static dragPin(e) {
        if (!globalState.draggingPin) return;

        const startRect = globalState.draggingPin.getBoundingClientRect();
        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;

        const endX = e.clientX;
        const endY = e.clientY;

        // Update temporary path
        const pathD = `M ${startX} ${startY} C ${(startX + endX) / 2} ${startY}, ${(startX + endX) / 2} ${endY}, ${endX} ${endY}`;
        globalState.tempPath.setAttribute('d', pathD);
    }
    static connectPins(pin1, pin2, color = 'black', thickness = 2) {
        let svg = Utils.getOrCreateSVG();
    
        const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathElement.style.fill = 'none';
        pathElement.style.stroke = color;
        pathElement.style.strokeWidth = thickness;
    
        svg.appendChild(pathElement);
    
        const connection = { pin1, pin2, path: pathElement };
        globalState.connections.push(connection);
        Utils.updateConnection(connection);
    
        const pin1Obj = globalState.pins.find(p => p._htmlElement === pin1)
        const pin2Obj = globalState.pins.find(p => p._htmlElement === pin2)
        const connectionObj = new Connection(pin1Obj, pin2Obj, connection.path)
        pin1Obj.connections.push(connectionObj)
        pin2Obj.connections.push(connectionObj)

        return pathElement;
    }
    

    static endPinDrag(e) {
        if (!globalState.draggingPin) return;

        // Check if the mouse is over another pin
        const endPin = document.elementFromPoint(e.clientX, e.clientY);
        if (endPin && endPin.classList.contains('pin-circle') && endPin !== globalState.draggingPin) {
            Utils.connectPins(globalState.draggingPin, endPin);
        }

        // Remove temporary path
        if (globalState.tempPath) {
            globalState.tempPath.remove();
            globalState.tempPath = null;
        }

        globalState.draggingPin = null;
        document.removeEventListener('mousemove', Utils.dragPin);
        document.removeEventListener('mouseup', Utils.endPinDrag);
    }

    static getOrCreateSVG() {
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
        return svg;
    }
}