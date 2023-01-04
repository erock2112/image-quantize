import {html} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import { registerProcessor } from "../processor-registry.js";
import {TransformerEb, ColorOutput, ImageInput} from "./transformer.js";

export class ImageColorPickerEb extends TransformerEb {
    constructor() {
        super("Image Color Picker", [new ImageInput("image")], [new ColorOutput("color")]);
        this._image = null;
        this._x = 0;
        this._y = 0;
        this.width = 100;
        this.height = 100;
        this.color = "";
        this._dragging = false;
        this.svg = null;
        this._process = (image) => {
            if (this.image !== image) {
                this.image = image;
            }
            const color = this.image.get(this.x, this.y);
            this.color = color.hex();
            return [color];
        };
        this._renderContent = () => html`
            <div>
                <svg
                    width="${this.width}"
                    height="${this.height}"
                    @mousedown="${(e) => this.dragStart(e)}"
                    @mousemove="${(e) => this.dragMove(e)}"
                    @mouseup="${(e) => this.dragEnd(e)}"
                    @mouseleave="${(e) => this.dragEnd(e)}"
                    >
                    <foreignObject x="0" y="0" width="${this.width}" height="${this.height}">
                        <canvas id="canvas" width="${this.width}" height="${this.height}"></canvas>
                    </foreignObject>
                    <circle cx="${this.x}" cy="${this.y}" r="3" stroke="black" stroke-width="2" fill-opacity="0" />
                </svg>
            </div>
            <div>
                <input type="color" .value="${this.color}" disabled></input>
            </div>
            <div>
                x: <input type="number" value="${this.x}" @change="${(e => this.x = e.target.value)}"></input>
            </div>
            <div>
                y: <input type="number" value="${this.y}" @change="${(e => this.y = e.target.value)}"></input>
            </div>
        `
    }

    static properties = {
        _x: {type: Number},
        _y: {type: Number},
        width: {type: Number},
        height: {type: Number},
        color: {type: String},
    }

    updated() {
        super.updated();
        this.svg = this.shadowRoot.querySelector("svg");
        this.draw();
    }

    updateMouseCoords(e) {
        const ctm = this.svg.getScreenCTM();
        this.x = (e.clientX - ctm.e) / ctm.a;
        this.y = (e.clientY - ctm.f) / ctm.d;
    }

    dragStart(e) {
        e.preventDefault();
        this._dragging = true;
        this.updateMouseCoords(e);
    }

    dragMove(e) {
        e.preventDefault();
        if (this._dragging) {
            this.updateMouseCoords(e);
        }
    }

    dragEnd(e) {
        e.preventDefault();
        if (this._dragging) {
            this._dragging = false;
            this.updateMouseCoords(e);
        }
    }

    draw() {
        const canvas = this.shadowRoot.querySelector("canvas");
        if (!canvas || !this.image) {
            return;
        }
        this.image.draw(canvas);
    }

    get x() {
        return this._x;
    }
    set x(x) {
        this._x = clampInt(x, 0, this.width - 1);
        if (this.image) {
            this.color = this.image.get(this._x, this._y).hex();
        }
        if (!this._dragging) {
            this.process(true);
        }
    }

    get y() {
        return this._y;
    }
    set y(y) {
        this._y = clampInt(y, 0, this.height - 1);
        if (this.image) {
            this.color = this.image.get(this._x, this._y).hex();
        }
        if (!this._dragging) {
            this.process(true);
        }
    }

    get image() {
        return this._image;
    }
    set image(image) {
        if (image) {
            this.width = image.width;
            this.height = image.height;
        } else {
            this.width = 0;
            this.height = 0;
        }
        this._x = clampInt(this.x, 0, this.width - 1);
        this._y = clampInt(this.y, 0, this.height - 1);
        this._image = image;
        this.draw();
    }
}
registerProcessor("image-color-picker-eb", ImageColorPickerEb);

function clampInt(v, min, max) {
    return Math.floor(Math.max(Math.min(v, max-1), min));
}