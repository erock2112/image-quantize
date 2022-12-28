import {css, html, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {Image, Palette, Color, PaletteMap} from "../types.js";
import "./spinner.js";

export class IO {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.value = null;
        this._dirty = true;
    }

    get dirty() {
        return this._dirty;
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
        this._dirty = false;
        //console.log(`Input "${this.name}" updated with value ${value}; updating processor ${this.processor.name}`);
        this.processor.process();
    }

    setDirty() {
        this._dirty = true;
        this.processor.setDirty();
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

export class PaletteMapInput extends Input {
    constructor(name) {
        super(name, PaletteMap);
    }
}

export class ColorInput extends Input {
    constructor(name) {
        super(name, Color);
    }
}

export class Output extends IO {
    constructor(name, type) {
        super(name, type);
        this.subscribers = [];
    }

    addSubscriber(input) {
        input.from = this;
        this.subscribers.push(input);
        input.update(this.value);
    }

    removeSubscriber(input) {
        input.from = null;
        input.update(null);
        this.subscribers.splice(this.subscribers.indexOf(input), 1);
    }

    update(value) {
        this.value = value;
        this._dirty = false;
        this.subscribers.forEach((subscriber) => {
            //console.log("Updating subscriber: ");
            //console.log(subscriber);
            subscriber.update(value);
        });
    }

    setDirty() {
        this._dirty = true;
        this.subscribers.forEach((sub) => sub.setDirty());
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

export class PaletteMapOutput extends Output {
    constructor(name) {
        super(name, PaletteMap);
    }
}

export class ColorOutput extends Output {
    constructor(name) {
        super(name, Color);
    }
}

export class TransformerEb extends LitElement {
    constructor(name, inputs, outputs) {
        super();
        this.name = name;
        inputs.forEach((input) => {input.processor = this});
        this.inputs = inputs;
        this.outputs = outputs;
        this._cachedInputs = null;
        this._preProcess = null;
        this._process = null;
        this._renderContent = null;
        this._dirty = false;
        this.transformers = [];
        this.listElement = null;
        this.assignedDefaultInputs = false;
    }

    static properties = {
        _dirty: {type: Boolean},
        _transformers: {type: Array},
    };

    get dirty() {
        return this._dirty;
    }
    set dirty(dirty) {
        this._dirty = dirty;
    }
    setDirty() {
        this.dirty = true;
        this.outputs.forEach((output) => output.setDirty());
    }

    set transformers(transformers) {
        // Set default inputs to the last valid output in the list.
        if (!this.assignedDefaultInputs) {
            this.assignedDefaultInputs = true;
            this.inputs.forEach((input) => {
                transformers.filter((tf) => tf !== this).forEach((tf) => {
                    tf.outputs.filter((output) => output.type === input.type).forEach((output) => {
                        this.assignInputToOutput(input, output);
                    });
                });
            });
        }
        this._transformers = transformers;
    }
    get transformers() {
        return this._transformers;
    }

    process(force) {
        console.log(`process called on ${this.name}`);
        if (this._preProcess) {
            this._preProcess();
        }
        if (this.inputs.some((input) => !input.value) || !this._process) {
            //console.log("  conditions not met; not processing");
            //console.log(this.inputs);
            // Clear outputs.
            this.outputs.forEach((output) => {
                output.update(null);
            });
            return;
        }
        if (this.inputs.some((input) => input.dirty)) {
            //console.log("  at least one input is dirty; not processing");
            //console.log(this.inputs);
            return;
        }
        const inputs = this.inputs.map((input) => input.value);
        if (!force && this._cachedInputs && this._cachedInputs.length == inputs.length && this._cachedInputs.every((input, index) => input === inputs[index])) {
            //console.log("  inputs same as cached; skipping processing");
            //console.log(inputs);
            return;
        }
        this._cachedInputs = inputs;
        console.log(`  processing ${this.name}...`);
        //console.log(inputs);
        this.setDirty();
        setTimeout((() => {
            const results = this._process(...inputs);
            if (results.length != this.outputs.length) {
                throw `Got incorrect number of results; ${results} vs ${this.outputs}`;
            }
            //console.log(`  ${this.name} updating ${this.outputs.length} outputs`);
            this.outputs.forEach((output, index) => {
                output.update(results[index]);
            });
            this.dirty = false;
        }).bind(this), 1000);
    }

    delete() {
        // Detach the node from any others.
        this.inputs.forEach((input) => {
            if (input.from) {
                input.from.removeSubscriber(input);
            }
        });
        this.outputs.forEach((output) => {
            output.subscribers.forEach((input) => {
                output.removeSubscriber(input);
            });
        });
        this.listElement.delete(this);
    }

    assignInputToOutput(input, output) {
        // TODO(erock2112): each call to addSubscriber or removeSubscriber
        // results in a call to process() which may be duplicated. We should
        // consider debouncing calls to process().
        if (input.from) {
            input.from.removeSubscriber(input);
        }
        if (output) {
            output.addSubscriber(input);
        }
    }

    updateInput(e, input) {
        const select = e.target;
        let output = null;
        if (select.value != "") {
            const split = select.value.split("-");
            const tf = this.transformers[parseInt(split[0])];
            output = tf.outputs[parseInt(split[1])];
        }
        this.assignInputToOutput(input, output);
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
        <div><h2>${this.transformers.indexOf(this) + 1}. ${this.name}</h2></div>
        <div class="inputs">
            ${this.inputs.map((input, inputIdx) => html`
            <div>
                <label for="input${inputIdx}">${capitalize(input.name)}: </label>
                <select id="input${inputIdx}" @change="${(e) => this.updateInput(e, input)}">
                    <option value=""></option>
                    ${this.transformers.map((tf, tfIdx) => {
                        if (tf === this) {
                            return html``;
                        }
                        return tf.outputs.map((output, outputIdx) => {
                            if (output.type !== input.type) {
                                return html``;
                            }
                            return html`<option
                                value="${tfIdx}-${outputIdx}"
                                ?selected="${input.from === output}"
                                >${tfIdx+1}. ${tf.name}: ${capitalize(output.name)}</option>`;
                        });
                    })}
                </select>
            </div>
            `)}
        </div>
        ${this._renderContent()}
        <div class="flex"></div>
        <spinner-eb style="visibility:${this.dirty ? "visible" : "hidden"}"></spinner-eb>
        <div>
            <button @click="${() => this.delete()}">
                <delete-icon-eb width=32 height=32></delete-icon-eb>
            </button>
        </div>
        `;
    }
}
customElements.define('transformer-eb', TransformerEb);

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}
