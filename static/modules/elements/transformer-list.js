import {css, html, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import "./spinner.js";
import "./transformer.js";
import {Image} from "../types.js";
import {QuantizeEb} from "./quantize.js";
import {InvertEb} from "./invert.js";
import {GreyscaleEb} from "./greyscale.js";
import {PaletteToImageEb} from "./paletteToImage.js";
import "./icons/delete.js";
import "./icons/expand-more.js";
import "./icons/expand-less.js";

export class TransformerListEb extends LitElement {
    static styles = css`
    div {
        flex-grow: 0;
    }
    div.container {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    div.mainContainer {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
    }
    div.options {
        display: flex;
        flex-direction: column;
        background-color: #efefef;
        padding: 20px;
    }
    div.listitem {
        display: flex;
        flex-direction: row;
    }
    div.transformer {
        align-items: center;
        background-color: #efefef;
        display: flex;
        flex-direction: row;
        margin: 10px;
    }
    div.transformer > div {
        padding: 10px;
    }
    div.flex {
        flex-grow: 1;
    }
    div.transformer > div.buttons {
        flex-direction: column;
    }
    button {
        background-color: transparent;
        border: none;
    }
    spinner-eb {
        position: fixed;
    }
    `;

    static properties = {
        allTransformers: {type: Array},
        transformers: {type: Array},
        working: {type: Boolean},
    };

    constructor() {
        super();
        this.allTransformers = [
            ["Quantize", QuantizeEb],
            ["Invert", InvertEb],
            ["Greyscale", GreyscaleEb],
        ];

        const qt = new QuantizeEb();
        const gs = new GreyscaleEb();
        const inv = new InvertEb();
        const pi = new PaletteToImageEb();
        qt.output("image").addSubscriber(gs.input("image"));
        qt.output("palette").addSubscriber(pi.input("palette"));
        gs.output("image").addSubscriber(inv.input("image"));

        this.transformers = [qt, pi, gs, inv];
        this.srcImage = null;
        this.srcFileName = null;
        this.working = false;
        window.addEventListener("reprocess", this.process.bind(this));
    }

    add(typ) {
        const newTransformers = [...this.transformers];
        this.transformers = newTransformers;
        newTransformers.push(new typ());
        this.process();
    }

    up(index) {
        if (index == 0) {
            return;
        }
        const newTransformers = [...this.transformers];
        this.transformers = newTransformers;
        this.transformers.splice(index - 1, 0, this.transformers.splice(index, 1)[0]);
        this.render();
        this.process();
    }

    down(index) {
        if (index == this.transformers.length - 1) {
            return;
        }
        const newTransformers = [...this.transformers];
        this.transformers = newTransformers;
        this.transformers.splice(index + 1, 0, this.transformers.splice(index, 1)[0]);
        this.render();
        this.process();
    }

    delete(index) {
        const newTransformers = [...this.transformers];
        this.transformers = newTransformers;
        this.transformers.splice(index, 1);
        this.render();
        this.process();
    }

    imageChanged(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        this.working = true;
        createImageBitmap(file).then((bmp) => {
            // Draw the image into the src-image canvas.
            console.log("reading image");
            var canvas = document.createElement("canvas");
            canvas.width = bmp.width;
            canvas.height = bmp.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(bmp, 0, 0);
            this.srcImage = new Image(ctx.getImageData(0, 0, canvas.width, canvas.height));
            this.srcFileName = file.name;
            this.process();
        });
        this.render();
    }

    process() {
        if (!this.srcImage) {
            return;
        }
        this.working = true;
        this.render();
        setTimeout(() => {
            let image = this.srcImage;
            this.transformers[0].input("image").update(image);
            //this.transformers.forEach((tf) => {
            //    image = tf.process(image);
            //});
            image = this.transformers[this.transformers.length-1].output("image").value;
            const dstImageCanvas = this.shadowRoot.getElementById("dst-image");
            image.draw(dstImageCanvas);
            this.working = false;
            this.render();
        });
    }

    download() {
        const dstImageCanvas = this.shadowRoot.getElementById("dst-image");
        const a = document.createElement("a");
        const splitName = this.srcFileName.split(".");
        splitName[0] = splitName[0] + "-edited"
        a.download = splitName.join(".");
        a.href = dstImageCanvas.toDataURL();
        a.click();
    }

    render() {
        return html`
        <div class="container">
            <div class="mainContainer">
                <div class="options">
                    ${this.allTransformers.map((tf) => html`
                    <div class="listitem">
                        <div>${tf[0]}</div>
                        <div class="flex"></div>
                        <div>
                        <button @click="${() => this.add(tf[1])}">+</button>
                        </div>
                    </div>
                    `)}
                </div>
                <div class="flex">
                    ${this.transformers.map((tf, index) => html`
                    <div class="transformer">
                        <div><h2>${tf.name}</h2></div>
                        ${tf.render()}
                        <div class="flex"></div>
                        <div class="buttons">
                        <div>
                           <button @click="${() => this.up(index)}">
                                <expand-less-icon-eb width=32 height=32></expand-less-icon-eb>
                            </button>
                        </div>
                        <div>
                            <button @click="${() => this.delete(index)}">
                                <delete-icon-eb width=32 height=32></delete-icon-eb>
                            </button>
                        </div>
                        <div>
                            <button @click="${() => this.down(index)}">
                                <expand-more-icon-eb width=32 height=32></expand-more-icon-eb>
                            </button>
                        </div>
                    </div>
                    `)}
                </div>
                <div class="flex">
                    <input id="file-input" type="file" accept="image/*" @change="${this.imageChanged}"></input>
                    <button @click="${() => this.download()}">Download</button>
                    <br/>
                    <spinner-eb style="visibility:${this.working ? "visible" : "hidden"}"></spinner-eb>
                    <canvas id="dst-image" style="visibility:${this.working ? "hidden" : "visible"}"></canvas>
                </div>
            </div>
        </div>
        `;
    }
}
customElements.define('transformer-list-eb', TransformerListEb);