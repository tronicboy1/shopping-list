import { css } from "lit";

export default css`
  * {
    box-sizing: border-box;
  }

  :host {
    display: none;
    width: 100%;
  }

  :host([show]) {
    display: block;
  }

  .card {
    --primary-color: white;
    --secondary-color: rgb(218, 218, 218);
    --highlight-color: rgb(0, 140, 255);
    --highlight-hover: rgb(26, 152, 255);
    width: 90%;
    max-width: 500px;
    margin: 1rem auto;
    background-color: var(--primary-color);
    border: 1px solid var(--primary-color);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.168);
    color: black;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    transition: all 0.3s;
  }

  .card[show] {
    display: flex;
  }

  .card[dark] {
    --dark-color: rgb(83, 83, 83);
    background-color: var(--dark-color);
    border-color: var(--dark-color);
    color: white;
  }

  @media (prefers-color-scheme: light) {
    .card {
      --primary-color: white;
      --secondary-color: rgb(218, 218, 218);
      --highlight-color: rgb(0, 140, 255);
      --highlight-hover: rgb(26, 152, 255);
      color: black;
    }
  }

  @media (prefers-color-scheme: dark) {
    .card {
      --primary-color: rgb(85, 85, 85);
      --secondary-color: rgb(132, 132, 132);
      --highlight-color: rgb(0, 140, 255);
      --highlight-hover: rgb(26, 152, 255);
      color: white;
    }
  }
`;
