import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {TransformerEb} from "./transformer.js";
import {quantize} from "../quantize.js";

export class QuantizeEb extends TransformerEb {
    constructor() {
        super("Quantize");
        this._numColors = 4;
    }

    get numColors() {
        return this._numColors;
    }
    set numColors(numColors) {
        console.log("Set numColors "+numColors);
        this._numColors = numColors;
    }

    process(image) {
        const quantizedPalette = quantize(image, this.numColors, 200);
        return quantizedPalette.apply(image);
    }

    render() {
        return html`
          <div>
            Colors: <input id="size-input" type="number" value=${this.numColors} @change="${(e) => this.numColors = e.target.value}"></input>
          </div>
        `
    }
}
customElements.define("quantize-eb", QuantizeEb);