import { html, LitElement } from "lit";
import { query, state } from "lit/decorators.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseApp } from "@firebase-logic";
import { DatabaseReference, getDatabase, onValue, ref } from "firebase/database";

export default class AllShoppingLists extends LitElement {
  #ref!: DatabaseReference;
  @state()
  private _listGroups: string[] | null = null;
  @state()
  private _uid: string | null = null;
  @state()
  private _adding = false;

  @query("form")
  form!: HTMLFormElement;

  connectedCallback(): void {
    onAuthStateChanged(auth, (auth) => {
      if (auth) {
        this._uid = auth.uid;
        const db = getDatabase(firebaseApp);
        this.#ref = ref(db, `${auth.uid}/SHOPPING-LISTS/`);
        onValue(this.#ref, (snapshot) => {
          const data = snapshot.val() as string[] | null;
          if (!data) {
            this._listGroups = null;
            return;
          }
          this._listGroups = data;
        });
      }
    });
  }

  #handleAddItem: EventListener = (event) => {
    event.preventDefault();
    if (this._adding) return;
    const formData = new FormData(this.form);
    const item = String(formData.get("item")!).trim();
    if (item.length > 32) return;
    const dateAdded = new Date().getTime();
    this._adding = true;
  };

  #handleClearAll: EventListener = () => {};

  render() {
    return html`
      <div class="card">
        <form @submit=${this.#handleAddItem} autocomplete="off">
          <input id="item" name="item" minlength="1" type="text" maxlength="33" required />
          <button id="add" type="submit">${this._adding ? html`<loading-spinner color="white" />` : "Add"}</button>
        </form>
      </div>
      <div class="card">
        <button id="clear" @click=${this.#handleClearAll} type="button">Clear All</button>
      </div>
    `;
  }
}
