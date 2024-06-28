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
    
}

export const globalState = new GlobalState()