import template from "./template.html";
import firebase from "../../services/firebase";
import { getDatabase, ref, onValue, set, DatabaseReference } from "firebase/database";
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

  constructor() {
    super();
    this.#data = null;
    this.#clicked = null;
    this.#ref = null;
    this.attachShadow({ mode: "open" });
    if (!this.shadowRoot) throw Error("Shadow root not attached");
    this.shadowRoot.innerHTML = template;
    this.#list = this.shadowRoot.querySelector("ul")!;
  }
  get clicked(): string | null {
    return this.#clicked;
  }
  set clicked(value: string | null) {
    if (value && this.#clicked === value) {
      this.#deleteItem(value);
      this.#clicked = null;
    } else {
      this.#clicked = value;
      setTimeout(() => {
        this.#clicked = null;
      }, 400);
    }
  }

  connectedCallback() {
    this.setAttribute("class", "card");
    const auth = getAuth(firebase);
    onAuthStateChanged(auth, auth => {
      if (auth) {
        this.toggleAttribute("show", true);
        const db = getDatabase(firebase);
        this.#ref = ref(db, `${auth.uid}/SHOPPING/`);
        onValue(this.#ref, snapshot => {
          this.#data = snapshot.val() as ShoppingListData;
          this.#list.innerHTML = "";
          for (const key in this.#data) {
            const text = this.#data[key].item;
            const li = document.createElement("li");
            li.textContent = text;
            li.id = key;
            li.addEventListener("click", this.#handleClick);
            this.#list.append(li);
          }
        });
      } else {
        this.removeAttribute("show");
      }
    });
  }

  #handleClick: EventListener = event => {
    const target = event.target;
    if (!(target instanceof HTMLLIElement)) return;
    this.clicked = target.id;
  };
  #deleteItem = (id: string) => {
    if (!(this.#data && this.#ref)) return;
    delete this.#data[id];
    set(this.#ref, this.#data);
  };
}
