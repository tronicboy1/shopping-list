import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import ContextProvider from "./helpers/ContextProvider";
import BaseCard from "@web-components/base-card";
import AuthHandler from "@web-components/auth-handler";

customElements.define("auth-handler", AuthHandler);

const rootElement = document.getElementById("root");
if (!rootElement) throw Error("Root element not found.");

const root = createRoot(rootElement);

customElements.define("base-card", BaseCard)

root.render(
  <ContextProvider>
    <App />
  </ContextProvider>
);
