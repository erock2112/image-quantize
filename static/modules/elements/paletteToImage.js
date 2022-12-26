import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, PaletteInput, ImageOutput} from "./transformer.js";

export class PaletteToImageEb extends TransformerEb {
    constructor() {
        super("Palette to Image", [new PaletteInput("palette")], [new ImageOutput("image")]);
        this._process = (palette) => [palette.makeImage(this.pixels)];
        this._renderContent = () => html`
            <div>
                Pixels: <input type="number" value=${this.pixels} @change="${(e) => this.pixels = e.target.value}"></input>
            </div>
        `
        this._pixels = 50;
    }

    get pixels() {
        return this._pixels;
    }
    set pixels(pixels) {
        this._pixels = pixels;
        this.update();
    }
}
registerProcessor("palette-to-image-eb", PaletteToImageEb);