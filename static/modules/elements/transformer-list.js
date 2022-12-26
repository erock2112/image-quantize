import {css, html, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import "./spinner.js";
import "./transformer.js";
import {QuantizeEb} from "./quantize.js";
import {InvertEb} from "./invert.js";
import {GreyscaleEb} from "./greyscale.js";
import {PaletteToImageEb} from "./paletteToImage.js";
import "./icons/delete.js";
import "./icons/expand-more.js";
import "./icons/expand-less.js";
import { RenderImageEb } from "./render-image.js";
import { ReadImageEb } from "./read-image.js";
import { getProcessors } from "../processor-registry.js";

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
    #transformerContainer {
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
    div.flex {
        flex-grow: 1;
    }
    `;

    static properties = {
        allTransformers: {type: Array},
    };

    constructor() {
        super();
        this.allTransformers = getProcessors();
        this.transformers = [];
    }

    transformersUpdated() {
        this.transformers = [...this.transformers];
        const parent = this.shadowRoot.querySelector("#transformerContainer");
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        this.transformers.forEach((tf) => {
            parent.appendChild(tf);
            tf.transformers = this.transformers;
        });
    }

    add(typ) {
        const elem = document.createElement(typ);
        elem.listElement = this;
        this.transformers.push(elem);
        this.transformersUpdated();
    }

    delete(elem) {
        const index = this.transformers.indexOf(elem);
        this.transformers.splice(index, 1);
        this.transformersUpdated();
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
                <div id="transformerContainer"></div>
            </div>
        </div>
        `;
    }
}
customElements.define('transformer-list-eb', TransformerListEb);