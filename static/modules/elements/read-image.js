import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb, ImageOutput} from "./transformer.js";
import {Image} from "../types.js";

export class ReadImageEb extends TransformerEb {
    constructor(parent) {
        super(parent, "Read Image", [], [new ImageOutput("image")]);
        this.processFn = this.process.bind(this);
        this.image = null;
    }

    process() {
        return [this.image];
    }

    imageChanged(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        createImageBitmap(file).then(((bmp) => {
            // Draw the image into the src-image canvas.
            var canvas = document.createElement("canvas");
            canvas.width = bmp.width;
            canvas.height = bmp.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(bmp, 0, 0);
            this.image = new Image(ctx.getImageData(0, 0, canvas.width, canvas.height));
            this.update();
        }).bind(this));
    }

    render() {
        return html`
        <input id="file-input" type="file" accept="image/*" @change="${this.imageChanged.bind(this)}"></input>
        `
    }
}
customElements.define("read-image-eb", ReadImageEb);