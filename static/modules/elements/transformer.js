import {LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import {Image, Palette} from "../types.js";

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
        this.processor.update();
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
    constructor(name, inputs, outputs, process) {
        super();
        this.name = name;
        inputs.forEach((input) => {input.processor = this});
        this.inputs = Object.fromEntries(inputs.map((input) => [input.name, input]));
        this.outputs = Object.fromEntries(outputs.map((output) => [output.name, output]));;
        this.process = process;
    }

    static properties = {
        name: {type: String},
        inputs: {type: Object},
        outputs: {type: Object},
    };

    input(name) {
        return this.inputs[name];
    }

    output(name) {
        return this.outputs[name];
    }

    update() {
        console.log(this.inputs);
        const inputs = Object.values(this.inputs);
        console.log(inputs);
        if (Object.values(this.inputs).some((input) => !input.value)) {
            return;
        }
        const results = this.process(...inputs.map((inp) => inp.value));
        const outputs = Object.values(this.outputs);
        if (results.length != outputs.length) {
            throw `Got incorrect number of results; ${results} vs ${outputs}`;
        }
        Object.values(this.outputs).forEach((output, index) => {
            output.update(results[index]);
        });
    }

    render() {
        throw "render() not implemented by base TransformerEb";
    }
}
customElements.define('transformer-eb', TransformerEb);
