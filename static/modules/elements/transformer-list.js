import {css, html, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import "./transformer.js";
import {Image} from "../types.js";
import {QuantizeEb} from "./quantize.js";
import {InvertEb} from "./invert.js";
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
        flex-direction: row;
    }
    div.options {
        display: flex;
        flex-direction: column;
        border: 1px solid black;
        padding: 10px;
    }
    div.listitem {
        display: flex;
        flex-direction: row;
    }
    div.transformer {
        align-items: center;
        border: 1px solid black;
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
    `;

    static properties = {
        allTransformers: {type: Array},
        transformers: {type: Array},
    };

    constructor() {
        super();
        this.allTransformers = [
            ["Quantize", QuantizeEb],
            ["Invert", InvertEb],
        ];
        this.transformers = [];
        this.srcImage = null;
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
        createImageBitmap(event.target.files[0]).then((bmp) => {
            // Draw the image into the src-image canvas.
            console.log("reading image");
            var canvas = document.createElement("canvas");
            canvas.width = bmp.width;
            canvas.height = bmp.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(bmp, 0, 0);
            this.srcImage = new Image(ctx.getImageData(0, 0, canvas.width, canvas.height));
            this.process();
        });
    }

    process() {
        if (!this.srcImage) {
            return;
        }
        setTimeout(() => {
            let image = this.srcImage;
            this.transformers.forEach((tf) => {
                image = tf.process(image);
            });
            const dstImageCanvas = this.shadowRoot.getElementById("dst-image");
            image.draw(dstImageCanvas);
        });
    }

    render() {
        return html`
        <div>
          <input id="file-input" type="file" accept="image/*" @change="${this.imageChanged}"></input>
        </div>
        <div class="container">
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
          <div>
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
          <div>
            <canvas id="dst-image"></canvas>
          </div>
        </div>
        `;
    }
}
customElements.define('transformer-list-eb', TransformerListEb);