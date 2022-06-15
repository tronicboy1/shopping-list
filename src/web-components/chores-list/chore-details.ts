import { firebaseApp } from "@firebase-logic";
import BaseModal from "@web-components/base-modal";
import sharedCss, { formCss } from "@web-components/shared-css";
import { child, Database, DatabaseReference, get, getDatabase, ref, remove, set } from "firebase/database";
import { css, html, LitElement } from "lit";
import { query, state } from "lit/decorators.js";
import { Chore } from "./";

export default class ChoreDetails extends LitElement {
  #choreKey!: string;
  #ref!: DatabaseReference;
  #db: Database;

  @state()
  private _data: Chore | null = null;
  @state()
  private _deleteLoading = false;
  @state()
  private _editLoading = false;
  @query("base-modal#main-modal")
  private _modal!: BaseModal;
  @query("base-modal#delete-modal")
  private _deleteModal!: BaseModal;

  static styles = [
    sharedCss,
    formCss,
    css`
      div {
        display: flex;
        flex-direction: column;
      }
    `,
  ];

  constructor() {
    super();
    this.#db = getDatabase(firebaseApp);
  }

  static get observedAttributes(): string[] {
    return ["uid", "chore-key"];
  }
  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (_old === value || !value) return;
    if (name === "uid") {
      this.#ref = ref(this.#db, `${value}/CHORES/`);
    }
    if (name === "chore-key") {
      this.#choreKey = value;
    }
    if (!(this.#ref && this.#choreKey)) return;
    get(child(this.#ref, this.#choreKey)).then((snapshot) => {
      snapshot.exists() ? (this._data = snapshot.val()) : (this._data = null);
      const modalContainer = this._modal.shadowRoot!.querySelector("#modal-container")!;
      modalContainer.scrollTo({ top: 0 });
    });
  }

  open() {
    this._modal.toggleAttribute("show", true);
  }

  #handleSubmit: EventListener = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) throw Error("Submit event origin not a Form Element");
    const formData = new FormData(form);
    const title = formData.get("title")!.toString().trim();
    const lastCompleted = new Date(formData.get("lastCompleted")!.toString()).getTime();
    const memo = formData.get("memo")!.toString();
    this._editLoading = true;
    set(child(this.#ref, this.#choreKey), { title, lastCompleted, memo })
      .then(() => {
        this._modal.removeAttribute("show");
      })
      .finally(() => (this._editLoading = false));
  };

  #handleInitialDeleteClick: EventListener = () => this._deleteModal.toggleAttribute("show", true);
  #hideDeleteModal: EventListener = () => this._deleteModal.removeAttribute("show");
  #handleDeleteConfirmClick: EventListener = () => {
    this._deleteLoading = true;
    remove(child(this.#ref, this.#choreKey))
      .then(() => {
        this._deleteModal.removeAttribute("show");
        this._modal.removeAttribute("show");
      })
      .finally(() => (this._deleteLoading = false));
  };

  render() {
    const title = this._data ? this._data.title : "";
    const date = this._data ? new Date(this._data.lastCompleted).toISOString().split("T")[0] : "";
    const loadingSpinner = html`<loading-spinner color="white" />`;
    const todaysDate = new Date().toISOString().split("T")[0];
    const memo = this._data?.memo ?? "";
    return html`
      <base-modal id="main-modal" title="Chore Details">
        <base-modal id="delete-modal" title=${`Delete ${title}?`}>
          <div>
            <button @click=${this.#handleDeleteConfirmClick} type="button" class="delete">
              ${this._deleteLoading ? loadingSpinner : "Yes"}
            </button>
            <button @click=${this.#hideDeleteModal}>Cancel</button>
          </div>
        </base-modal>
        <form @submit=${this.#handleSubmit}>
          <label for="title">Name</label>
          <input type="text" id="title" name="title" maxlength="32" minlength="1" required value=${title} />
          <label for="last-completed">Last Completed</label>
          <input
            type="date"
            id="last-completed"
            name="lastCompleted"
            required
            value=${todaysDate}
            max=${todaysDate}
          />
          <label for="memo">Memo</label>
          <textarea name="memo" id="memo" value=${memo}></textarea>
          <button type="submit">${this._editLoading ? loadingSpinner : "Save"}</button>
          <button @click=${this.#handleInitialDeleteClick} class="delete" type="button">Delete</button>
        </form>
      </base-modal>
    `;
  }
}
