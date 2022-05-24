import template from "./template.html";
import firebase from "../../services/firebase";
import { getDatabase, ref, onValue, set, DatabaseReference, push } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface ShoppingListData {
  [id: string]: {
    item: string;
  };
}

export default class ShoppingList extends HTMLElement {
  #list: HTMLUListElement;
  #data: ShoppingListData | null;
  #ref: DatabaseReference | null;
  #clicked: string | null;
  #input: HTMLInputElement;
  #form: HTMLFormElement;
  #clearAll: HTMLButtonElement;

  constructor() {
    super();
    this.#data = null;
    this.#clicked = null;
    this.#ref = null;
    this.attachShadow({ mode: "open" });
    if (!this.shadowRoot) throw Error("Shadow root not attached");
    this.shadowRoot.innerHTML = template;
    this.#list = this.shadowRoot.querySelector("ul")!;
    this.#input = this.shadowRoot.querySelector("input")!;
    this.#form = this.shadowRoot.querySelector("form")!;
    this.#clearAll = this.shadowRoot.getElementById("clear") as HTMLButtonElement;
    this.#input.addEventListener("input", this.#handleInput);
    this.#form.addEventListener("submit", this.#handleAddItem);
    this.#clearAll.addEventListener("click", this.#handleItemClick);
  }

  connectedCallback() {
    const auth = getAuth(firebase);
    onAuthStateChanged(auth, auth => {
      if (auth) {
        const db = getDatabase(firebase);
        this.#ref = ref(db, `${auth.uid}/SHOPPING/`);
        onValue(this.#ref, snapshot => {
          this.#data = snapshot.val() as ShoppingListData;
          this.#list.childNodes.forEach(li => li.removeEventListener("click", this.#handleItemClick));
          this.#list.innerHTML = "";
          if (this.#data) {
            for (const key in this.#data) {
              const text = this.#data[key].item;
              const li = document.createElement("li");
              li.textContent = text;
              li.id = key;
              li.addEventListener("click", this.#handleItemClick);
              this.#list.append(li);
            }
          } else {
            this.#list.innerHTML = "<p>No items.</p>";
          }
        });
      } else {
        this.removeAttribute("show");
      }
    });
  }

  dissconnectedCallback() {
    this.#input.removeEventListener("input", this.#handleInput);
    this.#form.removeEventListener("submit", this.#handleAddItem);
    this.#clearAll.removeEventListener("click", this.#handleItemClick);
  }

  #handleItemClick: EventListener = event => {
    const target = event.target;
    if (!(target instanceof HTMLLIElement || target instanceof HTMLButtonElement)) return;
    const id = target.id;
    if (this.#clicked === id) {
      id === "clear" ? this.#deleteAllItems() : this.#deleteItem(id);
      this.#clicked = null;
    } else {
      this.#clicked = id;
      setTimeout(() => {
        this.#clicked = null;
      }, 400);
    }
  };
  #deleteItem = (id: string) => {
    if (!(this.#data && this.#ref)) return;
    delete this.#data[id];
    set(this.#ref, this.#data);
  };
  #deleteAllItems = () => {
    set(this.#ref!, {});
  };

  #handleInput: EventListener = event => {
    if (this.#input.value.length === this.#input.maxLength) {
      this.#input.setAttribute("class", "invalid");
    } else {
      this.#input.hasAttribute("class") && this.#input.removeAttribute("class");
    }
  };
  #handleAddItem: EventListener = event => {
    event.preventDefault();
    const item = this.#input.value.trim();
    push(this.#ref!, { item });
    this.#form.reset();
  };
}
