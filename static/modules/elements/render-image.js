import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ImageInput} from "./transformer.js";

export class RenderImageEb extends TransformerEb {
    static maxDisplayWidth = 400;
    static maxDisplayHeight = 300;

    constructor() {
        super("Render Image", [new ImageInput("image")], []);
        this.displayCanvas = null;
        this.fullSizeCanvas = null;
        this.hasImage = false;
        this._preProcess = () => {
            this.fullSizeCanvas = null;
            this.hasImage = false;
        }
        this._process = (image) => {
            // Draw the image into the full-size, off-screen canvas.
            const fullSizeCanvas = document.createElement("canvas");
            image.draw(fullSizeCanvas);
            this.fullSizeCanvas = fullSizeCanvas;

            // Scale the full size canvas down into the display canvas.
            const scaleX = RenderImageEb.maxDisplayWidth / fullSizeCanvas.width;
            const scaleY = RenderImageEb.maxDisplayHeight / fullSizeCanvas.height;
            let scale = Math.min(scaleX, scaleY);
            if (scale > 1) {
                scale = 1;
            }
            this.displayCanvas.width = fullSizeCanvas.width * scale;
            this.displayCanvas.height = fullSizeCanvas.height * scale;
            const ctx = this.displayCanvas.getContext("2d");
            ctx.drawImage(fullSizeCanvas, 0, 0, fullSizeCanvas.width, fullSizeCanvas.height, 0, 0, this.displayCanvas.width, this.displayCanvas.height);

            this.hasImage = true;
            return [];
        };
        this._renderContent = () => html`
            <canvas
                style="visibility:${this.hasImage ? "visible" : "hidden"}"
                width="${RenderImageEb.maxDisplayWidth}"
                height="${RenderImageEb.maxDisplayHeight}"
                ></canvas>
            <button @click="${() => this.download()}" style="visibility:${this.hasImage ? "visible" : "hidden"}">Download</button>
        `;
    }

    static properties = {
        hasImage: {type: Boolean},
    };

    updated() {
        super.updated();
        this.displayCanvas = this.shadowRoot.querySelector("canvas");
    }

    download() {
        if (!this.fullSizeCanvas) {
            return;
        }
        const a = document.createElement("a");
        a.download = "edited.jpg";
        a.href = this.fullSizeCanvas.toDataURL();
        a.click();
    }
}
registerProcessor("render-image-eb", RenderImageEb);