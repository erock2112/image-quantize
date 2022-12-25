import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb} from "./transformer.js";
import {invert} from "../invert.js";

export class InvertEb extends TransformerEb {
    constructor() {
        super("Invert");
    }

    process(image) {
        return invert(image);
    }

    render() {
        return html``
    }
}
customElements.define("invert-eb", InvertEb);