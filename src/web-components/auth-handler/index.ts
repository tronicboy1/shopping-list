import template from "./template.html";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

interface FormData {
  email: string;
  password: string;
  "password-confirm"?: string;
}

export default class AuthHandler extends HTMLElement {
  #loginTemplate: HTMLTemplateElement;
  #registerTemplate: HTMLTemplateElement;
  #loginButton: HTMLButtonElement;
  #registerButton: HTMLButtonElement;
  #form: HTMLFormElement;
  #error: string | null;
  #loading: boolean;

  constructor() {
    super();
    this.#error = null;
    this.#loading = false;
    this.attachShadow({ mode: "open" });
    if (!this.shadowRoot) throw Error("Shadow root not attached.");
    this.shadowRoot.innerHTML = template;
    this.#loginTemplate = this.shadowRoot.getElementById("login") as HTMLTemplateElement;
    this.#registerTemplate = this.shadowRoot.getElementById("register") as HTMLTemplateElement;
    this.#loginButton = this.shadowRoot.getElementById("login-button") as HTMLButtonElement;
    this.#registerButton = this.shadowRoot.getElementById("register-button") as HTMLButtonElement;
    this.#form = this.shadowRoot.querySelector("form")!;
    this.#setForm("login");
    this.#loginButton.toggleAttribute("active", true);
    this.#loginButton.addEventListener("click", this.#handleLoginClick);
    this.#registerButton.addEventListener("click", this.#handleRegisterClick);
    this.#form.addEventListener("submit", this.#handleSubmit);
  }

  get error(): string | null {
    return this.#error;
  }
  set error(value: string | null) {
    this.#error = value;
    const errorElement = this.shadowRoot?.getElementById("errors");
    if (!errorElement) throw Error("Error element not found.");
    errorElement.toggleAttribute("show", Boolean(this.#error));
    errorElement.textContent = this.#error;
  }
  get loading(): boolean {
    return this.#loading;
  }
  set loading(value: boolean) {
    this.#loading = value;
    const button = this.shadowRoot?.getElementById("submit");
    button!.textContent = this.#loading ? "Loading..." : "Submit";
  }

  connectedCallback() {
    onAuthStateChanged(auth, auth => (auth ? this.toggleAttribute("show", false) : this.toggleAttribute("show", true)));
  }

  disconnectedCallback() {
    this.#loginButton.removeEventListener("click", this.#handleLoginClick);
    this.#registerButton.removeEventListener("click", this.#handleRegisterClick);
    this.#form.removeEventListener("submit", this.#handleSubmit);
  }

  #handleSubmit: EventListener = event => {
    event.preventDefault();
    this.error = null;
    const formData = new FormData(this.#form);
    const formDataObj = Object.fromEntries(formData) as unknown;
    const data = formDataObj as FormData;
    const isRegister = Boolean(data["password-confirm"]);
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(data.email)) {
      this.error = "Must provide valid Email.";
    }
    if (isRegister) {
      const passwordsMatch = data.password === data["password-confirm"];
      if (!passwordsMatch) {
        this.error = "Passwords do not Match.";
        return;
      }
      this.loading = true;
      createUserWithEmailAndPassword(auth, data.email, data.password)
        .then(credentials => {
          this.removeAttribute("show");
          this.#form.reset();
        })
        .catch(error => {
          if (!(error instanceof Error)) return;
          this.error = error.message;
        })
        .finally(() => (this.loading = false));
    } else {
      this.loading = true;
      signInWithEmailAndPassword(auth, data.email, data.password)
        .then(() => {
          this.removeAttribute("show");
          this.#form.reset();
        })
        .catch(error => {
          if (!(error instanceof Error)) return;
          this.error = error.message;
        })
        .finally(() => (this.loading = false));
    }
  };

  #setForm = (mode: "login" | "register") => {
    const template = mode === "login" ? this.#loginTemplate : this.#registerTemplate;
    const inputElements = template.content.cloneNode(true);
    this.#form.innerHTML = "";
    this.#form.append(inputElements);
  };

  #handleLoginClick: EventListener = () => {
    this.#loginButton.toggleAttribute("active", true);
    this.#registerButton.removeAttribute("active");
    this.#setForm("login");
  };
  #handleRegisterClick: EventListener = () => {
    this.#loginButton.removeAttribute("active");
    this.#registerButton.toggleAttribute("active", true);
    this.#setForm("register");
  };
}
