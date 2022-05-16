import { Component, h, Prop } from "@stencil/core";

@Component({
  tag: "base-button",
  styleUrl: "base-button.css",
  shadow: true,
})
export class BaseButton {
  @Prop()
  borderRadius: string;
  @Prop()
  class: string;
  @Prop()
  handleClick: EventListener;
  @Prop()
  type: string;
  @Prop()
  customStyle: { [key: string]: string };
  @Prop()
  disabled: boolean;

  render() {
    return (
      <button
        class={`${this.borderRadius} ${this.class}`}
        onClick={this.handleClick}
        type={this.type}
        style={this.customStyle}
        disabled={this.disabled}
      >
        <slot></slot>
      </button>
    );
  }
}
