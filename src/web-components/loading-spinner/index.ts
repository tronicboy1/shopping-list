import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";

export default class LoadingSpinner extends LitElement {
  @property({ attribute: true })
  color: "blue" | "white" | "auto" = "auto";

  static styles = css`
    div {
      margin: auto;
      height: 100%;
      width: auto;
      max-width: 100px;
      position: relative;
    }
    svg {
      animation: spin 4s linear infinite;
      -webkit-animation: spin 4s linear infinite;
      fill: rgb(0, 140, 255);
      width: 100%;
      max-width: 100%;
      height: auto;
      max-height: 100%;
      min-height: none;
    }

    .blue {
      fill: rgb(0, 140, 255);
    }

    .white {
      fill: rgb(255, 255, 255);
    }

    .auto {
      fill: var(--highlight-color);
    }

    @keyframes spin {
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }

    @media (prefers-color-scheme: dark) {
        .auto {
          fill: white;
        }
      }
  `;
  render() {
    return html`
      <div>
        <svg class=${this.color} xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0, 0, 48, 48">
          <path
            d="M28.3 8H39.8V11H33.25L34 11.7Q37 14.5 38.5 17.7Q40 20.9 40 23.85Q40 29.15 36.9 33.4Q33.8 37.65 28.7 39.25V36.1Q32.5 34.65 34.75 31.275Q37 27.9 37 23.85Q37 21.45 35.825 18.975Q34.65 16.5 32.75 14.6L31.3 13.3V19.5H28.3ZM19.85 40H8.35V37H14.85L14.1 36.4Q10.9 33.85 9.45 30.85Q8 27.85 8 24.15Q8 18.85 11.125 14.625Q14.25 10.4 19.35 8.8V11.9Q15.6 13.35 13.3 16.725Q11 20.1 11 24.15Q11 27.3 12.175 29.625Q13.35 31.95 15.35 33.65L16.85 34.7V28.5H19.85Z"
          />
        </svg>
      </div>
    `;
  }
}
