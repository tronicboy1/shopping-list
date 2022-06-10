import { getDatabase, ref, onValue, set, DatabaseReference, push, remove, child } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { html, LitElement, PropertyValueMap } from "lit";
import { state, query } from "lit/decorators.js";
import styles from "./css";
import sharedStyles from "../shared-css";
import ShoppingItemDetails from "./shopping-item-details";
import { firebaseApp } from "@firebase-logic";

type ShoppingListData = Record<string, ShoppingListItem>;

export interface ShoppingListItem {
  item: string;
  memo: string;
  dateAdded: number;
  amount: number;
  priority: boolean;
  order: number;
}

export default class ShoppingList extends LitElement {
  #ref!: DatabaseReference;
  #notificationRef!: DatabaseReference;
  #uid!: string;
  #clicked: string | null = null;
  #listData: ShoppingListData | null = null;
  @state()
  sortedData: (ShoppingListItem & { key: string })[] | null = null;
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
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, (auth) => {
      if (auth) {
        this.#uid = auth.uid;
        this._shoppingItemDetails.setAttribute("uid", auth.uid);
        const db = getDatabase(firebaseApp);
        this.#ref = ref(db, `${auth.uid}/SHOPPING/`);
        this.#notificationRef = ref(db, `NOTIFICATIONS/${auth.uid}`);
        onValue(this.#ref, (snapshot) => {
          const data = snapshot.val() as ShoppingListData | null;
          if (!data || Object.keys(data).length === 0) {
            this.#listData = null;
            this.sortedData = null;
            return;
          }
          const keys = Object.keys(data);
          if (Object.values(data).some((value) => isNaN(Number(value.order)))) {
            keys.forEach((key, index) => (data[key].order = index));
            set(this.#ref, data);
            return;
          }
          this.#listData = data;
          this.sortedData = Object.keys(this.#listData)
            .map((key) => ({ key, ...this.#listData![key] }))
            .sort((a, b) => (a.order < b.order ? -1 : 1));
        });
      }
    });
  }

  #handleInput: EventListener = (event) => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) throw Error("Event target not input.");
    if (input.value.length === input.maxLength) {
      input.setAttribute("class", "invalid");
    } else {
      input.hasAttribute("class") && input.removeAttribute("class");
    }
  };

  #handleItemClick: EventListener = (event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLLIElement || target instanceof HTMLButtonElement)) return;
    const id = target.id;
    if (event instanceof MouseEvent || event instanceof TouchEvent) {
      if (this.#clicked === id) {
        id === "clear" ? this.#deleteAllItems() : this.#deleteItem(id); // only delete on mouse events
        this.#clicked = null;
      } else {
        this.#clicked = id;
        setTimeout(() => {
          this.#clicked = null;
        }, 400);
      }
    }
  };

  #deleteItem = (id: string) => {
    if (!(this.#listData && this.#ref)) return;
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
    if (item.length > 32) return;
    const dateAdded = new Date().getTime();
    this._adding = true;
    const newData: ShoppingListItem = {
      item,
      dateAdded,
      order: this.#listData ? Object.keys(this.#listData).length + 1 : 0,
      memo: "",
      amount: 1,
      priority: false,
    };
    push(this.#ref, newData)
      .then(() => {
        fetch(process.env.NOTIFICATION_URI!).then(() =>
          set(this.#notificationRef, { item: newData.item, uid: this.#uid })
        );
      })
      .catch((error) => alert(error))
      .finally(() => (this._adding = false));
    this.form.reset();
  };

  #handleDragStart: EventListener = (event) => {
    if (!(event instanceof DragEvent && event.dataTransfer)) return;
    const target = event.currentTarget;
    if (!(target instanceof HTMLLIElement)) return;
    const id = target.id;
    event.dataTransfer.setData("id", id);
    event.dataTransfer.dropEffect = "move";
  };
  #handleDragOver: EventListener = (event) => {
    if (!(event instanceof DragEvent && event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };
  #handleDrop: EventListener = (event) => {
    if (!(event instanceof DragEvent && event.dataTransfer)) return;
    const target = event.currentTarget;
    if (!(target instanceof HTMLLIElement)) return;
    const droppedLocationId = target.id;
    const draggedId = event.dataTransfer.getData("id");
    if (droppedLocationId === draggedId) {
      this._shoppingItemDetails.setAttribute("key", draggedId);
      return;
    }
    if (!this.#listData) return;
    const droppedLocationData = this.#listData[droppedLocationId];
    const draggedData = this.#listData[draggedId];
    if (!(draggedData && droppedLocationData)) return;
    const newSortedArray = [...this.sortedData!].filter((item) => item.key !== draggedId);
    const indexOfDropped = newSortedArray.findIndex((item) => item.key === droppedLocationId);
    const itemsUpToDropped = newSortedArray.slice(0, indexOfDropped);
    const itemsAfterDropped = newSortedArray.slice(indexOfDropped);
    const changedOrder = [...itemsUpToDropped, { key: draggedId, ...draggedData }, ...itemsAfterDropped];
    const newData = { ...this.#listData };
    changedOrder.forEach((item, index) => {
      newData[item.key].order = index;
    });
    set(this.#ref, newData);
  };

  render() {
    const list = this.sortedData
      ? this.sortedData.map(
          (item) => html`<li
            id=${item.key!}
            draggable="true"
            ?priority=${item.priority}
            @click=${this.#handleItemClick}
            @dragstart=${this.#handleDragStart}
            @dragover=${this.#handleDragOver}
            @drop=${this.#handleDrop}
          >
            <span>${item.item}</span>
            ${item.amount && item.amount > 1 ? html`<small>x${item.amount}</small>` : ""}
          </li>`
        )
      : html`<p>No Items.</p>`;

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
          ${list}
        </ul>
      </div>
      <div style="margin-bottom: 11vh;" class="card">
        <button id="clear" @click=${this.#handleItemClick} type="button">Clear All</button>
      </div>
    `;
  }
}
