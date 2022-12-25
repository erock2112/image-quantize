import {LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";

export class TransformerEb extends LitElement {
    constructor(name) {
        super();
        this.name = name;
        this._numColors = 4;
    }

    static properties = {
        name: {type: String},
    };

    process(_) {
        throw "process() not implemented by base TransformerEb";
    }

    render() {
        throw "render() not implemented by base TransformerEb";
    }
}
customElements.define('transformer-eb', TransformerEb);
