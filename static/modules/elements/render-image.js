import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ImageInput} from "./transformer.js";

export class RenderImageEb extends TransformerEb {
    constructor() {
        super("Render Image", [new ImageInput("image")], []);
        this._preProcess = () => {
            if (this.canvas) {
                this.canvas.style.display = "none";
            }
            this.hasImage = false;
        }
        this._process = (image) => {
            image.draw(this.canvas);
            this.canvas.style.display = "block";
            this.hasImage = true;
            return [];
        };
        this._renderContent = () => html`
            <canvas style="display:none"></canvas>
            <button @click="${() => this.download()}" style="visibility:${this.hasImage ? "visible" : "hidden"}">Download</button>
        `;
        this.canvas = null;
        this.hasImage = false;
    }

    static properties = {
        hasImage: {type: Boolean},
    };

    updated() {
        super.updated();
        this.canvas = this.shadowRoot.querySelector("canvas");
    }

    download() {
        if (!this.hasImage) {
            return;
        }
        const a = document.createElement("a");
        a.download = "edited.jpg";
        a.href = canvas.toDataURL();
        a.click();
    }
}
registerProcessor("render-image-eb", RenderImageEb);