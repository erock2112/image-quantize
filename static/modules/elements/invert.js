import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ImageInput, ImageOutput} from "./transformer.js";

export class InvertEb extends TransformerEb {
    constructor() {
        super("Invert", [new ImageInput("image")], [new ImageOutput("image")]);
        this._process = (image) => [image.map((color) => color.invert())];
        this._renderContent = () => html``;
    }
}
registerProcessor("invert-eb", InvertEb);