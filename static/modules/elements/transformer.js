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
    }

    static properties = {
        busy: {type: Boolean},
    };

    input(name) {
        return this.inputs.find((input) => input.name == name);
    }

    output(name) {
        return this.outputs.find((output) => output.name == name);
    }

    get busy() {
        return this._busy;
    }
    set busy(busy) {
        this._busy = busy;
    }

    process() {
        if (this.inputs.some((input) => !input.value)) {
            return;
        }
        if (!this._process) {
            return;
        }
        console.log("process " + this.name);
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
    :host > div.buttons {
        flex-direction: column;
    }
    `;

    render() {
        return html`
        <div><h2>${this.name}</h2></div>
        ${this._renderContent()}
        <div class="flex"></div>
        <spinner-eb style="visibility:${this.busy ? "visible" : "hidden"}"></spinner-eb>
        <div class="buttons">
            <div>
                <button @click="${() => this.delete()}">
                    <delete-icon-eb width=32 height=32></delete-icon-eb>
                </button>
            </div>
        </div>
        `;
    }
}
customElements.define('transformer-eb', TransformerEb);
