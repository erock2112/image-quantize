import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ColorOutput} from "./transformer.js";
import { Color } from "../types.js";

export class ColorPickerEb extends TransformerEb {
    constructor() {
        super("Color Picker", [], [new ColorOutput("color")]);
        this._process = () => {
            return [this._color];
        };
        this._renderContent = () => html`
            <div>
                Color: <input type="color" value="${this.color}" @change="${(e => this.color = e.target.value)}"></input>
            </div>
        `
        this._color = Color.random();
    }

    get color() {
        return this._color.toHex();
    }
    set color(hex) {
        this._color = Color.fromHex(hex);
        this.process();
    }
}
registerProcessor("color-picker-eb", ColorPickerEb);