import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb, ImageInput, ImageOutput} from "./transformer.js";

export class GreyscaleEb extends TransformerEb {
    constructor(parent) {
        super(parent, "Greyscale", [new ImageInput("image")], [new ImageOutput("image")]);
        this.processFn = GreyscaleEb.process;
    }

    static process(image) {
        return [image.map((color) => color.greyscale())];
    }

    render() {
        return html``
    }
}
customElements.define("greyscale-eb", GreyscaleEb);