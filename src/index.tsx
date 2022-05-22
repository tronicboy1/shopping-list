import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import firebase from "./services/firebase";
import ContextProvider from "./helpers/ContextProvider";
import BaseCard from "@web-components/base-card";
import AuthHandler from "@web-components/auth-handler";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ShoppingList from "@web-components/shopping-list";

customElements.define("auth-handler", AuthHandler);
customElements.define("shopping-list", ShoppingList);

const rootElement = document.getElementById("root");
if (!rootElement) throw Error("Root element not found.");

const root = createRoot(rootElement);

customElements.define("base-card", BaseCard);

const auth = getAuth(firebase);
onAuthStateChanged(auth, user => {
  const authHandler = document.querySelector("auth-handler") as AuthHandler;
  if (user) {
    authHandler.toggleAttribute("show", false);
    root.render(
      <ContextProvider>
        <App />
      </ContextProvider>
    );
  } else {
    authHandler.toggleAttribute("show", true);
  }
});
