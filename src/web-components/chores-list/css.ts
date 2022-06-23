import { css } from "lit";

export default css`
  :host {
    display: block;
    width: 100%;
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
    -webkit-user-select: none;
    overflow-wrap: break-word;
  }

  li:hover {
    cursor: pointer;
  }

  li:first-child {
    margin-bottom: 0;
  }

  li small {
    font-size: 0.8rem;
    margin: 0 auto;
    padding: 2px 0.5rem;
    border-radius: 8px;
  }

  li small[due] {
    font-weight: 800;
    background-color: var(--danger-color);
  }

  li strong {
    font-size: 1.8rem;
    font-weight: 400;
  }

  @media (prefers-color-scheme: dark) {
    li {
      color: white;
    }
  }
`;
