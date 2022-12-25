import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb, ImageInput, ImageOutput} from "./transformer.js";

export class InvertEb extends TransformerEb {
    constructor() {
        super("Invert", [new ImageInput("image")], [new ImageOutput("image")], InvertEb.process);
    }

    static process(image) {
        console.log("process invert");
        return [image.map((color) => color.invert())];
    }

    render() {
        return html``
    }
}
customElements.define("invert-eb", InvertEb);