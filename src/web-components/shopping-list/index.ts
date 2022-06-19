import { css, html, LitElement } from "lit";
import { query, state } from "lit/decorators.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseApp } from "@firebase-logic";
import { child, DatabaseReference, get, getDatabase, push, ref, remove } from "firebase/database";
import baseCss from "./css";
import sharedCss from "../shared-css";
import { ListGroups, ShoppingListItem } from "./types";
import BaseModal from "@web-components/base-modal";
import ShoppingList from "./shopping-list";
export default class AllShoppingLists extends LitElement {
  #ref!: DatabaseReference;
  #uid!: string;
  @state()
  private _listGroups: ListGroups | null = null;
  @state()
  private _adding = false;
  @state()
  private _deleteLoading = false;
  @state()
  private _initLoading = true;
  @query("base-modal")
  _clearAllModal!: BaseModal;

  static styles = [
    baseCss,
    sharedCss,
    css`
      :host {
        display: none;
        width: 100%;
      }

      :host([show]) {
        display: flex;
        flex-direction: column;
      }

      loading-spinner + p {
        display: none;
      }

      label {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        text-align: center;
      }

      button + button {
        margin-top: 1rem;
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
        this.#refreshList().finally(() => {
          this._initLoading = false;
        });
      }
    });
    document.addEventListener("visibilitychange", this.#handleVisibilityChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.#handleVisibilityChange);
  }

  #refreshList() {
    return get(this.#ref).then((result) => {
      const data = result.val() as ListGroups | null;
      this._listGroups = data;
    });
  }

  #handleVisibilityChange: EventListener = () => {
    const visibilityState = document.visibilityState;
    if (visibilityState === "visible" && this.#ref) this.#refreshList();
  };

  #handleAddList: EventListener = (event) => {
    event.preventDefault();
    if (this._adding) return;
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) throw Error("This listener can only be called on a form.");
    const formData = new FormData(form);
    const listName = String(formData.get("list-name")!).trim();
    if (listName.length > 32) return;
    this._adding = true;
    push(this.#ref, { listName, data: {} })
      .then(() => {
        form.reset();
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
        this._clearAllModal.removeAttribute("show");
        this._deleteLoading = false;
      });
  };

  #handleClearAllClick = () => {
    this._clearAllModal.toggleAttribute("show", true);
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

  #handleDragOver: EventListener = (event) => {
    if (!(event instanceof DragEvent && event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };
  #handleDrop: EventListener = (event) => {
    if (!(event instanceof DragEvent && event.dataTransfer)) return;
    const target = event.currentTarget;
    if (!(target instanceof ShoppingList)) return;
    const listId = target.getAttribute("list-id")!;
    const draggedItemListId = event.dataTransfer.getData("listId");
    if (listId === draggedItemListId) return;
    const draggedItemId = event.dataTransfer.getData("id");
    get(child(this.#ref, `${draggedItemListId}/data/${draggedItemId}`))
      .then((result) => {
        const data = result.val() as ShoppingListItem | null;
        if (!data) throw Error("invalid Item ID or List ID; No data to move.");
        return remove(child(this.#ref, `${draggedItemListId}/data/${draggedItemId}`)).then(() => Promise.resolve(data));
      })
      .then((data) => {
        push(child(this.#ref, `${listId}/data`), data);
      });
  };

  render() {
    if (this._initLoading) {
      return html`<div style="margin: auto; margin-top: 30vh;">
        <loading-spinner />
      </div>`;
    }
    return html`
      <base-modal title="Delete all Lists?">
        <div style="display: flex; flex-direction: column;">
          <button @click=${this.#clearAll} type="button" class="delete">
            ${this._deleteLoading ? html`<loading-spinner color="white" />` : "Yes"}
          </button>
          <button type="button" @click=${() => this._clearAllModal.removeAttribute("show")}>Cancel</button>
        </div>
      </base-modal>
      ${this._listGroups
        ? Object.keys(this._listGroups).map(
            (key) =>
              html`<shopping-list
                @deleted=${() => this.#refreshList()}
                @dragover=${this.#handleDragOver}
                @drop=${this.#handleDrop}
                list-id=${key}
                uid=${this.#uid}
              ></shopping-list>`
          )
        : html`<p style="margin-top: 6rem;">No Lists.</p>`}
      <div class="card">
        <form @submit=${this.#handleAddList} autocomplete="off">
          <input
            @input=${this.#handleInput}
            id="list-name"
            name="list-name"
            minlength="1"
            type="text"
            maxlength="33"
            required
          />
          <button id="add" type="submit">
            ${this._adding ? html`<loading-spinner color="white" />` : html`<plus-icon color="white"></plus-icon>`}
          </button>
        </form>
      </div>
      ${this._listGroups
        ? html`<div class="card" style="margin-bottom: 10rem">
            <button @click=${this.#handleClearAllClick} id="clear" type="button">Clear All</button>
          </div>`
        : ""}
    `;
  }
}
