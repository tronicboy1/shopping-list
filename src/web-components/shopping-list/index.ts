import firebase from "../../services/firebase";
import { getDatabase, ref, onValue, set, DatabaseReference, push } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { css, html, LitElement } from "lit";
import { state, query } from "lit/decorators.js";
import styles from "./css";

interface ShoppingListData {
  [id: string]: {
    item: string;
  };
}

export default class ShoppingList extends LitElement {
  #ref: DatabaseReference | null;
  #clicked: string | null;

  @state()
  listData: ShoppingListData | null = null;
  @query("form")
  form!: HTMLFormElement;
  static styles = styles;

  constructor() {
    super();
    this.#clicked = null;
    this.#ref = null;
  }

  connectedCallback() {
    super.connectedCallback();
    const auth = getAuth(firebase);
    onAuthStateChanged(auth, (auth) => {
      if (auth) {
        const db = getDatabase(firebase);
        this.#ref = ref(db, `${auth.uid}/SHOPPING/`);
        onValue(this.#ref, (snapshot) => {
          this.listData = snapshot.val() as ShoppingListData;
        });
      } else {
        this.removeAttribute("show");
      }
    });
  }

  #handleItemClick: EventListener = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLLIElement || target instanceof HTMLButtonElement)) return;
    const id = target.id;
    if (this.#clicked === id) {
      id === "clear" ? this.#deleteAllItems() : this.#deleteItem(id);
      this.#clicked = null;
    } else {
      this.#clicked = id;
      setTimeout(() => {
        this.#clicked = null;
      }, 400);
    }
  };
  #deleteItem = (id: string) => {
    if (!(this.listData && this.#ref)) return;
    delete this.listData[id];
    set(this.#ref, this.listData);
  };
  #deleteAllItems = () => {
    set(this.#ref!, {});
  };

  #handleInput: EventListener = (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) throw Error("Event target not input.");
    if (input.value.length === input.maxLength) {
      input.setAttribute("class", "invalid");
    } else {
      input.hasAttribute("class") && input.removeAttribute("class");
    }
  };
  #handleAddItem: EventListener = (event) => {
    event.preventDefault();
    const formData = new FormData(this.form);
    const item = String(formData.get("item")!).trim();
    push(this.#ref!, { item });
    this.form.reset();
  };

  render() {
    return html`
      <div class="card">
        <form @submit=${this.#handleAddItem} autocomplete="off">
          <input @input=${this.#handleInput} id="item" name="item" minlength="1" type="text" maxlength="33" required />
          <button id="add" type="submit">Add</button>
        </form>
      </div>
      <div class="card">
        <ul>
          ${this.listData
            ? Object.keys(this.listData).map(
                (key) => html`<li id=${key} @click=${this.#handleItemClick}>${this.listData![key].item}</li>`
              )
            : html`<p>No Items.</p>`}
        </ul>
      </div>
      <div class="card">
        <button id="clear" @click=${this.#handleItemClick} type="button">Clear All</button>
      </div>
    `;
  }
}
