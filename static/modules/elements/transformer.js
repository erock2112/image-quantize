import {css, html, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
import "./icons/delete.js";
import "./icons/expand-less.js";
import "./icons/expand-more.js";

export class TransformerEb extends LitElement {
    static styles = css`
    div.transformer {
        align-items: center;
        border: 1px solid black;
        display: flex;
        flex-direction: row;
    }
    div.transformer > div {
        padding: 10px;
        flex-grow: 0;
    }
    div.transformer > div.flex {
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
        name: {type: String},
    };

    render() {
        return html`
        <div class="transformer">
          <div><h2>${this.name}</h2></div>
          <div>
            Colors: <input id="size-input" type="number" value=4></input>
          </div>
          <div class="flex"></div>
          <div class="buttons">
            <div>
              <button>
                <expand-less-icon-eb width=32 height=32></expand-less-icon-eb>
              </button>
            </div>
            <div>
              <button>
                <delete-icon-eb width=32 height=32></delete-icon-eb>
              </button>
            </div>
            <div>
              <button>
                <expand-more-icon-eb width=32 height=32></expand-more-icon-eb>
              </button>
            </div>
          </div>
        </div>
        `
    }
}
customElements.define('transformer-eb', TransformerEb);
  