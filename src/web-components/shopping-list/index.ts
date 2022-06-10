import { html, LitElement } from "lit";
import { query, state } from "lit/decorators.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseApp } from "@firebase-logic";
import { DatabaseReference, getDatabase, onValue, push, ref, remove, Unsubscribe } from "firebase/database";
import css from "./css";
import sharedCss from "../shared-css";
import { ListGroups } from "./types";
import BaseModal from "@web-components/base-modal";
export default class AllShoppingLists extends LitElement {
  #ref!: DatabaseReference;
  #uid!: string;
  #unsubscribe!: Unsubscribe;
  @state()
  private _listGroups: ListGroups | null = null;
  @state()
  private _adding = false;
  @state()
  private _deleteLoading = false;
  @query("form")
  form!: HTMLFormElement;
  @query("base-modal")
  _deleteModal!: BaseModal;

  static styles = [css, sharedCss];

  connectedCallback(): void {
    super.connectedCallback();
    onAuthStateChanged(auth, (auth) => {
      if (auth) {
        this.#uid = auth.uid;
        const db = getDatabase(firebaseApp);
        this.#ref = ref(db, `${auth.uid}/SHOPPING-LISTS/`);
        this.#unsubscribe = onValue(this.#ref, (snapshot) => {
          const data = snapshot.val() as ListGroups | null;
          if (!data) {
            this._listGroups = null;
            return;
          }
          this._listGroups = data;
        });
      }
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unsubscribe();
  }

  #handleAddItem: EventListener = (event) => {
    event.preventDefault();
    if (this._adding) return;
    const formData = new FormData(this.form);
    const listName = String(formData.get("list-name")!).trim();
    if (listName.length > 32) return;
    this._adding = true;
    push(this.#ref, { listName, data: {} })
      .then(() => this.form.reset())
      .catch((error) => alert(error))
      .finally(() => {
        this._adding = false;
      });
  };

  #clearAll = () => {
    this._deleteLoading = true;
    remove(this.#ref).finally(() => {
      this._deleteModal.removeAttribute("show");
      this._deleteLoading = false;
    });
  };

  #handleClearAllClick = () => {
    this._deleteModal.toggleAttribute("show", true);
  };

  render() {
    return html`
      <base-modal title="Delete all Lists?">
        <div style="display: flex; flex-direction: column;">
          <button @click=${this.#clearAll} type="button" class="delete">
            ${this._deleteLoading ? html`<loading-spinner color="white" />` : "Yes"}
          </button>
          <button type="button" @click=${() => this.removeAttribute("show")}>Cancel</button>
        </div>
      </base-modal>
      <div class="card">
        <form @submit=${this.#handleAddItem} autocomplete="off">
          <input id="list-name" name="list-name" minlength="1" type="text" maxlength="33" required />
          <button id="add" type="submit">${this._adding ? html`<loading-spinner color="white" />` : "Add"}</button>
        </form>
      </div>
      ${this._listGroups
        ? Object.keys(this._listGroups).map(
            (key) => html`<shopping-list list-id=${key} uid=${this.#uid}></shopping-list>`
          )
        : html`<p style="margin-top: 6rem;">No Lists.</p>`}
      ${this._listGroups
        ? html`<div class="card">
            <button @click=${this.#handleClearAllClick} id="clear" type="button">Clear All</button>
          </div>`
        : ""}
    `;
  }
}
