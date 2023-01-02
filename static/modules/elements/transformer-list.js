import {css, html, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import "./spinner.js";
import "./transformer.js";
import "./quantize.js";
import "./paletteToImage.js";
import "./icons/delete.js";
import "./icons/expand-more.js";
import "./icons/expand-less.js";
import "./render-image.js";
import "./read-image.js";
import "./monochrome-palette.js";
import "./color-picker.js";
import "./palette-map.js";
import "./apply-palette-map.js";
import "./gradient.js";
import "./duotone-palette.js";
import "./duotone-square-palette.js";
import "./filter.js";
import "./palette.js";
import {getProcessors} from "../processor-registry.js";

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
        console.log(`Calling process on ${elem.name}`);
        elem.process();
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