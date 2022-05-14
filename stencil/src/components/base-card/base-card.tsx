import { Component, h, Prop } from "@stencil/core";

@Component({
  tag: "base-card",
  styleUrl: "base-card.css",
  shadow: true,
})
export class BaseCard {
  @Prop()
  className: string;

  hostData() {
    return { className: this.className };
  }
  render() {
    return (
      <div class={`card ${this.className}`}>
        <slot></slot>
      </div>
    );
  }
}
