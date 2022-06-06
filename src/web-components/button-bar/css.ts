import { css } from "lit";

export default css`
div {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  height: 10vh;
  min-height: 100pxs;
  width: 90%;
  max-width: 500px;
  background-color: var(--primary-color);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.168);
  border: 1px solid var(--primary-color);
  border-radius: 8px 8px 0 0;
}

ul {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 0;
  margin: 0;
}

li {
  padding: 1rem;
  cursor: pointer;
}

svg {
  fill: white;
}

@media (prefers-color-scheme: light) {
  svg {
    fill: var(--highlight-color);
  }
}

@media (prefers-color-scheme: dark) {
  svg {
    fill: white;
  }
}
`
