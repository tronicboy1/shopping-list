import { auth, firebaseApp } from "@firebase-logic";
import { onAuthStateChanged } from "firebase/auth";
import { DatabaseReference, get, getDatabase, ref, set } from "firebase/database";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { html, LitElement, css } from "lit";
import { state, query } from "lit/decorators.js";
import BaseModal from "./base-modal";
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
        const messaging = getMessaging(firebaseApp);
        isSupported().then((isSupported) => {
          if (!isSupported) throw Error("Browser does not support firebase Notifications.");
          getToken(messaging).then((newFCM) => {
            const fcmListRef = ref(db, `FCM/${auth.uid}/`);
            get(fcmListRef).then((currentData) => {
              const oldFCMList = (currentData.val() as string[]) ?? [];
              if (oldFCMList.find((fcm) => fcm === newFCM)) return;
              set(fcmListRef, [...oldFCMList, newFCM]);
            });
          });
        });
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
  #handleNotificationEnableClick: EventListener = () => {
    Notification.requestPermission()
      .then(() => {
        if (!("serviceWorker" in navigator)) throw Error("Service Worker API must be supported for Notifications.");
        const options: NotificationOptions = {
          body: "You can now receive Notifications from Listo.",
          icon: "/apple-touch-icon.png",
          image: "/apple-touch-icon.png",
          lang: "en-US",
          vibrate: [100, 50, 200],
          badge: "/apple-touch-icon.png",
          tag: "enable-notifications",
        };
        navigator.serviceWorker.ready
          .then((swReg) => {
            if (!("showNotification" in swReg))
              throw Error("Your browser does not support Service Worker Notifications.");
            swReg.showNotification("Notifications Successfully Enabled!", options);
          })
          .catch((error) => alert(error));
      })
      .catch(() => alert("Notifications were not Enabled."))
      .finally(() => this._modal.removeAttribute("show"));
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
      <all-shopping-lists ?show=${this._mode === "SHOPPING"}></all-shopping-lists>
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
            ${"Notification" in window
              ? html`<button @click=${this.#handleNotificationEnableClick} type="button">Enable Notifications</button>`
              : ""}
            <button type="button" @click=${this.#handleLogoutClick}>Logout</button>
          </form>
        </div></base-modal
      >
    `;
  }
}
