import {html, LitElement} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class ExpandMoreIconEb extends LitElement {
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
        return html`<svg xmlns="http://www.w3.org/2000/svg" height="${this.height}" width="${this.width}" viewBox="0 0 48 48"><path d="m24 30.75-12-12 2.15-2.15L24 26.5l9.85-9.85L36 18.8Z"/></svg>`;
    }
}
customElements.define('expand-more-icon-eb', ExpandMoreIconEb);
