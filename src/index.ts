import "./index.css";
import LoadingSpinner from "@web-components/loading-spinner";
import MainApp from "@web-components/main-app";
import ButtonBar from "@web-components/button-bar";
import "@web-components/base-modal";
import PlusIcon from "@web-components/plus-icon";
import CameraPlusIcon from "@web-components/icons/camera-plus-icon";
import ImageIcon from "@web-components/icons/image-icon";
import GoogleIcon from "@web-components/icons/google-icon";
import { isDev } from "./environment";

if ("serviceWorker" in navigator && !isDev) {
  navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

customElements.define("loading-spinner", LoadingSpinner);
customElements.define("plus-icon", PlusIcon);
customElements.define("main-app", MainApp);
customElements.define("button-bar", ButtonBar);
customElements.define("camera-plus-icon", CameraPlusIcon);
customElements.define("image-icon", ImageIcon);
customElements.define("google-icon", GoogleIcon);

const body = document.querySelector("body")!;

const mainApp = document.createElement("main-app") as MainApp;

body.append(mainApp);
