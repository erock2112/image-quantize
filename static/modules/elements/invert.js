import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb, ImageInput, ImageOutput} from "./transformer.js";

export class InvertEb extends TransformerEb {
    constructor(parent) {
        super(parent, "Invert", [new ImageInput("image")], [new ImageOutput("image")]);
        this.processFn = InvertEb.process;
    }

    static process(image) {
        return [image.map((color) => color.invert())];
    }

    render() {
        return html``
    }
}
customElements.define("invert-eb", InvertEb);