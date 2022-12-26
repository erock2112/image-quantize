import {css, html, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {Image, Palette} from "../types.js";
import "./spinner.js";

export class IO {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.value = null;
    }
}

export class Input extends IO {
    constructor(name, type) {
        super(name, type);
        this.processor = null;
        this.from = null;
    }

    update(value) {
        this.value = value;
        this.processor.process();
    }
}

export class ImageInput extends Input {
    constructor(name) {
        super(name, Image);
    }
}

export class PaletteInput extends Input {
    constructor(name) {
        super(name, Palette);
    }
}

export class Output extends IO {
    constructor(name, type) {
        super(name, type);
        this.subscribers = [];
    }

    addSubscriber(input) {
        this.subscribers.push(input);
        input.update(this.value);
    }

    removeSubscriber(input) {
        this.subscribers.splice(this.subscribers.indexOf(input), 1);
    }

    update(value) {
        this.value = value;
        this.subscribers.forEach((subscriber) => subscriber.update(value));
    }
}

export class ImageOutput extends Output {
    constructor(name) {
        super(name, Image);
    }
}

export class PaletteOutput extends Output {
    constructor(name) {
        super(name, Palette);
    }
}

export class TransformerEb extends LitElement {
    constructor(name, inputs, outputs) {
        super();
        this.name = name;
        inputs.forEach((input) => {input.processor = this});
        this.inputs = inputs;
        this.outputs = outputs;
        this._process = null;
        this._renderContent = null;
        this._busy = false;
        this.transformers = [];
    }

    static properties = {
        busy: {type: Boolean},
        transformers: {type: Array},
    };

    get busy() {
        return this._busy;
    }
    set busy(busy) {
        this._busy = busy;
    }

    process() {
        console.log(`process ${this.name}`);
        if (this.inputs.some((input) => !input.value)) {
            return;
        }
        if (!this._process) {
            return;
        }
        this.busy = true;
        setTimeout((() => {
            const results = this._process(...this.inputs.map((inp) => inp.value));
            this.busy = false;
            if (results.length != this.outputs.length) {
                throw `Got incorrect number of results; ${results} vs ${this.outputs}`;
            }
            this.outputs.forEach((output, index) => {
                output.update(results[index]);
            });
        }).bind(this));
    }

    delete() {
        this.parentElement.removeChild(this);
    }

    updateInput(inputIdx) {
        const select = this.shadowRoot.querySelector("#input"+inputIdx);
        const input = this.inputs[inputIdx];
        if (input.from) {
            input.from.removeSubscriber(input);
            input.from = null;
        }
        if (select.value != "") {
            const split = select.value.split("-");
            const tf = this.transformers[parseInt(split[0])];
            const output = tf.outputs[parseInt(split[1])];
            input.from = output;
            output.addSubscriber(input);
        }
        this.process();
    }

    static styles = css`
    :host {
        align-items: center;
        background-color: #efefef;
        display: flex;
        flex-direction: row;
        margin: 10px;
    }
    :host > div {
        padding: 10px;
    }
    div.flex {
        flex-grow: 1;
    }
    div.buttons {
        flex-direction: column;
    }
    `;

    render() {
        return html`
        <div><h2>${this.name}</h2></div>
        <div class="inputs">
            ${this.inputs.map((input, inputIdx) => html`
            <div>
                <label for="input${inputIdx}">Input ${input.name}</label>
                <select id="input${inputIdx}" @change="${() => this.updateInput(inputIdx)}">
                    <option value=""></option>
                    ${this.transformers.map((tf, tfIdx) => {
                        if (tf === this) {
                            return html``;
                        }
                        return tf.outputs.map((output, outputIdx) => {
                            if (output.type !== input.type) {
                                return html``;
                            }
                            return html`<option value="${tfIdx}-${outputIdx}">${tf.name} ${output.name}</option>`;
                        });
                    })}
                </select>
            </div>
            `)}
        </div>
        ${this._renderContent()}
        <div class="flex"></div>
        <spinner-eb style="visibility:${this.busy ? "visible" : "hidden"}"></spinner-eb>
        <div>
            <button @click="${() => this.up()}">
                <expand-less-icon-eb width=32 height=32></expand-less-icon-eb>
            </button>
        </div>
        <div>
            <button @click="${() => this.delete()}">
                <delete-icon-eb width=32 height=32></delete-icon-eb>
            </button>
        </div>
        <div>
            <button @click="${() => this.down()}">
                <expand-more-icon-eb width=32 height=32></expand-more-icon-eb>
            </button>
        </div>
        `;
    }
}
customElements.define('transformer-eb', TransformerEb);
