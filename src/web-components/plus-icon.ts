import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import sharedCss from "./shared-css";

export default class PlusIcon extends LitElement {
  @property({ attribute: true, type: String })
  color: "primary" | "highlight" = "primary";

  static styles = [
    sharedCss,
    css`
      svg {
        width: auto;
        height: 100%;
      }

      .primary {
        fill: var(--primary-color);
      }

      .highlight {
        fill: var(--highlight-color);
      }

      .white {
        fill: white;
      }

      @media (prefers-color-scheme: dark) {
        .highlight {
          fill: white;
        }
      }
    `,
  ];

  render() {
    return html`
      <svg class=${this.color} xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0, 0, 48, 48">
        <path d="M22.5 38V25.5H10V22.5H22.5V10H25.5V22.5H38V25.5H25.5V38Z" />
      </svg>
    `;
  }
}
