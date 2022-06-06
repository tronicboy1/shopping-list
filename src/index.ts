import AuthHandler from "@web-components/auth-handler";
import ShoppingList from "@web-components/shopping-list";
import "./index.css";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import firebase from "./services/firebase";
import LoadingSpinner from "@web-components/loading-spinner";

customElements.define("auth-handler", AuthHandler);
customElements.define("shopping-list", ShoppingList);
customElements.define("loading-spinner", LoadingSpinner);

const authHandler = document.querySelector("auth-handler") as AuthHandler;
const shoppingList = document.querySelector("shopping-list") as ShoppingList;
const loading = document.querySelector("loading-spinner")!;

const auth = getAuth(firebase);
onAuthStateChanged(auth, auth => {
  loading.parentElement?.removeChild(loading);
  if (auth) {
    shoppingList.toggleAttribute("show", true);
    authHandler.toggleAttribute("show", false);
  } else {
    shoppingList.toggleAttribute("show", false);
    authHandler.toggleAttribute("show", true);
  }
});
