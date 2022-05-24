import template from "./template.html";

export default class LoadingSpinner extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    if (!this.shadowRoot) throw Error("No shadow root.");
    this.shadowRoot.innerHTML = template;
  }
}
