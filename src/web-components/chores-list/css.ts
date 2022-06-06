import { css } from "lit";

export default css`
  :host {
    display: none;
    width: 100%;
  }

  :host([show]) {
    display: block;
  }
`;
