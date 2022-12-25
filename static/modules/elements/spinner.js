import {css, html, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";

export class SpinnerEb extends LitElement {
    static styles = css`
    .spinner {
        border: 8px solid #f3f3f3;
        border-top: 8px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 32px;
        height: 32px;
        animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    `;

    render() {
        return html`<div class="spinner"></div>`;
    }
}
customElements.define('spinner-eb', SpinnerEb);