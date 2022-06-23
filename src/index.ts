import "./index.css";
import LoadingSpinner from "@web-components/loading-spinner";
import MainApp from "@web-components/main-app";
import ButtonBar from "@web-components/button-bar";
import BaseModal from "@web-components/base-modal";
import PlusIcon from "@web-components/plus-icon";
import CameraPlusIcon from "@web-components/icons/camera-plus-icon";
import ImageIcon from "@web-components/icons/image-icon";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

customElements.define("loading-spinner", LoadingSpinner);
customElements.define("plus-icon", PlusIcon);
customElements.define("main-app", MainApp);
customElements.define("button-bar", ButtonBar);
customElements.define("base-modal", BaseModal);
customElements.define("camera-plus-icon", CameraPlusIcon);
customElements.define("image-icon", ImageIcon);

const body = document.querySelector("body")!;

const mainApp = document.createElement("main-app") as MainApp;

body.append(mainApp);
