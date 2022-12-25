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
import { RenderImageEb } from "./render-image.js";
import { ReadImageEb } from "./read-image.js";

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

        const inp = new ReadImageEb(this);
        const inpRender = new RenderImageEb(this);
        const qt = new QuantizeEb(this);
        const gs = new GreyscaleEb(this);
        const inv = new InvertEb(this);
        const pi = new PaletteToImageEb(this);
        const ri = new RenderImageEb(this);
        const rp = new RenderImageEb(this)
        inp.output("image").addSubscriber(inpRender.input("image"));
        inp.output("image").addSubscriber(qt.input("image"));
        qt.output("image").addSubscriber(gs.input("image"));
        qt.output("palette").addSubscriber(pi.input("palette"));
        gs.output("image").addSubscriber(inv.input("image"));
        inv.output("image").addSubscriber(ri.input("image"));
        pi.output("image").addSubscriber(rp.input("image"));

        this.transformers = [inp, inpRender, qt, pi, rp, gs, inv, ri];
        this.working = false;
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

    forceUpdate() {
        console.log("update");
        const newTransformers = [...this.transformers];
        this.transformers = newTransformers;
        //this.render();
    }

    render() {
        console.log("render");
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
                    </div>
                    `)}
                </div>
            </div>
        </div>
        `;
    }
}
customElements.define('transformer-list-eb', TransformerListEb);