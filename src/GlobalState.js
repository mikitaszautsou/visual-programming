import { Connection } from "./Connection";
import { ExecutionNode } from "./ExecutionNode";
import { Pin } from "./Pin";
import { Utils } from "./Utils";

class GlobalState {
    /**
     * @type {Array<Connection>}
     */
    connections = [];
    globalPosition = {
        x: 0,
        y: 0
    }
    globalZoom = 1;

    nodes = []
        /**
     * @type {Array<ExecutionNode>}
     */
    nodeObjects = []
    draggingPin = null
    tempPath = null
     /** @type {Array<Pin>} */
    pins = []


    async store() {
    //   console.log({ nodes: this.nodeObjects })

        const stateObject = {
            nodes: this.nodeObjects.map(n => n.toJSON())
        }
        await Utils.saveState(stateObject)
        console.log(stateObject)
        // fs.writeFileSync('store.json', JSON.stringify(stateObject, null, 2))
    }
    
}

export const globalState = new GlobalState()