import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Firebase } from "@firebase-logic";
import { child, get, push, ref, remove } from "firebase/database";
import baseCss from "./css";
import sharedCss from "../shared-css";
import { ListGroups, ShoppingListItem } from "./types";
import ShoppingList from "./shopping-list";
import {
  combineLatest,
  first,
  fromEvent,
  map,
  mergeMap,
  of,
  startWith,
  Subscription,
  switchMap,
  tap,
  timeout,
} from "rxjs";
import "./shopping-list";
import "./shopping-item-details";
import { ListService } from "../../app/list.service";

export const tagName = "all-shopping-lists";

@customElement(tagName)
export default class AllShoppingLists extends LitElement {
  @state()
  private _adding = false;
  private subscriptions = new Subscription();
  @state()
  hideAddListForm = true;
  @state()
  shoppingListsData: ListGroups = {};

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();
    Firebase.uid$.pipe(switchMap((uid) => ListService.getLists(uid).pipe(timeout({ first: 6000 })))).subscribe({
      next: (listData) => {
        this.dispatchEvent(new Event("shopping-lists-loaded"));
        this.shoppingListsData = listData;
      },
      error: () => window.location.reload(),
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.subscriptions.unsubscribe();
  }

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
    Firebase.uid$
      .pipe(
        first(),
        mergeMap((uid) => push(ref(Firebase.db, `${uid}/SHOPPING-LISTS/`), { listName, data: {} }))
      )
      .subscribe({
        next: () => form.reset(),
        error: (error) => alert(error),
        complete: () => {
          this._adding = false;
          this.#handleCloseAddList();
        },
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

    let refCache: ReturnType<typeof ref>;
    Firebase.uid$
      .pipe(
        first(),
        mergeMap((uid) => {
          refCache = ref(Firebase.db, `${uid}/SHOPPING-LISTS/`);
          return get(child(refCache, `${draggedItemListId}/data/${draggedItemId}`));
        }),
        map((result) => {
          const data = result.val() as ShoppingListItem | null;
          if (!data) throw Error("invalid Item ID or List ID; No data to move.");
          return data;
        }),
        mergeMap((data) => push(child(refCache, `${listId}/data`), data)),
        mergeMap(() => remove(child(refCache, `${draggedItemListId}/data/${draggedItemId}`)))
      )
      .subscribe();
  };

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

  render() {
    return html`
      ${Object.entries(this.shoppingListsData).map(
        ([key, value]) => html`<shopping-list
          @dragover=${this.#handleDragOver}
          @drop=${this.#handleDrop}
          list-data=${JSON.stringify(value.data ?? {})}
          list-id=${key}
          list-name=${value.listName}
        ></shopping-list>`
      )}
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
