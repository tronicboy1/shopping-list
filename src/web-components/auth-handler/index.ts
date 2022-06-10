import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { html, LitElement } from "lit";
import { state, query } from "lit/decorators.js";
import sharedCss from "@web-components/shared-css";
import css from "./css";
import { FirebaseError } from "firebase/app";
import { auth } from "@firebase-logic";

interface FormData {
  email: string;
  password: string;
  "password-confirm"?: string;
}

export default class AuthHandler extends LitElement {
  @state()
  private _mode: "LOGIN" | "REGISTER" = "LOGIN";
  @state()
  private _error: string | null = null;
  @state()
  private _loading = false;
  @query("form")
  private _form!: HTMLFormElement;
  @query("button#submit")
  private _submitButton!: HTMLButtonElement;

  static styles = [sharedCss, css];

  #handleSubmit: EventListener = (event) => {
    event.preventDefault();
    this._error = null;
    const formData = new FormData(this._form);
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
          this._form.reset();
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
          this._form.reset();
        })
        .catch((error) => {
          console.log();
          if (error instanceof FirebaseError) this._error = error.message;
        })
        .finally(() => (this._loading = false));
    }
  };

  #handleLoginClick: EventListener = () => {
    this._mode = "LOGIN";
  };
  #handleRegisterClick: EventListener = () => {
    this._mode = "REGISTER";
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
      <div class="card">
        <h1>Shopping List</h1>
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
      </div>
    `;
  }
}
