import { css, html, LitElement } from "lit";
import { query, state } from "lit/decorators.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseApp } from "@firebase-logic";
import { DatabaseReference, get, getDatabase, push, ref, remove, Unsubscribe } from "firebase/database";
import baseCss from "./css";
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

  static styles = [
    baseCss,
    sharedCss,
    css`
      :host {
        display: none;
        width: 100%;
      }

      :host([show]) {
        display: block;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    onAuthStateChanged(auth, (auth) => {
      if (auth) {
        this.#uid = auth.uid;
        const db = getDatabase(firebaseApp);
        this.#ref = ref(db, `${auth.uid}/SHOPPING-LISTS/`);
        this.#refreshList();
      }
    });
  }

  #refreshList() {
    return get(this.#ref).then((result) => {
      const data = result.val() as ListGroups | null;
      this._listGroups = data;
    });
  }

  #handleAddItem: EventListener = (event) => {
    event.preventDefault();
    if (this._adding) return;
    const formData = new FormData(this.form);
    const listName = String(formData.get("list-name")!).trim();
    if (listName.length > 32) return;
    this._adding = true;
    push(this.#ref, { listName, data: {} })
      .then(() => {
        this.form.reset();
        return this.#refreshList();
      })
      .catch((error) => alert(error))
      .finally(() => {
        this._adding = false;
      });
  };

  #clearAll = () => {
    this._deleteLoading = true;
    remove(this.#ref)
      .then(() => this.#refreshList())
      .finally(() => {
        this._deleteModal.removeAttribute("show");
        this._deleteLoading = false;
      });
  };

  #handleClearAllClick = () => {
    this._deleteModal.toggleAttribute("show", true);
  };

  #handleInput: EventListener = (event) => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) throw Error("Event target not input.");
    if (input.value.length === input.maxLength) {
      input.setAttribute("class", "invalid");
    } else {
      input.removeAttribute("class");
    }
  };

  render() {
    return html`
      <base-modal title="Delete all Lists?">
        <div style="display: flex; flex-direction: column;">
          <button @click=${this.#clearAll} type="button" class="delete">
            ${this._deleteLoading ? html`<loading-spinner color="white" />` : "Yes"}
          </button>
          <button type="button" @click=${() => this._deleteModal.removeAttribute("show")}>Cancel</button>
        </div>
      </base-modal>
      <div class="card">
        <form @submit=${this.#handleAddItem} autocomplete="off">
          <input
            @input=${this.#handleInput}
            id="list-name"
            name="list-name"
            minlength="1"
            type="text"
            maxlength="33"
            required
          />
          <button id="add" type="submit">${this._adding ? html`<loading-spinner color="white" />` : "Add"}</button>
        </form>
      </div>
      ${this._listGroups
        ? Object.keys(this._listGroups).map(
            (key) => html`<shopping-list @deleted=${() => this.#refreshList()} list-id=${key} uid=${this.#uid}></shopping-list>`
          )
        : html`<p style="margin-top: 6rem;">No Lists.</p>`}
      ${this._listGroups
        ? html`<div class="card" style="margin-bottom: 10rem">
            <button @click=${this.#handleClearAllClick} id="clear" type="button">Clear All</button>
          </div>`
        : ""}
    `;
  }
}
