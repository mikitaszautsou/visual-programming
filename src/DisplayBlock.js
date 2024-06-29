import { ExecutionNode } from "./ExecutionNode";
import { Utils } from "./Utils";

export class DisplayBlock extends ExecutionNode {

    _nodeValue = null
    _displayBlock = null
    _target = null
    constructor() {
        super()
        this.changeStatus('new')


        const configureButton = document.createElement('button');
        configureButton.textContent = 'C'

        this._titleElement.appendChild(configureButton)
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
        this._htmlElement.appendChild(this._displayBlock);

        // Store reference to textarea

        // // Add execute button
        // const executeButton = document.createElement('button');
        // executeButton.textContent = 'Execute';
        // executeButton.style.margin = '5px';
        // executeButton.addEventListener('click', () => this.execute());
        // this.element.appendChild(executeButton);

        // Add output pin
        this.addPin('input', 'input');

        // Adjust node size
        this._htmlElement.style.width = '150px';
        this._htmlElement.style.height = 'auto';

    }
    async getNodeValue() {
        

    }

    async execute() {
        const { _displayBlock } = this;
        this.changeStatus('progress')
        const inputPin = this._pins.find(p => p.type === 'input')
        const value = inputPin.value
        _displayBlock.textContent = value
        this.changeStatus('success')
    }

    toJSON() {
        return {
            x: this._position.x,
            y: this._position.y,
            title: this._title,
        }
    }

}