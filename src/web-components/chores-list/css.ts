import { css } from "lit";

export default css`
  :host {
    display: none;
    width: 100%;
  }

  :host([show]) {
    display: block;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column-reverse;
  }

  ul p {
    text-align: center;
    color: rgb(184, 184, 184);
  }

  li {
    display: flex;
    flex-direction: column;
    border: 1px var(--secondary-color) solid;
    background: var(--secondary-color);
    border-radius: 8px;
    color: black;
    padding: 0.5rem;
    transition: all 0.2s;
    margin-bottom: 0.5rem;
    text-align: center;
    font-size: 1.8rem;
    user-select: none;
    overflow-wrap: break-word;
  }

  li:hover {
    cursor: pointer;
  }

  li:first-child {
    margin-bottom: 0;
  }

  li small {
    font-size: 1rem;
  }

  li strong {
    font-size: 1.8rem;
    font-weight: 400;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  form input + label {
    margin-top: 1rem;
  }

  form label {
    margin-bottom: 0.3rem;
  }

  form input {
    height: 45px;
    border: 1px solid var(--secondary-color);
    border-radius: 4px;
    font-size: 1.2rem;
    padding-left: 0.25rem;
    outline: none;
    margin: 0;
    min-width: 50px;
  }

  form input + button {
    margin-top: 1rem;
  }

  @media (prefers-color-scheme: dark) {
    li {
      color: white;
    }
    form label {
      color: white;
    }
  }
`;
