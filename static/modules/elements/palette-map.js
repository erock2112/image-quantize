import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {PaletteInput, PaletteMapOutput, TransformerEb} from "./transformer.js";
import { Color, PaletteMap } from "../types.js";

export class PaletteMapEb extends TransformerEb {
    constructor() {
        super("Palette Mapping", [new PaletteInput("palette1"), new PaletteInput("palette2")], [new PaletteMapOutput("paletteMap")]);
        this._algorithms = [
            ["luminosity", PaletteMap.byLuminosity],
        ];
        this._selectedIndex = 0;
        this._process = (palette1, palette2) => {
            return [this._algorithms[this.selectedIndex][1](palette1, palette2)];
        };
        this._renderContent = () => html`
            <div>
                Algorithm:
                <select @change="${(e) => this.selectedIndex = e.target.selectedIndex}">
                    ${this._algorithms.map((algo, index) => html`
                    <option ?selected="${this.selectedIndex == index}">${algo[0]}</option>
                    `)}
                </select>
            </div>
        `
        this._color = Color.random();
    }

    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(idx) {
        this._selectedIndex = idx;
        this.process(true);
    }
}
registerProcessor("palette-map-eb", PaletteMapEb);