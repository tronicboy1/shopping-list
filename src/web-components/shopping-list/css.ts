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
  -webkit-user-select: none;
}

li:hover {
  cursor: pointer;
}

li:first-child {
  margin-bottom: 0;
}

form {
  display: flex;
  flex-direction: row;
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

.invalid {
  background-color: rgb(255, 250, 211);
  display: block;
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

@media (prefers-color-scheme: dark) {
  li {
    color: white;
  }
}
`;
