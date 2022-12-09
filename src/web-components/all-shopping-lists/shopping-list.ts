/**
 * I tested using web workers for onValue listeners but the result was much slower
 * than simply running the listeners in the main thread.
 */

//prettier-ignore
import { getDatabase, ref, onValue, set, DatabaseReference, push, remove, child, get, Unsubscribe, DataSnapshot } from "firebase/database";
import { html, LitElement, PropertyValueMap } from "lit";
import { state, query, property } from "lit/decorators.js";
import styles, { listCss, stickyTitles } from "./css";
import sharedStyles from "../shared-css";
import ShoppingItemDetails from "./shopping-item-details";
import { Firebase } from "@firebase-logic";
import { ShoppingListData, ShoppingListItem } from "./types";
import { getStorage, ref as getStorageRef, deleteObject } from "firebase/storage";
import {
  BehaviorSubject,
  combineLatest,
  filter,
  first,
  forkJoin,
  fromEvent,
  map,
  mergeMap,
  Observable,
  of,
  OperatorFunction,
  Subscription,
  switchMap,
  tap,
} from "rxjs";

export default class ShoppingList extends LitElement {
  #notificationRef!: DatabaseReference;
  #listData: ShoppingListData | null;
  #clickedItemId: string | null;
  private listIdSubject = new BehaviorSubject<string | null>(null);
  private listId$ = this.listIdSubject.pipe(filter((id) => Boolean(id)) as OperatorFunction<string | null, string>);
  private subscriptions = new Subscription();
  private uidAndListId$ = combineLatest([Firebase.uid$, this.listId$]);
  private isVisible$ = new BehaviorSubject(true);

  @property({ reflect: true, attribute: "hide-list", type: Boolean })
  hideList = false;
  @property({ type: String, attribute: "list-name" })
  listName = "";
  set listId(val: string) {
    this.listIdSubject.next(val);
  }
  @property({ attribute: "list-id", type: String })
  get listId() {
    return this.listIdSubject.getValue() ?? "";
  }
  @state()
  sortedData: (ShoppingListItem & { key: string })[] | null = null;
  @state()
  private _adding = false;
  @state()
  private _initLoading = true;
  @query("form")
  form!: HTMLFormElement;
  @query("shopping-item-details")
  private _shoppingItemDetails!: ShoppingItemDetails;

  static styles = [styles, sharedStyles, listCss, stickyTitles];

  constructor() {
    super();
    this.#listData = null;
    this.#clickedItemId = null;
  }

