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

  connectedCallback() {
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
    const id = target.id;
    if (this.#clicked === id) {
      this.#deleteItem(id);
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
}
