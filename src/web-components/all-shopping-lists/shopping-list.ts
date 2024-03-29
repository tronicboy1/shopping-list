import { ref, set, DatabaseReference } from "firebase/database";
import { html, LitElement, PropertyValueMap } from "lit";
import { state, query, property, customElement } from "lit/decorators.js";
import styles, { listCss, stickyTitles } from "./css";
import sharedStyles from "../shared-css";
import ShoppingItemDetails from "./shopping-item-details";
import { Firebase } from "@firebase-logic";
import { ShoppingListData, ShoppingListItem } from "./types";
import {
  BehaviorSubject,
  buffer,
  combineLatest,
  debounceTime,
  filter,
  first,
  interval,
  map,
  mergeMap,
  OperatorFunction,
  ReplaySubject,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { ListService } from "../../app/list.service";

@customElement("shopping-list")
export default class ShoppingList extends LitElement {
  #notificationRef!: DatabaseReference;
  private listIdSubject = new BehaviorSubject<string | null>(null);
  private listId$ = this.listIdSubject.pipe(filter((id) => Boolean(id)) as OperatorFunction<string | null, string>);
  private subscriptions = new Subscription();
  private uidAndListId$ = combineLatest([Firebase.uid$, this.listId$]);
  private tileClick$ = new Subject<string>();
  private tileDoubleClicks$ = this.tileClick$.pipe(
    buffer(this.tileClick$.pipe(debounceTime(250))),
    filter((clicks) => clicks.length > 1),
    map(([id]) => id)
  );
  private tileTouchStart$ = new ReplaySubject<string>();
  private tileTouchEnd$ = new Subject<string>();
  private tileTouchLong$ = this.tileTouchStart$.pipe(
    switchMap(() => interval(100).pipe(takeUntil(this.tileTouchEnd$), buffer(this.tileTouchEnd$)))
  );
  private touchHold$ = this.tileTouchLong$.pipe(
    filter((interval) => interval.length >= 5 && interval.length <= 10),
    switchMap(() => this.tileTouchStart$.pipe(first()))
  );

  @property({ reflect: true, attribute: "hide-list", type: Boolean })
  hideList = false;
  @property({ type: String, attribute: "list-name" })
  listName = "";
  @property({ attribute: "list-id", type: String })
  get listId() {
    return this.listIdSubject.getValue();
  }
  set listId(id: string | null) {
    this.listIdSubject.next(id);
  }
  private _listData?: ShoppingListData;
  @property({ type: Object, converter: (val) => JSON.parse(val ?? "{}"), attribute: "list-data" })
  get listData(): ShoppingListData | undefined {
    return this._listData;
  }
  set listData(data: ShoppingListData | undefined) {
    this._listData = data;
    if (!data) return;
    this.sortedData = Object.entries(data)
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => (a.order < b.order ? -1 : 1));
  }
  @state()
  sortedData: (ShoppingListItem & { key: string })[] | null = null;
  @state()
  private _adding = false;
  @query("form")
  form!: HTMLFormElement;
  @query("shopping-item-details")
  private _shoppingItemDetails!: ShoppingItemDetails;

  static styles = [styles, sharedStyles, listCss, stickyTitles];

  connectedCallback() {
    super.connectedCallback();
    this.subscriptions.add(this.tileDoubleClicks$.subscribe(this.#deleteItem));
    this.subscriptions.add(this.touchHold$.subscribe(this.openShoppingItemDetails));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.subscriptions.unsubscribe();
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.uidAndListId$.subscribe(([uid, listId]) => {
      this._shoppingItemDetails.setAttribute("uid", uid);
      this._shoppingItemDetails.setAttribute("list-id", listId);
    });
  }

  #toggleHideListOnClick: EventListener = () => {
    this.hideList = !this.hideList;
  };

  #deleteItem = (id: string) => {
    this.uidAndListId$
      .pipe(
        first(),
        mergeMap(([uid, listId]) => ListService.deleteItem(uid, listId, id))
      )
      .subscribe();
  };

  #handleDeleteEvent = (event: CustomEvent<string>) => this.#deleteItem(event.detail);

  #handleDeleteList = () => {
    this.uidAndListId$
      .pipe(
        first(),
        mergeMap(([uid, listId]) => ListService.deleteList(uid, listId))
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
      order: this.listData ? Object.keys(this.listData).length + 1 : 0,
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
          return ListService.addItem(uid, listId, newData);
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

  private openShoppingItemDetails = (id: string) => {
    this._shoppingItemDetails.setAttribute("key", id);
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
      this.openShoppingItemDetails(draggedId);
      return;
    }
    if (!this.listData) return;
    const droppedLocationData = this.listData[droppedLocationId];
    const draggedData = this.listData[draggedId];
    if (!(draggedData && droppedLocationData)) return;
    const newSortedArray = this.sortedData!.map((item) => item.key).filter((key) => key !== draggedId);
    const indexOfDropped = newSortedArray.findIndex((key) => key === droppedLocationId);
    const itemsUpToDropped = newSortedArray.slice(0, indexOfDropped);
    const itemsAfterDropped = newSortedArray.slice(indexOfDropped);
    const changedOrder = [...itemsUpToDropped, draggedId, ...itemsAfterDropped];
    const newData = { ...this.listData };
    changedOrder.forEach((key, index) => {
      newData[key].order = index;
    });
    this.uidAndListId$
      .pipe(
        first(),
        mergeMap(([uid, listId]) => ListService.updateList(uid, listId, newData))
      )
      .subscribe();
  };

  render() {
    const list = this.sortedData?.length
      ? this.sortedData.map(
          (item) => html`<li
            id=${item.key}
            draggable="true"
            ?priority=${item.priority}
            @click=${() => this.tileClick$.next(item.key)}
            @dragstart=${this.#handleDragStart}
            @dragover=${this.#handleDragOver}
            @drop=${this.#handleDrop}
            @touchstart=${() => {
              console.log("touch event");
              this.tileTouchStart$.next(item.key);
            }}
            @touchend=${() => this.tileTouchEnd$.next(item.key)}
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
            <input id="item" name="item" minlength="1" type="text" maxlength="33" required />
            <button id="add" type="submit">
              ${this._adding ? html`<loading-spinner color="white" />` : html`<plus-icon color="white" />`}
            </button>
          </form>
          <ul>
            ${list}
          </ul>
        </div>
        <shopping-item-details @delete-item=${this.#handleDeleteEvent}></shopping-item-details>
      </div>
    `;
  }
}
