import { Pin } from "./Pin";

class GlobalState {
    connections = [];
    globalPosition = {
        x: 0,
        y: 0
    }
    globalZoom = 1;
    nodes = []
    draggingPin = null
    tempPath = null
     /** @type {Array<Pin>} */
    pins = []
    
}

export const globalState = new GlobalState()