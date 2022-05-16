import { Component, h, Prop } from "@stencil/core";

@Component({
  tag: "base-card",
  styleUrl: "base-card.css",
  shadow: true,
})
export class BaseCard {
  @Prop()
  class: string;

  hostData() {
    return { class: this.class };
  }
  render() {
    return (
      <div class={`card ${this.class}`}>
        <slot></slot>
      </div>
    );
  }
}
