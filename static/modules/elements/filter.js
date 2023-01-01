import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import { Color } from "../types.js";
import {TransformerEb, ImageInput, ImageOutput} from "./transformer.js";

export class FilterEb extends TransformerEb {
    constructor() {
        super("Filter", [new ImageInput("image")], [new ImageOutput("image")]);
        this.filters = [
            ["greyscale", (color) => color.greyscale()],
            ["sepia", (color) => color.sepia()],
            ["invert", (color) => color.invert()],
            ["saturation", (color) => {
                const hsl = color.hsl();
                hsl[1] *= this.parameterValue;
                return Color.fromHsl(hsl[0], hsl[1], hsl[2]);
            }, "Saturation"],
            ["hue rotation", (color) => {
                const hsl = color.hsl();
                hsl[0] *= this.parameterValue;
                return Color.fromHsl(hsl[0], hsl[1], hsl[2]);
            }, "Hue rotation"],
            ["lightness", (color) => {
                const hsl = color.hsl();
                hsl[2] *= this.parameterValue;
                return Color.fromHsl(hsl[0], hsl[1], hsl[2]);
            }, "Lightness"],
        ];
        this._selectedIndex = 0;
        this._parameterValue = 1.0;
        this._process = (image) => [image.map(this.filters[this.selectedIndex][1])];
        this._renderContent = () => html`
        <div>
            Filter:
            <select @change="${(e) => this.selectedIndex = e.target.selectedIndex}">
                ${this.filters.map((filter, index) => html`
                <option ?selected="${this.selectedIndex == index}">${filter[0]}</option>
                `)}
            </select>
        </div>
        <div>
            ${this.filters[this.selectedIndex][2] ? html`
            ${this.filters[this.selectedIndex][2]}:
            <input type="range"
                min=0 max=5 step="any"
                value="${this.parameterValue}"
                @input="${(e) => this._parameterValue = e.target.value}"
                @change="${(e) => this.parameterValue = e.target.value}"></input>
            <input type="number"
                value="${this.parameterValue}"
                @input="${(e) => this._parameterValue = e.target.value}"
                @change="${(e) => this.parameterValue = e.target.value}"></input>
            ` : html``}
        </div>
    `
    }

    static properties = {
        _selectedIndex: {type: Number},
        _parameterValue: {type: Number},
    }

    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(idx) {
        this._selectedIndex = idx;
        this._parameterValue = 1.0;
        this.process(true);
    }

    get parameterValue() {
        return this._parameterValue;
    }
    set parameterValue(v) {
        this._parameterValue = v;
        this.process(true);
    }
}
registerProcessor("filter-eb", FilterEb);