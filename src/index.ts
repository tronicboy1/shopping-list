import AuthHandler from "@web-components/auth-handler";
import ShoppingList from "@web-components/shopping-list";
import "./index.css";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import firebase from "./services/firebase";
import LoadingSpinner from "@web-components/loading-spinner";
import MainApp from "@web-components/main-app";

customElements.define("auth-handler", AuthHandler);
customElements.define("shopping-list", ShoppingList);
customElements.define("loading-spinner", LoadingSpinner);
customElements.define("main-app", MainApp);

const body = document.querySelector("body")!;

const mainApp = document.createElement("main-app") as MainApp;

body.append(mainApp);
