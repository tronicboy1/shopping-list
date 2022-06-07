import BaseModal from "@web-components/base-modal";
import { firebaseApp } from "@web-components/firebase";
import sharedCss, { formCss } from "@web-components/shared-css";
import { DatabaseReference, get, getDatabase, ref, remove, set } from "firebase/database";
import { html, LitElement } from "lit";
import { query, state } from "lit/decorators.js";
import { ShoppingListItem } from "./";

export default class ShoppingItemDetails extends LitElement {
  #uid: string | null = null;
  #key: string | null = null;
  #ref!: DatabaseReference;
  @state()
  private _data: ShoppingListItem | null = null;
  @state()
  private _editLoading = false;
  @state()
  private _deleteLoading = false;
  @query("base-modal")
  private _modal!: BaseModal;

  static styles = [sharedCss, formCss];

  static get observedAttributes(): string[] {
    return ["uid", "key"];
  }
  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (!value) return;
    if (name === "uid") this.#uid = value;
    if (name === "key") this.#key = value;
    if (this.#key && this.#uid) {
      const db = getDatabase(firebaseApp);
      this.#ref = ref(db, `${this.#uid}/SHOPPING/${this.#key}`);
      get(this.#ref)
        .then((data) => {
          if (!data.exists()) throw Error("No data found.");
          this._data = data.val();
          this._modal.toggleAttribute("show", true);
        })
        .catch(() => this._modal.removeAttribute("show"));
    }
  }

  #handleEditSubmit: EventListener = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) throw Error("Submit event origin not a Form Element");
    const formData = new FormData(form);
    const item = formData.get("item")!.toString().trim();
    const amount = Number(formData.get("amount"));
    if (isNaN(amount)) throw TypeError("Quantity must be a number.");
    const memo = formData.get("memo")!.toString().trim();
    const position = this._data?.position;
    this._editLoading = true;
    const newData: Partial<ShoppingListItem> = {
      item,
      amount,
      memo,
      dateAdded: this._data!.dateAdded ?? new Date().getTime(),
    };
    if (position) newData.position = position;
    set(this.#ref, newData)
      .then(() => {
        this._modal.removeAttribute("show");
      })
      .finally(() => (this._editLoading = false));
  };

  #handleDeleteClick: EventListener = () => {
    this._deleteLoading = true;
    remove(this.#ref)
      .then(() => this._modal.removeAttribute("show"))
      .finally(() => (this._deleteLoading = false));
  };

  render() {
    const item = this._data?.item ?? "";
    const dateAdded = this._data?.dateAdded ? new Date(this._data.dateAdded).toISOString().split("T")[0] : "";
    const memo = this._data?.memo ?? "";
    const amount = this._data?.amount?.toString() ?? "1";

    const loadingSpinner = html`<loading-spinner color="white" />`;
    return html`
      <base-modal title="Item Details">
        <form @submit=${this.#handleEditSubmit}>
          <label for="item">Name</label>
          <input type="text" id="item" name="item" maxlength="32" minlength="1" .value=${item} />
          <label for="date-added">Date Added</label>
          <input type="date" id="date-added" name="dateAdded" .value=${dateAdded} disabled />
          <label for="amount">Quantity</label>
          <input id="amount" name="amount" type="number" min="1" .value=${amount} />
          <label for="memo">Memo</label>
          <textarea id="memo" name="memo" .value=${memo}></textarea>
          <button type="submit">${this._editLoading ? loadingSpinner : "Edit"}</button>
          <button @click=${this.#handleDeleteClick} type="button" class="delete">
            ${this._deleteLoading ? loadingSpinner : "Delete"}
          </button>
        </form>
      </base-modal>
    `;
  }
}
