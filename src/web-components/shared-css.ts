import { css } from "lit";

export default css`
  * {
    box-sizing: border-box;
  }

  :host {
    --primary-color: white;
    --secondary-color: rgb(218, 218, 218);
    --highlight-color: rgb(0, 140, 255);
    --highlight-hover: rgb(26, 152, 255);
    --danger-color: rgb(255, 94, 94);
    --warning-color: rgb(255, 250, 211);
  }

  .card {
    width: 90%;
    max-width: 500px;
    margin: 1rem auto;
    background-color: var(--primary-color);
    border: 1px solid var(--primary-color);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.168);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    transition: all 0.3s;
  }

  .invalid {
    background-color: var(--warning-color);
    display: block;
  }

  button {
    border: 1px solid var(--highlight-color);
    padding: 0.25rem 0.5rem;
    font-size: 1.5rem;
    height: 60px;
    color: white;
    background-color: var(--highlight-color);
    border-radius: 4px;
    cursor: pointer;
    margin: 0;
  }

  button[active] {
    background-color: var(--secondary-color);
    border-color: var(--secondary-color);
  }
  button[active]:hover {
    background-color: var(--secondary-color);
    border-color: var(--secondary-color);
  }
  button:hover {
    background-color: var(--highlight-hover);
    border-color: var(--highlight-hover);
  }

  form:invalid button {
    background-color: var(--secondary-color);
    border-color: var(--secondary-color);
  }

  button.delete {
    background-color: var(--danger-color);
    border-color: var(--danger-color);
    height: 40px;
  }

  @media (prefers-color-scheme: light) {
    :host {
      --primary-color: white;
      --secondary-color: rgb(218, 218, 218);
      --highlight-color: rgb(0, 140, 255);
      --highlight-hover: rgb(26, 152, 255);
      color: black;
    }
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --primary-color: rgb(85, 85, 85);
      --secondary-color: rgb(132, 132, 132);
      --highlight-color: rgb(0, 140, 255);
      --highlight-hover: rgb(26, 152, 255);
      --warning-color: rgb(105, 95, 23);
      color: white;
    }
  }
`;

export const formCss = css`
  form {
    display: flex;
    flex-direction: column;
  }

  form input + label,
  form input + span,
  form textarea + span {
    margin-top: 1rem;
  }

  form label,
  form span {
    margin-bottom: 0.3rem;
  }

  form input {
    height: 45px;
    border: 1px solid var(--secondary-color);
    border-radius: 4px;
    font-size: 1.2rem;
    padding-left: 0.5rem;
    outline: none;
    margin: 0;
    min-width: 50px;
    width: 100%;
  }

  form textarea {
    height: 10vh;
    min-height: 80px;
    padding: 0.5rem;
    font-size: 1.2rem;
  }

  form input + button,
  form textarea + button {
    margin-top: 1rem;
  }

  .checkbox-group {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin: 1rem 0;
  }

  .checkbox-group label {
    margin: 0 0 0 1rem;
  }

  form input[type="checkbox"] {
    height: 45px;
    width: 45px;
  }

  button + button {
    margin-top: 1rem;
  }

  @media (prefers-color-scheme: dark) {
    form label {
      color: white;
    }
  }
`;
