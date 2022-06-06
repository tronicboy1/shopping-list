import { onAuthStateChanged } from "firebase/auth";
import { html, LitElement, css } from "lit";
import { state, query } from "lit/decorators.js";
import BaseModal from "./base-modal";
import { auth } from "./firebase";
import sharedCss from "./shared-css";

type Modes = "SHOPPING" | "CHORES";

export default class MainApp extends LitElement {
  @state()
  private _mode: Modes = "SHOPPING";
  @state()
  private _uid: string | null = null;
  @state()
  private _loading = true;
  @query("base-modal")
  private _modal!: BaseModal;

  connectedCallback() {
    super.connectedCallback();
    onAuthStateChanged(auth, (auth) => {
      this._uid = auth ? auth.uid : null;
      this._loading = false;
    });
  }

  #handleModeChange = (event: CustomEvent<Modes>) => {
    this._mode = event.detail;
  };
  #handleSettingsClick: EventListener = (event) => {
    this._modal.toggleAttribute("show", true);
  };
  #handleLogoutClick: EventListener = () => {
    auth.signOut();
  };

  #renderAuth() {
    return html`<auth-handler show></auth-handler>`;
  }

  static styles = [
    sharedCss,
    css`
      #settings-content {
        display: flex;
        flex-direction: column;
      }
    `,
  ];

  render() {
    if (this._loading)
      return html`<loading-spinner style="position: fixed; top: 30%; left: 0; right: 0;"></loading-spinner>`;
    if (!this._uid) return this.#renderAuth();

    return html`
      <shopping-list ?show=${this._mode === "SHOPPING"}></shopping-list>
      <chores-list ?show=${this._mode === "CHORES"}></chores-list>
      <button-bar @settings-click=${this.#handleSettingsClick} @mode-change=${this.#handleModeChange}></button-bar>
      <base-modal title="Settings"
        ><div id="settings-content">
          <button type="button" @click=${this.#handleLogoutClick}>Logout</button>
        </div></base-modal
      >
    `;
  }
}
