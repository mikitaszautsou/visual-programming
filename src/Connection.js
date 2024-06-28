import { ExecutionNode } from "./ExecutionNode";
import { Pin } from "./Pin";

export class Connection {


    /**
     * @type {Pin}
     */
    from

    
    /**
     * @type {Pin}
     */
    to

    /**
     * @type {SVGElement}
     */
    htmlElement

    /**
     * 
     * @param {Pin} from 
     * @param {Pin} to
     * @param {SVGElement} element 
     */
    constructor(from, to, element) {
        this.from = from
        this.to = to
        this.element = element
    }
}