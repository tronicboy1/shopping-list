import { auth, firebaseApp } from "@web-components/firebase";
import sharedCss from "@web-components/shared-css";
import { onAuthStateChanged } from "firebase/auth";
import { DatabaseReference, getDatabase, onValue, push, ref } from "firebase/database";
import { html, LitElement } from "lit";
import { query, state } from "lit/decorators.js";
import css from "./css";
interface Chore {
  lastCompleted: string;
  title: string;
}

export default class ChoresList extends LitElement {
  #ref!: DatabaseReference;
  @state()
  private _choresData: { [id: string]: Chore } | null = null;
  @query("form")
  private _form!: HTMLFormElement;

  static styles = [sharedCss, css];

  connectedCallback(): void {
    super.connectedCallback();
    onAuthStateChanged(auth, (auth) => {
      if (!auth) return;
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
    const formData = new FormData(this._form);
    const title = formData.get("title")!.toString().trim();
    const lastCompleted = new Date(formData.get("lastCompleted")!.toString());
    push(this.#ref, { title, lastCompleted: lastCompleted.getTime() });
  };

  render() {
    const choresList = this._choresData
      ? Object.keys(this._choresData).map((key) => {
          const choreItem = this._choresData![key];
          return html`<li id=${key}>
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
    `;
  }
}
