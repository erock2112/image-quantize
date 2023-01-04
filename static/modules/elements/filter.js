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
                const hsi = color.hsi();
                hsi[1] *= (this.parameterValue / 100);
                return Color.fromHsi(hsi[0], hsi[1], hsi[2]);
            }, "Percent", 0, 500, 100],
            ["hue rotation", (color) => {
                const hsi = color.hsi();
                hsi[0] += (this.parameterValue / 360);
                if (hsi[0] > 1) {
                    hsi[0] -= 1;
                }
                return Color.fromHsi(hsi[0], hsi[1], hsi[2]);
            }, "Degrees", 0, 360, 0],
            ["lightness", (color) => {
                const hsl = color.hsl();
                hsl[2] *= (this.parameterValue / 100);
                return Color.fromHsl(hsl[0], hsl[1], hsl[2]);
            }, "Percent", 0, 500, 100],
        ];
        this._selectedIndex = 0;
        this._parameterValue = 1.0;
        this._parameterMin = 0;
        this._parameterMax = 500;
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
        <div style="visibility:${this.filters[this.selectedIndex][2] ? "visible" : "hidden"}">
            ${this._parameterLabel}:
            <input type="range"
                id="slider"
                min="${this._parameterMin}"
                max="${this._parameterMax}"
                step="any"
                .value="${this.parameterValue}"
                @input="${(e) => this.handleInput(e)}"
                @change="${(e) => this.parameterValue = e.target.value}"></input>
            <input type="number"
                id="number"
                min="${this._parameterMin}"
                max="${this._parameterMax}"
                .value="${this.parameterValue}"
                @input="${(e) => this.handleInput(e)}"
                @change="${(e) => this.parameterValue = e.target.value}"></input>
        </div>
        `;
    }

    static properties = {
        _selectedIndex: {type: Number},
        _parameterValue: {type: Number},
        _parameterLabel: {type: String},
        _parameterMin: {type: Number},
        _parameterMax: {type: Number},
    }

    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(idx) {
        this._selectedIndex = idx;
        const selectedFilter = this.filters[this._selectedIndex];
        this._parameterLabel = selectedFilter[2];
        this._parameterMin = selectedFilter[3];
        this._parameterMax = selectedFilter[4];
        this._parameterValue = selectedFilter[5];
        this.process(true);
    }

    get parameterValue() {
        return this._parameterValue;
    }
    set parameterValue(v) {
        this._parameterValue = v;
        this.process(true);
    }

    handleInput(e) {
        const slider = this.shadowRoot.getElementById("slider");
        if (e.target !== slider) {
            slider.value = e.target.value;
        }
        const number = this.shadowRoot.getElementById("number");
        if (e.target !== number) {
            number.value = e.target.value;
        }
    }
}
registerProcessor("filter-eb", FilterEb);