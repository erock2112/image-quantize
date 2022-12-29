import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ImageInput, ImageOutput} from "./transformer.js";

export class FilterEb extends TransformerEb {
    constructor() {
        super("Filter", [new ImageInput("image")], [new ImageOutput("image")]);
        this.filters = [
            ["greyscale", (color) => color.greyscale()],
            ["sepia", (color) => color.sepia()],
            ["invert", (color) => color.invert()],
        ];
        this._selectedIndex = 0;
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
    `
    }

    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(idx) {
        this._selectedIndex = idx;
        this.process(true);
    }
}
registerProcessor("filter-eb", FilterEb);