import { firebaseApp, uid$ } from "@firebase-logic";
import { getAuth } from "firebase/auth";
import { Database, DatabaseReference, get, getDatabase, ref, remove, set } from "firebase/database";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { html, LitElement, css, PropertyValueMap } from "lit";
import { state, query } from "lit/decorators.js";
import AllShoppingLists from "./all-shopping-lists";
import BaseModal from "./base-modal";
import sharedCss, { formCss } from "./shared-css";
import { first, mergeMap } from "rxjs";

type Modes = "SHOPPING" | "CHORES";

export default class MainApp extends LitElement {
  #settingsRef!: DatabaseReference;
  #controller: AbortController;
  #db!: Database;
  #uid!: string;
  #observer!: IntersectionObserver;

  @state()
  private _mode: Modes = "SHOPPING";
  @state()
  private _settings: { daysUntilDue: number } = { daysUntilDue: 7 };
  @state()
  private _authLoading = true;
  @state()
  private _listsLoading = false;
  @state()
  private _settingsChangeLoading = false;
  @state()
  private _logoutLoading = false;
  @query("base-modal")
  private _modal!: BaseModal;

  static styles = [
    sharedCss,
    formCss,
    css`
      #settings-content {
        display: flex;
        flex-direction: column;
      }
      div[hide] {
        display: none;
      }
      div[invisible] {
        opacity: 0;
      }
    `,
  ];

  constructor() {
    super();
    this.#controller = new AbortController();
    if (!("serviceWorker" in navigator)) alert("This site requires the Service Worker API");
    uid$.subscribe((uid) => (this.uid = uid));
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.#handleVisibilityChange, { signal: this.#controller.signal });
    this.#observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          const tagName = target.tagName.toLowerCase();
          if (customElements.get(tagName)) return;
          import(`@web-components/${tagName}`).then((imports) => {
            customElements.define(tagName, imports.default); // import web components when brought into view
          });
        });
      },
      { root: document, rootMargin: "0px", threshold: 1.0 }
    );
    uid$
      .pipe(
        first(),
        mergeMap((uid) => {
          this.uid = uid;
          if (this.uid) this._listsLoading = true;
          return this.updateComplete;
        })
      )
      .subscribe({
        complete: () => {
          this._authLoading = false;
        },
        error: (error) => alert(JSON.stringify(error)),
      });
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    const allShoppingLists = this.shadowRoot!.querySelector("all-shopping-lists")!;
    const choresList = this.shadowRoot!.querySelector("chores-list")!;
    const authHandler = this.shadowRoot!.querySelector("auth-handler")!;
    this.#observer.observe(allShoppingLists);
    this.#observer.observe(choresList);
    this.#observer.observe(authHandler);
  }

  disconnectedCallback(): void {
    this.#controller.abort();
  }

  get uid(): string {
    return this.#uid;
  }
  set uid(value: string) {
    if (this._logoutLoading) this._logoutLoading = false;
    const oldValue = this.uid;
    if (oldValue === value) return;
    this.#uid = String(value);
    this.requestUpdate("uid", oldValue);
    if (this.uid) {
      this.#db = getDatabase(firebaseApp);
      const messaging = getMessaging(firebaseApp);
      isSupported().then((isSupported) => {
        if (!isSupported) throw Error("Browser does not support firebase Notifications.");
        getToken(messaging).then((newFCM) => {
          const fcmListRef = ref(this.#db, `FCM/${this.uid}/`);
          return get(fcmListRef)
            .then((currentData) => {
              const oldFCMList = (currentData.val() as string[]) ?? [];
              if (oldFCMList.find((fcm) => fcm === newFCM)) return; // should also add check for old FCMs to be removed
              set(fcmListRef, [...oldFCMList, newFCM]); // save device's fcm in database for use with notifications
            })
            .catch((error) => alert(JSON.stringify(error)));
        });
      });
      this.#settingsRef = ref(this.#db, `${this.uid}/SETTINGS/CHORES`);
      get(this.#settingsRef).then((data) => {
        if (!data.exists()) return;
        const value = data.val();
        this._settings = { daysUntilDue: value.daysUntilDue ?? 7 };
      });
    }
  }

  #handleVisibilityChange: EventListener = () => {
    const visibilityState = document.visibilityState;
    if (visibilityState === "visible") getAuth(firebaseApp);
  };

  #handleModeChange = (event: CustomEvent<Modes>) => {
    this._mode = event.detail;
  };

  #handleSettingsClick: EventListener = (event) => {
    this._modal.toggleAttribute("show", true);
  };

  #handleLogoutClick: EventListener = () => {
    getAuth(firebaseApp)
      .signOut()
      .then(() => {
        this._mode = "SHOPPING";
        this._logoutLoading = true;
      })
      .finally(() => this._modal.removeAttribute("show"));
  };

  #handleListsLoaded: EventListener = () => {
    this._listsLoading = false;
  };
  #handleLoggedInEvent: EventListener = () => {
    this._listsLoading = true;
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

  #clearAllListData = () =>
    remove(ref(this.#db, `${this.#uid}/SHOPPING-LISTS/`)).then(() => {
      this.shadowRoot!.querySelector<AllShoppingLists>("all-shopping-lists")!.requestUpdate();
    });

  render() {
    return html`
      ${this._authLoading
        ? html`<loading-spinner style="position: fixed; top: 30%; left: 0; right: 0;"></loading-spinner>`
        : ""}
      <div ?hide=${this.uid || this._authLoading || this._listsLoading}>
        <auth-handler @logged-in=${this.#handleLoggedInEvent} show></auth-handler>
      </div>
      <div ?hide=${this._authLoading}>
        <div ?hide=${this._mode !== "SHOPPING"} ?invisible=${this._listsLoading}>
          <all-shopping-lists @shopping-lists-loaded=${this.#handleListsLoaded}></all-shopping-lists>
        </div>
        <div ?hide=${this._mode !== "CHORES"}>
          <chores-list days-until-due=${this._settings.daysUntilDue}></chores-list>
        </div>
        <button-bar @settings-click=${this.#handleSettingsClick} @mode-change=${this.#handleModeChange}></button-bar>
      </div>
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
            <button class="delete" type="button" @click=${this.#clearAllListData}>Clear All List Data</button>
            <button type="button" @click=${this.#handleLogoutClick}>Logout</button>
          </form>
        </div></base-modal
      >
    `;
  }
}
