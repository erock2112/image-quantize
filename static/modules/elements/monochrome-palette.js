import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, PaletteOutput, ColorInput} from "./transformer.js";
import {monochrome} from "../palette.js";

export class MonochromePaletteEb extends TransformerEb {
    constructor() {
        super("Monochrome Palette", [new ColorInput("color")], [new PaletteOutput("palette")]);
        this._process = (color) => [
            monochrome(color, this.numColors, this.includeBlack, this.includeWhite)];
        this._renderContent = () => html`
            <div>
                Steps: <input type="number" value=${this.numColors} @change="${(e) => this.numColors = e.target.value}"></input>
            </div>
            <div>
                Include White
                <input type="checkbox"
                    ?checked="${this.includeWhite}"
                    @change="${(e) => this.includeWhite = e.target.checked}"></input>
            </div>
            <div>
                Include Black
                <input type="checkbox"
                    ?checked="${this.includeBlack}"
                    @change="${(e) => this.includeBlack = e.target.checked}"></input>
            </div>
        `
        this._numColors = 4;
        this._includeWhite = true;
        this._includeBlack = true;
    }

    get numColors() {
        return this._numColors;
    }
    set numColors(numColors) {
        this._numColors = numColors;
        this.process(true);
    }

    get includeBlack() {
        return this._includeBlack
    }
    set includeBlack(includeBlack) {
        this._includeBlack = includeBlack;
        this.process(true);
    }

    get includeWhite() {
        return this._includeWhite
    }
    set includeWhite(includeWhite) {
        this._includeWhite = includeWhite;
        this.process(true);
    }
}
registerProcessor("monochrome-palette-eb", MonochromePaletteEb);