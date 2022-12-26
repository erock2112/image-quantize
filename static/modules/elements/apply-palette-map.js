import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {ImageInput, ImageOutput, PaletteMapInput, TransformerEb} from "./transformer.js";

export class ApplyPaletteMapEb extends TransformerEb {
    constructor() {
        super("Apply Palette Mapping", [new ImageInput("image"), new PaletteMapInput("mapping")], [new ImageOutput("image")]);
        this._process = (image, map) => {
            console.log(map);
            return [map.apply(image)];
        };
        this._renderContent = () => html``
    }
}
registerProcessor("apply-palette-map-eb", ApplyPaletteMapEb);