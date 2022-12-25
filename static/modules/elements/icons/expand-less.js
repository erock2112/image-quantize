import {html, LitElement} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class ExpandLessIconEb extends LitElement {
    static properties = {
        width: {type: Number},
        height: {type: Number},
    };

    constructor() {
        super();
        this.width = 48;
        this.height = 48;
    }

    render() {
        return html`<svg xmlns="http://www.w3.org/2000/svg" height="${this.height}" width="${this.width}" viewBox="0 0 48 48"><path d="M14.15 30.75 12 28.6l12-12 12 11.95-2.15 2.15L24 20.85Z"/></svg>`;
    }
}
customElements.define('expand-less-icon-eb', ExpandLessIconEb);
