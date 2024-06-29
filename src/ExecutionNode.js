import { Blocks } from "./Blocks"
import { Connection } from "./Connection"
import { globalState } from "./GlobalState"
import { Pin } from "./Pin"
import { Utils } from "./Utils"

export class ExecutionNode {
    _title
    _position = null
    _htmlElement = null
    _titleElement = null
    /**
     * @type {Array<Pin>}
     */
    _pins = []
    constructor(title = 'unknown') {
        const node = Blocks.createNode({ x: 10, y: 10, title: title})
        this._title = title
        this._position = { x: node.x, y: node.y }
        this._htmlElement = node.element
        this._titleElement = node.titleElement
        this._pins = node.pins
        let buttonElement = document.createElement('button');
        buttonElement.textContent = 'e'
        buttonElement.addEventListener('click', () => {
            this.execute()
        })
        this._titleElement.style.width = '100%'
        this._titleElement.appendChild(buttonElement)
        globalState.nodeObjects.push(this)
    }

    toJSON() {
        return {
            x: this._position.x,
            y: this._position.y,
            title: this._title,
        }
    }

    setPosition(x, y) {
        this._position.y = x
        this._position.y = y
        this._htmlElement.style.transform = `translate(${x}px, ${y}px)`;
    }

    changeStatus(status) {
        if (status === 'success') {
            this._htmlElement.style.background = '#0D9276'
        } else if (status === 'new') {
            this._htmlElement.style.background = '#667BC6'
        } else if (status === 'progress') {
            this._htmlElement.style.background = '#F4A261'
        }
    }
    async execute() {
        throw new Error('not implemented')
    }
    /**
     * 
     * @typedef {'input' | 'output'} SortOrder
     * @param {SortOrder} type 
     * @param {string} title
     */
    addPin(type, title = 'pin') {
        this._pins.push(new Pin(this, title, type))
    }   
    async onExecution() {
        await this.execute()
    }

    setPinsValue(value) {
        this._pins.filter(p=> p.type ==='output').forEach(p => {
            p.value = value
        })
    }

    async propagateValue(value) {
        this.setPinsValue(value)
        for await (const pin of this._pins.filter(p=> p.type ==='output')) {
            for await (const connection of pin.connections) {
                connection.to.value = pin.value

                await connection.to.ownerNode.execute()
            }
        }
    }
}