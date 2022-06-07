import firebase from "../../services/firebase";
import { getDatabase, ref, onValue, set, DatabaseReference, push } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { html, LitElement } from "lit";
import { state, query } from "lit/decorators.js";
import styles from "./css";
import sharedStyles from "../shared-css";
import ShoppingItemDetails from "./shopping-item-details";

customElements.define("shopping-item-details", ShoppingItemDetails);

type ShoppingListData = Record<string, ShoppingListItem>;

export interface ShoppingListItem {
  item: string;
  memo: string;
  dateAdded: string;
  amount: number;
  position: GeolocationCoordinates;
}

export default class ShoppingList extends LitElement {
  #ref!: DatabaseReference;
  #clicked: string | null = null;
  #clickedAt: { id: string; when: Date } | null = null;

  @state()
  listData: ShoppingListData | null = null;
  @state()
  private _adding = false;
  @query("form")
  form!: HTMLFormElement;
  @query("shopping-item-details")
  private _shoppingItemDetails!: ShoppingItemDetails;

  static styles = [styles, sharedStyles];

  connectedCallback() {
    super.connectedCallback();
    const auth = getAuth(firebase);
    onAuthStateChanged(auth, (auth) => {
      if (auth) {
        this._shoppingItemDetails.setAttribute("uid", auth.uid);
        const db = getDatabase(firebase);
        this.#ref = ref(db, `${auth.uid}/SHOPPING/`);
        onValue(this.#ref, (snapshot) => {
          this.listData = snapshot.val() as ShoppingListData;
        });
      }
    });
  }

  #handleInput: EventListener = (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) throw Error("Event target not input.");
    if (input.value.length === input.maxLength) {
      input.setAttribute("class", "invalid");
    } else {
      input.hasAttribute("class") && input.removeAttribute("class");
    }
  };

  #handleItemClick: EventListener = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLLIElement || target instanceof HTMLButtonElement)) return;
    const id = target.id;
    if (this.#clicked === id) {
      id === "clear" ? this.#deleteAllItems() : this.#deleteItem(id);
      this.#clicked = null;
    } else {
      this.#clicked = id;
      this.#clickedAt = { id, when: new Date() };
      setTimeout(() => {
        this.#clicked = null;
      }, 400);
    }
  };

  #handleItemMouseup: EventListener = (event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLLIElement) || !this.#clickedAt) return;
    const id = target.id;
    if (this.#clickedAt.id !== id) {
      this.#clickedAt = null;
      return;
    }
    const heldLongEnough = new Date().getTime() - this.#clickedAt.when.getTime() > 500;
    if (heldLongEnough) {
      this._shoppingItemDetails.setAttribute("key", id);
    }
    this.#clickedAt = null;
  };

  #deleteItem = (id: string) => {
    if (!(this.listData && this.#ref)) return;
    delete this.listData[id];
    set(this.#ref, this.listData);
  };

  #deleteAllItems = () => {
    set(this.#ref!, {});
  };

  #handleAddItem: EventListener = async (event) => {
    event.preventDefault();
    if (this._adding) return;
    const formData = new FormData(this.form);
    const item = String(formData.get("item")!).trim();
    const dateAdded = new Date().getTime();
    this._adding = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        push(this.#ref!, { item, dateAdded, position }).then(() => (this._adding = false));
        this.form.reset();
      },
      (error) => {
        push(this.#ref!, { item, dateAdded }).then(() => (this._adding = false));
        this.form.reset();
      },
      { timeout: 1000 }
    );
  };

  render() {
    return html`
      <shopping-item-details></shopping-item-details>
      <div class="card">
        <form @submit=${this.#handleAddItem} autocomplete="off">
          <input @input=${this.#handleInput} id="item" name="item" minlength="1" type="text" maxlength="33" required />
          <button id="add" type="submit">${this._adding ? html`<loading-spinner color="white" />` : "Add"}</button>
        </form>
      </div>
      <div class="card">
        <ul>
          ${this.listData
            ? Object.keys(this.listData).map(
                (key) =>
                  html`<li id=${key} @mouseup=${this.#handleItemMouseup} @mousedown=${this.#handleItemClick}>
                    ${this.listData![key].item}
                  </li>`
              )
            : html`<p>No Items.</p>`}
        </ul>
      </div>
      <div style="margin-bottom: 11vh;" class="card">
        <button id="clear" @click=${this.#handleItemClick} type="button">Clear All</button>
      </div>
    `;
  }
}
