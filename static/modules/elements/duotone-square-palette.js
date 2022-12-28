import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, PaletteOutput, ColorInput} from "./transformer.js";
import { duotoneSquare } from "../palette.js";

export class DuoToneSquarePalette extends TransformerEb {
    constructor() {
        super("Duotone Square Palette", [new ColorInput("color1"), new ColorInput("color2")], [new PaletteOutput("palette")]);
        this._process = (color1, color2) => [duotoneSquare(color1, color2, this.numColors)];
        this._renderContent = () => html`
            <div>
                Steps: <input type="number" value=${this.numColors} @change="${(e) => this.numColors = e.target.value}"></input>
            </div>
        `
        this._numColors = 4;
    }

    get numColors() {
        return this._numColors;
    }
    set numColors(numColors) {
        this._numColors = numColors;
        this.process(true);
    }
}
registerProcessor("duotone-square-palette-eb", DuoToneSquarePalette);