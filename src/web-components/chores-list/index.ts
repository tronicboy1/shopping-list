import { auth, firebaseApp } from "@web-components/firebase";
import sharedCss from "@web-components/shared-css";
import { onAuthStateChanged } from "firebase/auth";
import { DatabaseReference, getDatabase, onValue, ref } from "firebase/database";
import { html, LitElement } from "lit";
import { state } from "lit/decorators.js";
import css from "./css";
interface Chore {
  key: string;
  lastCompleted: Date;
  title: string;
}

export default class ChoresList extends LitElement {
  #ref!: DatabaseReference;
  @state()
  private _choresData: Chore[] = [];

  static styles = [sharedCss, css];

  connectedCallback(): void {
    super.connectedCallback();
    onAuthStateChanged(auth, (auth) => {
      if (!auth) return;
      const db = getDatabase(firebaseApp);
      this.#ref = ref(db, `${auth.uid}/CHORES/`);
      onValue(this.#ref, (snapshot) => {
        const value = snapshot.val() as { [id: string]: { lastCompleted: string; title: string } };
        const keys = Object.keys(value);
        this._choresData = keys.map<Chore>((key) => ({
          key,
          title: value[key].title,
          lastCompleted: new Date(value[key].lastCompleted),
        }));
      });
    });
  }

  render() {
    return html`
      <div style="margin-bottom: 15vh;" class="card">
        <ul>
          ${this._choresData.length
            ? this._choresData.map(
                (chore) =>
                  html`<li id=${chore.key}>
                    <strong>${chore.title}</strong><small>${chore.lastCompleted.toLocaleDateString()}</small>
                  </li>`
              )
            : html`<p>No Items.</p>`}
        </ul>
      </div>
    `;
  }
}
