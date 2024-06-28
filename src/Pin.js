import { Connection } from "./Connection"
import { ExecutionNode } from "./ExecutionNode"
import { globalState } from "./GlobalState"
import { Utils } from "./Utils"

export class Pin {

    name
    type
    _pinBlock
    _pinCircle
    /**
     * @type {ExecutionNode}
     */
    ownerNode
    value
    /**
     * @type {HTMLElement}
     */
    _htmlElement

    /**
     * @type {Array<Connection>}
     */
    connections = []

    /**
     * 
     * @param {ExecutionNode} node 
     * @param {string} name 
     * @param {'input' | 'output'}  type 
     */
    constructor(node, name, type) {
        this.name = name
        this.type = type
        const { pinBlock, pinCircle} = Utils.addPin({ element: node._htmlElement }, type, name)
        this._pinBlock = pinBlock
        this._pinCircle = pinCircle
        this.ownerNode = node
        this._htmlElement = pinCircle
        globalState.pins.push(this)
    }

}