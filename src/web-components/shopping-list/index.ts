import firebase from "../../services/firebase";
import { getDatabase, ref, onValue, set, DatabaseReference, push, remove, child } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { html, LitElement, PropertyValueMap } from "lit";
import { state, query } from "lit/decorators.js";
import styles from "./css";
import sharedStyles from "../shared-css";
import ShoppingItemDetails from "./shopping-item-details";

type ShoppingListData = Record<string, ShoppingListItem>;

export interface ShoppingListItem {
  item: string;
  memo: string;
  dateAdded: number;
  amount: number;
  priority: boolean;
}

export default class ShoppingList extends LitElement {
  #ref!: DatabaseReference;
  #clicked: string | null = null;
  #clickedAt: { id: string; when: Date; where: { x: number; y: number } } | null = null;

  @state()
  listData: ShoppingListData | null = null;
  @state()
  private _adding = false;
  @query("form")
  form!: HTMLFormElement;
  @query("shopping-item-details")
  private _shoppingItemDetails!: ShoppingItemDetails;

  static styles = [styles, sharedStyles];

  constructor() {
    super();
    import("./shopping-item-details").then((ShoppingItemDetails) =>
      customElements.define("shopping-item-details", ShoppingItemDetails.default)
    );
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
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
      if (event instanceof MouseEvent) {
        this.#clickedAt = { id, when: new Date(), where: { x: event.clientX, y: event.clientY } };
      }
      if (event instanceof TouchEvent) {
        this.#clickedAt = { id, when: new Date(), where: { x: event.touches[0].clientX, y: event.touches[0].clientY } };
      }
      setTimeout(() => {
        this.#clicked = null;
      }, 400);
    }
  };

  #handleItemMouseup = (event: Event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLLIElement) || !this.#clickedAt) return;
    const id = target.id;
    if (this.#clickedAt.id !== id) {
      this.#clickedAt = null;
      return;
    }
    let y2: number | null = null;
    if (event instanceof MouseEvent) {
      y2 = event.clientY;
    }
    if (event instanceof TouchEvent) {
      y2 = event.changedTouches[0].clientY
    }
    if (!y2) return;
    const notMoved = Math.abs(y2 - this.#clickedAt.where.y) < 50;
    const heldLongEnough = new Date().getTime() - this.#clickedAt.when.getTime() > 500;
    if (heldLongEnough && notMoved) {
      this._shoppingItemDetails.setAttribute("key", id);
    }
    this.#clickedAt = null;
  };

  #deleteItem = (id: string) => {
    if (!(this.listData && this.#ref)) return;
    remove(child(this.#ref, id));
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
    const newData: Partial<ShoppingListItem> = { item, dateAdded };
    push(this.#ref!, newData).then(() => (this._adding = false));
        this.form.reset();
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
                  html`<li
                    id=${key}
                    @mouseup=${this.#handleItemMouseup}
                    @touchend=${this.#handleItemMouseup}
                    @mousedown=${this.#handleItemClick}
                    @touchstart=${this.#handleItemClick}
                  >
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
