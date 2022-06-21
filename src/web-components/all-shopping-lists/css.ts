import { css } from "lit";

export default css`
  form {
    display: flex;
    flex-direction: row;
  }

  p {
    text-align: center;
    color: rgb(184, 184, 184);
  }

  form input {
    height: 50px;
    border: 1px solid var(--secondary-color);
    border-right: none;
    border-radius: 4px 0 0 4px;
    flex: 1 1;
    font-size: 1.2rem;
    padding-left: 0.25rem;
    outline: none;
    margin: 0;
    min-width: 50px;
  }

  form button {
    border-radius: 0 4px 4px 0;
    border-left: none;
    flex: 0 0 20%;
    height: 50px;
  }

  form:invalid button {
    background-color: var(--secondary-color);
    border-color: var(--secondary-color);
  }

  form label {
    display: none;
  }

  button {
    border: 1px solid var(--highlight-color);
    background-color: var(--highlight-color);
    border-radius: 4px;
    color: white;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    margin: 0;
    transition: all 0.3s;
  }

  #clear {
    height: 54px;
    border-radius: 8px;
  }
`;

export const listCss = css`
  #title {
    width: 100%;
    display: block;
    position: relative;
    border-bottom: 1px solid var(--secondary-color);
    user-select: none;
    cursor: pointer;
  }

  #title h2 {
    text-align: center;
    margin: 0;
  }

  #title span {
    display: inline-flex;
    opacity: 0;
    position: absolute;
    right: 0;
    bottom: 0;
    top: 0;
    margin: auto 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: var(--secondary-color);
    padding: 0 0.35rem;
    border-radius: 60%;
    transition: opacity 0.3s;
  }
  :host([hide-list]) #title {
    border: none;
    margin: 0;
  }
  :host([hide-list]) #title span {
    opacity: 1;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 1rem 0 0 0;
    display: flex;
    flex-direction: column-reverse;
  }

  :host([hide-list]) #contents {
    display: none;
  }

  ul p {
    text-align: center;
    color: rgb(184, 184, 184);
  }

  li {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border: 1px var(--secondary-color) solid;
    background: var(--secondary-color);
    border-radius: 8px;
    color: black;
    padding: 1.25rem 0.5rem;
    transition: all 0.2s;
    margin-bottom: 0.5rem;
    text-align: center;
    font-size: 1.8rem;
    user-select: none;
    -webkit-user-select: none;
  }

  li[priority] {
    background-color: var(--danger-color);
    border-color: var(--danger-color);
  }

  li small {
    font-size: 1rem;
    margin-left: 0.5rem;
  }

  li:hover {
    cursor: pointer;
  }

  li:first-child {
    margin-bottom: 0;
  }

  @media (prefers-color-scheme: dark) {
    li {
      color: white;
    }
  }
`;

export const stickyTitles = css`
  #title {
    display: inline-block;
    position: sticky;
    top: 0;
    padding: 1rem 0 1rem 0;
    margin: 0;
    background-color: var(--primary-color);
  }

  .card {
    padding-top: 0;
  }
  :host([hide-list]) .card {
    padding: 0 1rem 0 1rem;
  }

  #title + #contents {
    margin-top: 1rem;
  }
`;
