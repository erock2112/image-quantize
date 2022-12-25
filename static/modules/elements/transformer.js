import {css, html, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import "./icons/delete.js";
import "./icons/expand-less.js";
import "./icons/expand-more.js";

export class TransformerEb extends LitElement {
    constructor(numColors) {
        super();
        this.name = "Quantize";
        this._numColors = numColors || 4;
    }

    get numColors() {
        return this._numColors;
    }
    set numColors(numColors) {
        console.log("Set numColors "+numColors);
        this._numColors = numColors;
    }

    static properties = {
        name: {type: String},
    };

    transform(image) {
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
customElements.define('transformer-eb', TransformerEb);
