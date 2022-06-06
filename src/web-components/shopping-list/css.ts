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
}

li:hover {
  cursor: pointer;
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
  li {
    color: white;
  }
}
`;
