import template from "./template.html";

export default class BaseCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.innerHTML = template;
  }

  hostData() {
    return { class: "card" }
  }
}
