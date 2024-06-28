import { ExecutionNode } from "./ExecutionNode";
import { Utils } from "./Utils";

export class DisplayBlock {

    _nodeValue = null
    _displayBlock = null
    _target = null
    constructor() {
        const node = new ExecutionNode('display')
        this.node = node;
        this.node.changeStauts('new')


        const configureButton = document.createElement('button');
        configureButton.textContent = 'C'

        this.node._titleElement.appendChild(configureButton)
        configureButton.addEventListener('click', () => {
            this._target = prompt('Targt')
            console.log(this._target)
        })
        // Create textarea
        this._displayBlock = document.createElement('div');
        this._displayBlock.style.width = '100px'
        this._displayBlock.style.height = '100px'
        this._displayBlock.textContent = 'NOTHING'
        this._displayBlock.style.justifyContent = 'center'
        this._displayBlock.style.display = 'flex'
        this._displayBlock.style.alignItems = 'center'
        this._displayBlock.style.background = 'white'
        node._htmlElement.appendChild(this._displayBlock);

        // Store reference to textarea

        // // Add execute button
        // const executeButton = document.createElement('button');
        // executeButton.textContent = 'Execute';
        // executeButton.style.margin = '5px';
        // executeButton.addEventListener('click', () => this.execute());
        // node.element.appendChild(executeButton);

        // Add output pin
        node.addPin('input', 'input');

        // Adjust node size
        node._htmlElement.style.width = '150px';
        node._htmlElement.style.height = 'auto';
        node.onExecution(async () => {
            node.changeStauts('progress')
            this._nodeValue = await Utils.executePythonCode(`${this.textarea.value}\nprint('ok')`)
            node.changeStauts('success')
        })
    }
    async getNodeValue() {
        if (this._nodeValue == null) {
            this._nodeValue = Utils.executePythonCode(this.textarea.value)
        }
        return this._nodeValue

    }

}