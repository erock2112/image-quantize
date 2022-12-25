import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb, ImageInput, ImageOutput, PaletteOutput} from "./transformer.js";
import {quantize} from "../quantize.js";

export class QuantizeEb extends TransformerEb {
    constructor() {
        super("Quantize", [new ImageInput("image")], [new ImageOutput("image"), new PaletteOutput("palette")], QuantizeEb.process);
        this._numColors = 4;
    }

    get numColors() {
        return this._numColors;
    }
    set numColors(numColors) {
        this._numColors = numColors;
        this.update();
    }

    static process(image) {
        console.log("process quantize");
        const quantizedPalette = quantize(image, this.numColors, 200);
        return [quantizedPalette.apply(image), quantizedPalette];
    }

    render() {
        return html`
          <div>
            Colors: <input type="number" value=${this.numColors} @change="${(e) => this.numColors = e.target.value}"></input>
          </div>
        `
    }
}
customElements.define("quantize-eb", QuantizeEb);