import { Blocks } from "./Blocks"
import { Utils } from "./Utils"

export class ExecutionNode {
    _position = null
    _htmlElement = null
    _titleElement = null
    _pins = []
    _listeners = []
    constructor(title = 'unknown') {
        const node = Blocks.createNode({ x: 10, y: 10, title: title})
        this._position = { x: node.x, y: node.y }
        this._htmlElement = node.element
        this._titleElement = node.titleElement
        this._pins = node.pins
        let buttonElement = document.createElement('button');
        buttonElement.textContent = 'e'
        buttonElement.addEventListener('click', () => {
            this._listeners.forEach(l => {
                l()
            })
        })
        this._titleElement.style.width = '100%'
        this._titleElement.appendChild(buttonElement)
    }

    changeStauts(status) {
        if (status === 'success') {
            this._htmlElement.style.background = '#0D9276'
        } else if (status === 'new') {
            this._htmlElement.style.background = '#667BC6'
        } else if (status === 'progress') {
            this._htmlElement.style.background = '#F4A261'
        }
    }
    addPin(type, title = 'pin') {
        Utils.addPin({ element: this._htmlElement }, type, title)
    }   
    onExecution(listener) {
        this._listeners.push(listener)
    }
}