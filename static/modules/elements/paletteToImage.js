import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb, PaletteInput, ImageOutput} from "./transformer.js";

export class PaletteToImageEb extends TransformerEb {
    constructor(parent) {
        super(parent, "Palette to Image", [new PaletteInput("palette")], [new ImageOutput("image")]);
        this.processFn = PaletteToImageEb.process;
        this._pixels = 50;
    }

    get pixels() {
        return this._pixels;
    }
    set pixels(pixels) {
        this._pixels = pixels;
        this.update();
    }

    static process(palette) {
        return [palette.makeImage(this.pixels)];
    }

    render() {
        return html`
          <div>
            Pixels: <input type="number" value=${this.pixels} @change="${(e) => this.pixels = e.target.value}"></input>
          </div>
        `
    }
}
customElements.define("palette-to-image-eb", PaletteToImageEb);