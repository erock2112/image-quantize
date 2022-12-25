import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb} from "./transformer.js";

export class InvertEb extends TransformerEb {
    constructor() {
        super("Invert");
    }

    process(image) {
        return image.map((color) => color.invert());
    }

    render() {
        return html``
    }
}
customElements.define("invert-eb", InvertEb);