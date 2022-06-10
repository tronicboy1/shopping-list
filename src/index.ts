import AuthHandler from "@web-components/auth-handler";
import "./index.css";
import LoadingSpinner from "@web-components/loading-spinner";
import MainApp from "@web-components/main-app";
import ButtonBar from "@web-components/button-bar";
import BaseModal from "@web-components/base-modal";
import ChoresList from "@web-components/chores-list";
import ShoppingList from "@web-components/shopping-list/shopping-list";
import AllShoppingLists from "@web-components/shopping-list";
import ShoppingItemDetails from "@web-components/shopping-list/shopping-item-details";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/firebase-messaging-sw.js").catch((error) => alert(error));
}

customElements.define("auth-handler", AuthHandler);
customElements.define("all-shopping-lists", AllShoppingLists);
customElements.define("shopping-list", ShoppingList);
customElements.define("loading-spinner", LoadingSpinner);
customElements.define("main-app", MainApp);
customElements.define("button-bar", ButtonBar);
customElements.define("base-modal", BaseModal);
customElements.define("chores-list", ChoresList);
customElements.define("shopping-item-details", ShoppingItemDetails);

const body = document.querySelector("body")!;

const mainApp = document.createElement("main-app") as MainApp;

body.append(mainApp);
