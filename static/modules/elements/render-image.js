import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb, ImageInput, ImageOutput} from "./transformer.js";

export class RenderImageEb extends TransformerEb {
    constructor() {
        super("RenderImage", [new ImageInput("image")], [], RenderImageEb.process);
    }

    static process(image) {
        console.log("process render-image");
        const canvas = this.shadowRoot.getElementsByTagName("canvas")[0];
        image.draw(canvas);
    }

    render() {
        return html`
            <canvas></canvas>
        `
    }
}
customElements.define("render-image-eb", RenderImageEb);