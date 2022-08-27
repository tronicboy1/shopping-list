import { firebaseApp, getAuthStateOnce } from "@firebase-logic";
import sharedCss, { formCss } from "@web-components/shared-css";
import { Unsubscribe } from "firebase/auth";
//prettier-ignore
import { DatabaseReference, getDatabase, onValue, orderByChild, push, query as firebaseQuery, ref } from "firebase/database";
import { html, LitElement } from "lit";
import { property, query, state } from "lit/decorators.js";
import ChoreDetails from "./chore-details";
import css from "./css";
export interface Chore {
  lastCompleted: string;
  title: string;
  memo: string;
}

export default class ChoresList extends LitElement {
  #uid: string;
  #ref!: DatabaseReference;
  #unsubscribe: Unsubscribe;
  #controller: AbortController;
  @state()
  private _choresData: { [id: string]: Chore } | null = null;
  @property({ attribute: "days-until-due", type: Number })
  private _daysUntilDue: number = 7;
  @query("chore-details")
  private _choreDetails!: ChoreDetails;

  static styles = [sharedCss, css, formCss];

  constructor() {
    super();
    this.#uid = "";
    this.#unsubscribe = () => {};
    this.#controller = new AbortController();
    if (!customElements.get("chore-details")) {
      import("./chore-details").then((imports) => customElements.define("chore-details", imports.default));
    }
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

  disconnectedCallback(): void {
    this.#unsubscribe();
    this.#controller.abort();
  }

  get uid(): string {
    return this.#uid;
  }
  set uid(value: string) {
    if (value === this.#uid) return;
    this.#uid = value;
    this.#unsubscribe();
    if (this.#uid) {
      this._choreDetails.setAttribute("uid", this.#uid);
      const db = getDatabase(firebaseApp);
      this.#ref = ref(db, `${this.#uid}/CHORES/`);
      const query = firebaseQuery(this.#ref, orderByChild("lastCompleted"));
      this.#unsubscribe = onValue(query, (snapshot) => {
        const value = snapshot.val();
        this._choresData = value;
      });
    }
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
          const lastCompleted = new Date(choreItem.lastCompleted);
          const due = new Date().getTime() - lastCompleted.getTime() > this._daysUntilDue * 24 * 60 * 60 * 1000;
          return html`<li @click=${this.#openChore} id=${key}>
            <strong>${choreItem.title}</strong><small ?due=${due}>${lastCompleted.toLocaleDateString()}</small>
          </li>`;
        })
      : html`<p>No Items.</p>`;
    const todaysDate = new Date().toISOString().split("T")[0];

    return html`
      <div class="card">
        <form @submit=${this.#handleFormSubmit}>
          <label for="title">Name</label>
          <input type="text" id="title" name="title" maxlength="32" minlength="1" required />
          <label for="last-completed">Last Completed</label>
          <input type="date" id="last-completed" name="lastCompleted" required value=${todaysDate} max=${todaysDate} />
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
