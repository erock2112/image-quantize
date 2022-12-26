import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ImageInput} from "./transformer.js";

export class RenderImageEb extends TransformerEb {
    constructor() {
        super("Render Image", [new ImageInput("image")], []);
        this._process = (image) => {
            const canvas = this.shadowRoot.querySelector("#" + this.canvasId);
            image.draw(canvas);
            this.hasImage = true;
            return [];
        };
        this._renderContent = () => html`
            <canvas id="${this.canvasId}"></canvas>
            <button @click="${() => this.download()}" style="visibility:${this.hasImage ? "visible" : "hidden"}">Download</button>
        `
        this.canvasId = (() => {
            const chars = "abcdefghijklmnopqrstuvwxyz";
            let id = "";
            for (let i = 0; i < 12; i++) {
                const idx = Math.floor(Math.random() * chars.length);
                const char = chars[idx];
                id += char;
            }
            return id;
        })();
        this.hasImage = false;
    }

    download() {
        if (!this.hasImage) {
            return;
        }
        const canvas = this._parent.shadowRoot.querySelector("#" + this.canvasId);
        const a = document.createElement("a");
        a.download = "edited.jpg";
        a.href = canvas.toDataURL();
        a.click();
    }
}
registerProcessor("render-image-eb", RenderImageEb);