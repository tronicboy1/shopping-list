import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
} from "firebase/auth";
import { html, LitElement } from "lit";
import { state, query } from "lit/decorators.js";
import sharedCss from "@web-components/shared-css";
import css from "./css";
import { FirebaseError } from "firebase/app";
import { auth } from "@firebase-logic";
import BaseModal from "@web-components/base-modal";

interface FormData {
  email: string;
  password: string;
  "password-confirm"?: string;
}

export default class AuthHandler extends LitElement {
  @state()
  private _mode: "LOGIN" | "REGISTER" = "LOGIN";
  @state()
  private _error = "";
  @state()
  private _loading = false;
  @query("base-modal#email-login-modal")
  private _emailLoginModal!: BaseModal;
  @query("base-modal#reset-password")
  private _resetPasswordModal!: BaseModal;

  static styles = [sharedCss, css];

  connectedCallback() {
    super.connectedCallback();
    if (isSignInWithEmailLink(auth, window.location.href)) {
      this._loading = true;
      const email = localStorage.getItem("email");
      if (!email) throw Error("Email was not in local storage.");
      signInWithEmailLink(auth, email, window.location.href)
        .then(() => this.#dispatchLoggedInEvent())
        .catch((error) => alert("Invalid login link."))
        .finally(() => (this._loading = false));
    }
  }

  #handleSubmit: EventListener = (event) => {
    event.preventDefault();
    this._error = "";
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) throw TypeError("Invalid form element.");
    const formData = new FormData(form);
    const formDataObj = Object.fromEntries(formData) as unknown;
    const data = formDataObj as FormData;
    const isRegister = Boolean(data["password-confirm"]);
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/g.test(data.email)) {
      this._error = "Must provide valid Email.";
      return;
    }
    if (isRegister) {
      const passwordsMatch = data.password === data["password-confirm"];
      if (!passwordsMatch) {
        this._error = "Passwords do not Match.";
        return;
      }
      this._loading = true;
      createUserWithEmailAndPassword(auth, data.email, data.password)
        .then((credentials) => {
          this.removeAttribute("show");
          form.reset();
          this.#dispatchLoggedInEvent();
        })
        .catch((error) => {
          if (!(error instanceof Error)) return;
          this._error = error.message;
        })
        .finally(() => (this._loading = false));
    } else {
      this._loading = true;
      signInWithEmailAndPassword(auth, data.email, data.password)
        .then(() => {
          this.removeAttribute("show");
          form.reset();
          this.#dispatchLoggedInEvent();
        })
        .catch((error) => {
          if (error instanceof FirebaseError) this._error = error.message;
        })
        .finally(() => (this._loading = false));
    }
  };

  #dispatchLoggedInEvent() {
    const loggedInEvent = new Event("logged-in", { bubbles: true });
    this.dispatchEvent(loggedInEvent);
  }

  #handleLoginClick: EventListener = () => {
    this._mode = "LOGIN";
    this._error = "";
  };
  #handleRegisterClick: EventListener = () => {
    this._mode = "REGISTER";
    this._error = "";
  };

  #handleEmailAddressSignInClick: EventListener = (event) => {
    event.preventDefault();
    this._emailLoginModal.toggleAttribute("show", true);
  };
  #handleEmailAddressSignInSubmit: EventListener = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) throw TypeError("Must be form element.");
    const formData = new FormData(form);
    const email = String(formData.get("email"));
    if (!email) return;
    localStorage.setItem("email", email);
    this._loading = true;
    sendSignInLinkToEmail(auth, email, { url: process.env.FRONTEND_URI!, handleCodeInApp: true })
      .then(() => {
        this._emailLoginModal.removeAttribute("show");
        alert("Please check your inbox for the login Email.");
      })
      .catch((error) => alert(JSON.stringify(error)))
      .finally(() => (this._loading = false));
  };

  #handleGoogleSignInClick: EventListener = () => {
    const googleProvider = new GoogleAuthProvider();
    signInWithPopup(auth, googleProvider).then(() => this.#dispatchLoggedInEvent());
  };

  #handleForgotPasswordClick: EventListener = () => {
    this._resetPasswordModal.toggleAttribute("show", true);
  };
  #handleResetPasswordSubmit: EventListener = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) throw TypeError("Must be form element.");
    const formData = new FormData(form);
    const email = String(formData.get("email"));
    if (!email) return;
    localStorage.setItem("email", email);
    sendPasswordResetEmail(auth, email, { url: process.env.FRONTEND_URI!, handleCodeInApp: true });
  };

  render() {
    const loginTemplate = html`
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required autocomplete="current-password" />
        <a @click=${this.#handleForgotPasswordClick}>Forgot password?</a>
      </div>
    `;
    const registerTemplate = html`
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required autocomplete="new-password" />
      </div>
      <div class="form-group">
        <label for="password-confirm">Confirm Password</label>
        <input id="password-confirm" name="password-confirm" type="password" required autocomplete="new-password" />
      </div>
    `;

    return html`
      <base-modal id="email-login-modal" title="Send Login Email">
        <form @submit=${this.#handleEmailAddressSignInSubmit}>
          <div class="form-group">
            <label for="email-login-email">Email</label>
            <input id="email-login-email" name="email" type="email" required autocomplete="email" />
          </div>
          <button id="submit" type="submit">
            ${this._loading ? html`<loading-spinner color="white" />` : "Send Login Email"}
          </button>
        </form>
      </base-modal>

      <base-modal id="reset-password" title="Reset Password">
        <form @submit=${this.#handleResetPasswordSubmit}>
          <div class="form-group">
            <label for="reset-password-email">Email</label>
            <input id="reset-password-email" name="email" type="email" required autocomplete="email" />
          </div>
          <button id="submit" type="submit">
            ${this._loading ? html`<loading-spinner color="white" />` : "Send Password Reset Email"}
          </button>
        </form>
      </base-modal>

      <div class="card">
        <h1>Listo</h1>
        <h3>An elegant List Manager</h3>
        <div class="button-group">
          <button
            @click=${this.#handleLoginClick}
            ?active=${this._mode === "LOGIN"}
            class="button-left"
            id="login-button"
            type="button"
          >
            Login
          </button>
          <button
            @click=${this.#handleRegisterClick}
            ?active=${this._mode === "REGISTER"}
            class="button-right"
            id="register-button"
            type="button"
          >
            Register
          </button>
        </div>
        ${this._error ? html`<p id="errors">${this._error}</p>` : ""}
        <form @submit=${this.#handleSubmit} class="login-form">
          ${this._mode === "LOGIN" ? loginTemplate : registerTemplate}
          <button id="submit" type="submit">
            ${this._loading ? html`<loading-spinner color="white" />` : "Submit"}
          </button>
        </form>
        <div id="third-party">
          <google-icon @click=${this.#handleGoogleSignInClick}></google-icon>
        </div>
        <a @click=${this.#handleEmailAddressSignInClick}>Or Sign in with only your Email Address?</a>
      </div>
    `;
  }
}
