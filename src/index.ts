import AuthHandler from "@web-components/auth-handler";
import ShoppingList from "@web-components/shopping-list";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import "./index.css";
import LoadingSpinner from "@web-components/loading-spinner";
import MainApp from "@web-components/main-app";
import ButtonBar from "@web-components/button-bar";
import BaseModal from "@web-components/base-modal";
import ChoresList from "@web-components/chores-list";
import { firebaseApp } from "@web-components/firebase";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/firebase-messaging-sw.js").catch((error) => console.log(error));
}

customElements.define("auth-handler", AuthHandler);
customElements.define("shopping-list", ShoppingList);
customElements.define("loading-spinner", LoadingSpinner);
customElements.define("main-app", MainApp);
customElements.define("button-bar", ButtonBar);
customElements.define("base-modal", BaseModal);
customElements.define("chores-list", ChoresList);

const body = document.querySelector("body")!;

const mainApp = document.createElement("main-app") as MainApp;

body.append(mainApp);
