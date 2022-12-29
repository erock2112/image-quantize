import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ImageOutput, ColorInput} from "./transformer.js";
import { diagonal1, diagonal2, horizontal, twoColorBw, vertical } from "../gradient.js";
import { Image } from "../types.js";

export class GradientEb extends TransformerEb {
    constructor() {
        super("Gradient", [new ColorInput("color1"), new ColorInput("color2")], [new ImageOutput("image")]);
        this._process = (color1, color2) => {
            const fn = this.directions[this.selectedIndex][1]
            return [Image.withDimensions(this.width, this.height).map((_, x, y, width, height) => fn(color1, color2, x, y, width, height))];
        };
        this.directions = [
            ["vertical", vertical],
            ["horizontal", horizontal],
            ["diagonal (top left to bottom right)", diagonal1],
            ["diagonal (bottom left to top right)", diagonal2],
            ["two color with black and white", twoColorBw],
        ];
        this._renderContent = () => html`
            <div>
                Direction: <select @change="${e => this.selectedIndex = e.target.selectedIndex}">
                    ${this.directions.map((direction, index) => html`
                        <option ?selected="${index == this.selectedIndex}">${direction[0]}</option>
                    `)}
                </select>
            <div>
                Width: <input type="number" value="${this.width}" @change="${(e => this.width = e.target.value)}"></input>
            </div>
            <div>
                Height: <input type="number" value="${this.height}" @change="${(e => this.height = e.target.value)}"></input>
            </div>
        `
        this._width = 300;
        this._height = 200;
        this._selectedIndex = 0;
    }

    get width() {
        return this._width;
    }
    set width(width) {
        this._width = width;
        this.process(true);
    }

    get height() {
        return this._height;
    }
    set height(height) {
        this._height = height;
        this.process(true);
    }

    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(index) {
        this._selectedIndex = index;
        this.process(true);
    }
}
registerProcessor("gradient-eb", GradientEb);