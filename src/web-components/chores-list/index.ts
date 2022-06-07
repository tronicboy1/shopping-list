import { auth, firebaseApp } from "@web-components/firebase";
import sharedCss from "@web-components/shared-css";
import { onAuthStateChanged } from "firebase/auth";
import { DatabaseReference, getDatabase, onValue, push, ref } from "firebase/database";
import { html, LitElement } from "lit";
import { query, state } from "lit/decorators.js";
import ChoreDetails from "./chore-details";
import css, { formCss } from "./css";
export interface Chore {
  lastCompleted: string;
  title: string;
  memo: string;
}

customElements.define("chore-details", ChoreDetails);

export default class ChoresList extends LitElement {
  #ref!: DatabaseReference;
  @state()
  private _choresData: { [id: string]: Chore } | null = null;
  @query("chore-details")
  private _choreDetails!: ChoreDetails;

  static styles = [sharedCss, css, formCss];

  connectedCallback(): void {
    super.connectedCallback();
    onAuthStateChanged(auth, (auth) => {
      if (!auth) return;
      this._choreDetails.setAttribute("uid", auth.uid);
      const db = getDatabase(firebaseApp);
      this.#ref = ref(db, `${auth.uid}/CHORES/`);
      onValue(this.#ref, (snapshot) => {
        const value = snapshot.val();
        this._choresData = value;
      });
    });
  }

  #handleFormSubmit: EventListener = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) throw Error("Submit event origin not a Form Element");
    const formData = new FormData(form);
    const title = formData.get("title")!.toString().trim();
    const lastCompleted = new Date(formData.get("lastCompleted")!.toString());
    push(this.#ref, { title, lastCompleted: lastCompleted.getTime(), memo: "" }).then(() => form.reset());
  };

  #openChore: EventListener = (event) => {
    const li = event.currentTarget;
    if (!(li instanceof HTMLLIElement)) return;
    const key = li.id;
    this._choreDetails.setAttribute("chore-key", key);
    this._choreDetails.open();
  };

  render() {
    const choresList = this._choresData
      ? Object.keys(this._choresData).map((key) => {
          const choreItem = this._choresData![key];
          return html`<li @click=${this.#openChore} id=${key}>
            <strong>${choreItem.title}</strong><small>${new Date(choreItem.lastCompleted).toLocaleDateString()}</small>
          </li>`;
        })
      : html`<p>No Items.</p>`;

    return html`
      <div class="card">
        <form @submit=${this.#handleFormSubmit}>
          <label>Name</label>
          <input type="text" id="title" name="title" maxlength="32" minlength="1" required />
          <label>Last Completed</label>
          <input type="date" name="lastCompleted" required />
          <button type="submit">Add</button>
        </form>
      </div>
      <div style="margin-bottom: 15vh;" class="card">
        <ul>
          ${choresList}
        </ul>
      </div>
      <chore-details></chore-details>
    `;
  }
}
