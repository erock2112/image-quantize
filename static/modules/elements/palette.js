import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { analogous, complementary, diad, splitComplementary, triadic } from "../palette.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ColorInput, PaletteOutput} from "./transformer.js";

export class Palette extends TransformerEb {
    constructor() {
        super("Palette", [new ColorInput("image")], [new PaletteOutput("image")]);
        this.filters = [
            ["analogous", analogous],
            ["diad", diad],
            ["complementary", complementary],
            ["split complementary", splitComplementary],
            ["triadic", triadic],
        ];
        this._selectedIndex = 0;
        this._process = (color) => [this.filters[this.selectedIndex][1](color)];
        this._renderContent = () => html`
        <div>
            Filter:
            <select @change="${(e) => this.selectedIndex = e.target.selectedIndex}">
                ${this.filters.map((filter, index) => html`
                <option ?selected="${this.selectedIndex == index}">${filter[0]}</option>
                `)}
            </select>
        </div>
    `
    }

    static properties = {
        _selectedIndex: {type: Number},
    }

    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(idx) {
        this._selectedIndex = idx;
        this.process(true);
    }
}
registerProcessor("palette-eb", Palette);