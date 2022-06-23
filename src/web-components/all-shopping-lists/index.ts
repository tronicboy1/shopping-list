import { css, html, LitElement } from "lit";
import { state } from "lit/decorators.js";
import { firebaseApp, getAuthStateOnce } from "@firebase-logic";
import { child, DatabaseReference, get, getDatabase, push, ref, remove } from "firebase/database";
import baseCss from "./css";
import sharedCss from "../shared-css";
import { ListGroups, ShoppingListItem } from "./types";
import ShoppingList from "./shopping-list";

export default class AllShoppingLists extends LitElement {
  #ref!: DatabaseReference;
  #uid: string;
  #hideAddListForm: boolean;
  #shoppingListsData: ListGroups | null;
  #controller: AbortController;
  @state()
  private _adding = false;

  static styles = [
    baseCss,
    sharedCss,
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
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

      #open-add-list {
        display: none;
        width: 50px;
        height: 50px;
        margin: 1rem auto;
        background-color: var(--secondary-color);
        border: 1px solid var(--secondary-color);
        border-radius: 50%;
        cursor: pointer;
      }
      #open-add-list[show] {
        display: flex;
      }
    `,
  ];

  constructor() {
    super();
    this.#hideAddListForm = true;
    this.#shoppingListsData = null;
    this.#uid = "";
    this.#controller = new AbortController();
    if (!("serviceWorker" in navigator)) alert("This site requires the Service Worker API");
    navigator.serviceWorker.addEventListener(
      "message",
      (event) => {
        const data = event.data;
        if (data.type === "auth") {
          this.uid = data.uid;
        }
      },
      { signal: this.#controller.signal }
    );
    getAuthStateOnce().then((uid) => {
      this.uid = uid;
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.#handleVisibilityChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.#handleVisibilityChange);
    this.#controller.abort();
  }

  get uid(): string {
    return this.#uid;
  }
  set uid(value: string) {
    if (this.#uid === value) return;
    this.#uid = value;
    if (this.#uid) {
      const db = getDatabase(firebaseApp);
      this.#ref = ref(db, `${this.#uid}/SHOPPING-LISTS/`);
      this.#loadAllResources();
    }
  }
  get hideAddListForm(): boolean {
    return this.#hideAddListForm;
  }
  set hideAddListForm(value: boolean) {
    const oldValue = this.hideAddListForm;
    this.#hideAddListForm = Boolean(value);
    this.requestUpdate("hideAddListForm", oldValue);
  }
  get shoppingListsData(): ListGroups | null {
    return this.#shoppingListsData;
  }
  set shoppingListsData(value: ListGroups | null) {
    const oldValue = this.shoppingListsData;
    this.#shoppingListsData = value;
    this.requestUpdate("shoppingListsData", oldValue);
    if (!this.shoppingListsData) {
      this.hideAddListForm = false;
    }
  }

  #refreshList() {
    return get(this.#ref).then((result) => {
      const data = result.val() as ListGroups | null;
      this.shoppingListsData = data;
    });
  }

  #loadAllResources() {
    const allLoadingPromises: Promise<any>[] = [this.#refreshList()];
    if (!customElements.get("shopping-list")) {
      allLoadingPromises.push(
        import("@web-components/all-shopping-lists/shopping-list").then((imports) =>
          customElements.define("shopping-list", imports.default)
        )
      );
    }
    if (!customElements.get("shopping-item-details")) {
      allLoadingPromises.push(
        import("@web-components/all-shopping-lists/shopping-item-details").then((imports) =>
          customElements.define("shopping-item-details", imports.default)
        )
      );
    }
    return Promise.all(allLoadingPromises).then(() => {
      const loadedEvent = new Event("shopping-lists-loaded", { bubbles: true, composed: true });
      this.dispatchEvent(loadedEvent);
    });
  }

  #handleVisibilityChange: EventListener = () => {
    const visibilityState = document.visibilityState;
    if (visibilityState === "visible" && this.#ref) this.#refreshList();
  };

  #handleOpenAddListClick: EventListener = () => {
    this.hideAddListForm = false;
    this.updateComplete.then((result) => {
      const input = this.shadowRoot!.querySelector<HTMLInputElement>("input#list-name")!;
      input.focus();
    });
  };
  #handleCloseAddList = () => {
    this.hideAddListForm = true;
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
        this.#handleCloseAddList();
      });
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
    return html`
      ${this.shoppingListsData
        ? Object.keys(this.shoppingListsData).map(
            (key) =>
              html`<shopping-list
                @deleted=${() => this.#refreshList()}
                @dragover=${this.#handleDragOver}
                @drop=${this.#handleDrop}
                list-id=${key}
                uid=${this.#uid}
              ></shopping-list>`
          )
        : ""}
      <div ?show=${this.hideAddListForm} id="open-add-list" @click=${this.#handleOpenAddListClick}>
        <plus-icon color="white"></plus-icon>
      </div>
      <div ?hide=${this.hideAddListForm} class="card">
        <form @submit=${this.#handleAddList} autocomplete="off">
          <input
            @input=${this.#handleInput}
            @blur=${this.#handleCloseAddList}
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
    `;
  }
}
