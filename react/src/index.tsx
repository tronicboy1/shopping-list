import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import ContextProvider from "./helpers/ContextProvider";

const rootElement = document.getElementById("root");
if (!rootElement) throw Error("Root element not found.");

const root = createRoot(rootElement);

root.render(
  <ContextProvider>
    <App />
  </ContextProvider>
);
