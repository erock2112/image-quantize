import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb} from "./transformer.js";

export class GreyscaleEb extends TransformerEb {
    constructor() {
        super("Greyscale");
    }

    process(image) {
        return image.map((color) => color.greyscale());
    }

    render() {
        return html``
    }
}
customElements.define("greyscale-eb", GreyscaleEb);