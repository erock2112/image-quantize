import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ImageOutput} from "./transformer.js";
import {Image} from "../types.js";

export class ReadImageEb extends TransformerEb {
    constructor() {
        super("Read Image", [], [new ImageOutput("image")]);
        this._process = () => [this.image];
        this._renderContent = () => html`
            <input id="file-input" type="file" accept="image/*" @change="${this.imageChanged.bind(this)}"></input>
        `
        this.image = null;
    }

    imageChanged(event) {
        const file = event.target.files[0];
        if (!file) {
            this.image = null;
            this.process();
            return;
        }
        createImageBitmap(file).then(((bmp) => {
            var canvas = document.createElement("canvas");
            canvas.width = bmp.width;
            canvas.height = bmp.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(bmp, 0, 0);
            this.image = new Image(ctx.getImageData(0, 0, canvas.width, canvas.height));
            this.process(true);
        }).bind(this));
    }
}
registerProcessor("read-image-eb", ReadImageEb);