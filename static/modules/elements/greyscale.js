import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ImageInput, ImageOutput} from "./transformer.js";

export class GreyscaleEb extends TransformerEb {
    constructor() {
        super("Greyscale", [new ImageInput("image")], [new ImageOutput("image")]);
        this._process = (image) => [image.map((color) => color.greyscale())];
        this._renderContent = () => html``;
    }
}
registerProcessor("greyscale-eb", GreyscaleEb);