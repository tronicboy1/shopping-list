import { onAuthStateChanged } from "firebase/auth";
import { DatabaseReference, get, getDatabase, ref, set } from "firebase/database";
import { html, LitElement, css } from "lit";
import { state, query } from "lit/decorators.js";
import BaseModal from "./base-modal";
import { auth, firebaseApp } from "./firebase";
import sharedCss, { formCss } from "./shared-css";

type Modes = "SHOPPING" | "CHORES";

export default class MainApp extends LitElement {
  #settingsRef!: DatabaseReference;

  @state()
  private _mode: Modes = "SHOPPING";
  @state()
  private _uid: string | null = null;
  @state()
  private _settings: { daysUntilDue: number } = { daysUntilDue: 7 };
  @state()
  private _loading = true;
  @state()
  private _settingsChangeLoading = false;
  @query("base-modal")
  private _modal!: BaseModal;

  connectedCallback() {
    super.connectedCallback();
    onAuthStateChanged(auth, (auth) => {
      if (auth) {
        const db = getDatabase(firebaseApp);
        this.#settingsRef = ref(db, `${auth.uid}/SETTINGS/CHORES`);
        get(this.#settingsRef).then((data) => {
          if (!data.exists()) return;
          const value = data.val();
          this._settings = { daysUntilDue: value.daysUntilDue ?? 7 };
        });
      }
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
    formCss,
    css`
      #settings-content {
        display: flex;
        flex-direction: column;
      }
    `,
  ];

  #handleSettingsSubmit: EventListener = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) throw Error("Submit event origin not a Form Element");
    const formData = new FormData(form);
    const daysUntilDue = Number(formData.get("daysUntilDue"));
    if (isNaN(daysUntilDue)) throw TypeError("Days until Due must be a number.");
    this._settingsChangeLoading = true;
    const newSettings = { daysUntilDue };
    set(this.#settingsRef, newSettings)
      .then(() => {
        this._settings = newSettings;
        this._modal.removeAttribute("show");
      })
      .finally(() => (this._settingsChangeLoading = false));
  };

  render() {
    if (this._loading)
      return html`<loading-spinner style="position: fixed; top: 30%; left: 0; right: 0;"></loading-spinner>`;
    if (!this._uid) return this.#renderAuth();

    return html`
      <shopping-list ?show=${this._mode === "SHOPPING"}></shopping-list>
      <chores-list days-until-due=${this._settings.daysUntilDue} ?show=${this._mode === "CHORES"}></chores-list>
      <button-bar @settings-click=${this.#handleSettingsClick} @mode-change=${this.#handleModeChange}></button-bar>
      <base-modal title="Settings"
        ><div id="settings-content">
          <form @submit=${this.#handleSettingsSubmit}>
            <label for="days-until-due">Days Until Chore is Due</label>
            <input
              min="1"
              max="31"
              type="number"
              id="days-until-due"
              name="daysUntilDue"
              .value=${String(this._settings.daysUntilDue)}
            />
            <button type="submit">
              ${this._settingsChangeLoading ? html`<loading-spinner color="white" />` : "Change Settings"}
            </button>
            <button type="button" @click=${this.#handleLogoutClick}>Logout</button>
          </form>
        </div></base-modal
      >
    `;
  }
}
