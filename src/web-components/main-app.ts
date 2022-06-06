import { onAuthStateChanged } from "firebase/auth";
import { html, LitElement } from "lit";
import { state } from "lit/decorators.js";
import { auth } from "./firebase";

export default class MainApp extends LitElement {
  @state()
  private _mode: "SHOPPING" | "CHORES" = "SHOPPING";
  @state()
  private _uid: string | null = null;
  @state()
  private _loading = true;

  connectedCallback() {
    super.connectedCallback();
    onAuthStateChanged(auth, (auth) => {
      this._uid = auth ? auth.uid : null;
      this._loading = false;
    });
  }

  #renderShoppingList() {
    return html`<shopping-list show></shopping-list>`;
  }

  #renderAuth() {
    return html`<auth-handler show></auth-handler>`;
  }

  render() {
    if (this._loading)
      return html`<loading-spinner style="position: fixed; top: 30%; left: 0; right: 0;"></loading-spinner>`;
    if (!this._uid) return this.#renderAuth();

    return html` ${this._mode === "SHOPPING" ? this.#renderShoppingList() : html`<div></div>`} `;
  }
}
