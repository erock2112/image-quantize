import {css, html, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import "./transformer.js";
import { TransformerEb } from "./transformer.js";

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
    input {
        text-align: right;
        width: 35px;
    }
    `;

    static properties = {
        allTransformers: {type: Array},
        transformers: {type: Array},
    };

    constructor() {
        super();
        this.allTransformers = [
            ["Quantize", TransformerEb],
            ["Invert", TransformerEb],
        ];
        this.transformers = [];
    }

    add(typ) {
        const newTransformers = [...this.transformers];
        this.transformers = newTransformers;
        newTransformers.push(new typ());
    }

    up(index) {
        if (index == 0) {
            return;
        }
        const newTransformers = [...this.transformers];
        this.transformers = newTransformers;
        this.transformers.splice(index - 1, 0, this.transformers.splice(index, 1)[0]);
        this.render();
    }

    down(index) {
        if (index == this.transformers.length - 1) {
            return;
        }
        const newTransformers = [...this.transformers];
        this.transformers = newTransformers;
        this.transformers.splice(index + 1, 0, this.transformers.splice(index, 1)[0]);
        this.render();
    }

    delete(index) {
        const newTransformers = [...this.transformers];
        this.transformers = newTransformers;
        this.transformers.splice(index, 1);
        this.render();
    }

    render() {
        return html`
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
        </div>
        `;
    }
}
customElements.define('transformer-list-eb', TransformerListEb);