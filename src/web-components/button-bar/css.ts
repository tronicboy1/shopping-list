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
  width: 95%;
  max-width: 600px;
  background-color: var(--primary-color);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.168);
  border: 1px solid var(--primary-color);
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
}

ul {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 0 2rem;
  margin: 0;
}

li {
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
