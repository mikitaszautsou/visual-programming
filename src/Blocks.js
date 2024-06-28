import { globalState } from "./GlobalState";
import { Utils } from "./Utils";

/**
 * @deprecated
 */
export class Blocks {
    static createValueNode({ x, y, value }) {
        const node = createNode({ x, y })

    }

    static createTableNode({ x, y }) {
        const node = createNode({ x, y })
        // Create table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        const rows = 3
        const cols = 3
        // Create rows and cells
        for (let i = 0; i < rows; i++) {
            const row = table.insertRow();
            for (let j = 0; j < cols; j++) {
                const cell = row.insertCell();
                cell.textContent = `${i + 1},${j + 1}`;
                cell.style.border = '1px solid black';
                cell.style.padding = '2px';
                cell.style.textAlign = 'center';
            }
        }

        // Append table to node
        node.element.appendChild(table);

        // Adjust node size to fit table
        node.element.style.width = 'auto';
        node.element.style.height = 'auto';
        node.element.style.padding = '5px';

        return node;
    }

    static createNode({ x, y, title }) {
        const node = Utils.createNode({ x: 10, y: 10, titleValue: title })
        Utils.setInitialNodeTransform(node);
        globalState.nodes.push(node)
        return node
    }
}
