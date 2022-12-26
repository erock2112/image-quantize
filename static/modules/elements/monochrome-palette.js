import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, PaletteOutput, ColorInput} from "./transformer.js";
import {monochrome} from "../palette.js";
import { Color } from "../types.js";

export class MonochromePaletteEb extends TransformerEb {
    constructor() {
        super("Monochrome Palette", [new ColorInput("color")], [new PaletteOutput("palette")]);
        this._process = (color) => {
            return [monochrome(color, this._numColors)];
        };
        this._renderContent = () => html`
            <div>
                Steps: <input type="number" value=${this.numColors} @change="${(e) => this.numColors = e.target.value}"></input>
            </div>
        `
        this._numColors = 4;
        this._color = new Color(55, 122, 76, 255);
    }

    get numColors() {
        return this._numColors;
    }
    set numColors(numColors) {
        this._numColors = numColors;
        this.process();
    }
}
registerProcessor("monochrome-palette-eb", MonochromePaletteEb);