  connectedCallback() {
    super.connectedCallback();
    fromEvent(document, "visibilitychange")
      .pipe(
        map(() => {
          const visibilityState = document.visibilityState;
          return visibilityState === "visible";
        })
      )
      .subscribe((val) => this.isVisible$.next(val));
    this.uidAndListId$
      .pipe(
        first(),
        mergeMap(([uid, listId]) => forkJoin([of(uid), of(listId), this.getListData(uid, listId).pipe(first())])),
        mergeMap(([uid, listId, data]) => {
          const keys = Object.keys(data);
          if (Object.values(data).some((value) => isNaN(Number(value.order)))) {
            keys.forEach((key, index) => (data[key].order = index)); // Reset order if order not present any children
            return set(this.getDatabaseRef(uid, listId), data);
          }
          return of();
        })
      )
      .subscribe();
    this.subscriptions.add(
      combineLatest([Firebase.uid$, this.listId$, this.isVisible$])
        .pipe(
          switchMap(([uid, listId, isVisible]) => {
            this._initLoading = true;
            return isVisible ? this.getListData(uid, listId) : of({});
          })
        )
        .subscribe((data) => {
          this.#listData = data;
          this._initLoading = false;
          this.sortedData = Object.keys(this.#listData)
            .map((key) => ({ key, ...this.#listData![key] }))
            .sort((a, b) => (a.order < b.order ? -1 : 1));
        })
    );
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.subscriptions.unsubscribe();
  }

  private getDatabaseRef(uid: string, listId: string, data = true) {
    return ref(Firebase.db, `${uid}/SHOPPING-LISTS/${listId}/${data ? "data" : ""}`);
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.uidAndListId$.subscribe(([uid, listId]) => {
      this._shoppingItemDetails.setAttribute("uid", uid);
      this._shoppingItemDetails.setAttribute("list-id", listId);
    });
  }

  private getListData(uid: string, listId: string) {
    return new Observable<DataSnapshot>((observer) => {
      return onValue(
        this.getDatabaseRef(uid, listId),
        (snapshot) => observer.next(snapshot),
        (err) => observer.error(err)
      );
    }).pipe(
      map((snapshot) => {
        const data = snapshot.val() as ShoppingListData | null;
        if (!data || Object.keys(data).length === 0) {
          return {};
        }
        return data;
      })
    );
  }

  #handleNewItemInput: EventListener = (event) => {
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
      if (this.#clickedItemId === id) {
        this.#deleteItem(id); // only delete on mouse events
        this.#clickedItemId = null;
      } else {
        this.#clickedItemId = id;
        setTimeout(() => {
          this.#clickedItemId = null;
        }, 400);
      }
    }
  };

  #toggleHideListOnClick: EventListener = () => {
    this.hideList = !this.hideList;
  };

  #deleteItem = (id: string) => {
    if (!this.#listData) return;
    const data = this.#listData[id];
    if (!data) throw TypeError("Cannot delete item that does not exist.");
    const storageRef = getStorageRef(Firebase.storage, data.imagePath);
    this.uidAndListId$
      .pipe(
        first(),
        mergeMap(([uid, farmId]) =>
          forkJoin([remove(child(this.getDatabaseRef(uid, farmId), id)), deleteObject(storageRef).catch(() => {})])
        )
      )
      .subscribe();
  };

  #handleDeleteEvent = (event: CustomEvent<string>) => this.#deleteItem(event.detail);

  #handleDeleteList = () => {
    this.uidAndListId$
      .pipe(
        first(),
        mergeMap(([uid, listId]) => remove(this.getDatabaseRef(uid, listId, false)))
      )
      .subscribe({
        next: () => {
          const deletedEvent = new Event("deleted");
          this.dispatchEvent(deletedEvent);
        },
      });
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
      imagePath: "",
    };
    let uidCache: string;
    this.uidAndListId$
      .pipe(
        first(),
        mergeMap(([uid, listId]) => {
          uidCache = uid;
          return push(this.getDatabaseRef(uid, listId), newData);
        }),
        tap({
          next: () => {
            if (process.env.NODE_ENV !== "production") return; // do not send notification in Dev mode
            fetch(process.env.NOTIFICATION_URI!).then(() =>
              set(this.#notificationRef, { item: newData.item, uid: uidCache })
            );
          },
        })
      )
      .subscribe({
        next: () => this.form.reset(),
        error: (error) => alert(error),
        complete: () => (this._adding = false),
      });
  };

  #handleDragStart: EventListener = (event) => {
    if (!(event instanceof DragEvent && event.dataTransfer)) return;
    const target = event.currentTarget;
    if (!(target instanceof HTMLLIElement)) return;
    const id = target.id;
    event.dataTransfer.setData("id", id);
    event.dataTransfer.setData("listId", this.listIdSubject.getValue()!);
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
    const newSortedArray = this.sortedData!.map((item) => item.key).filter((key) => key !== draggedId);
    const indexOfDropped = newSortedArray.findIndex((key) => key === droppedLocationId);
    const itemsUpToDropped = newSortedArray.slice(0, indexOfDropped);
    const itemsAfterDropped = newSortedArray.slice(indexOfDropped);
    const changedOrder = [...itemsUpToDropped, draggedId, ...itemsAfterDropped];
    const newData = { ...this.#listData };
    changedOrder.forEach((key, index) => {
      newData[key].order = index;
    });
    this.uidAndListId$
      .pipe(
        first(),
        mergeMap(([uid, listId]) => set(this.getDatabaseRef(uid, listId), newData))
      )
      .subscribe();
  };

  render() {
    const list = this.sortedData?.length
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
            ${item.imagePath ? html`<div id="has-image"><image-icon></image-icon></div>` : ""}
            <span>${item.item}</span>
            ${item.amount && item.amount > 1 ? html`<small>x${item.amount}</small>` : ""}
          </li>`
        )
      : html`<button class="delete" type="button" @click=${this.#handleDeleteList}>Delete List?</button>`;

    return html`
      <div class="card">
        <div @click=${this.#toggleHideListOnClick} id="title">
          <h2>${this.listName}</h2>
          <span>${this.sortedData?.length ?? 0}</span>
        </div>
        <div id="contents">
          <form @submit=${this.#handleAddItem} autocomplete="off">
            <input
              @input=${this.#handleNewItemInput}
              id="item"
              name="item"
              minlength="1"
              type="text"
              maxlength="33"
              required
            />
            <button id="add" type="submit">
              ${this._adding ? html`<loading-spinner color="white" />` : html`<plus-icon color="white" />`}
            </button>
          </form>
          <ul>
            ${this._initLoading ? html`<loading-spinner />` : list}
          </ul>
        </div>
        <shopping-item-details @delete-item=${this.#handleDeleteEvent}></shopping-item-details>
      </div>
    `;
  }
}
