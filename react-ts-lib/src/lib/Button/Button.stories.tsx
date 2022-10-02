import { ComponentMeta, ComponentStoryObj } from "@storybook/react";
import Button, { BUTTON_VARIANTS } from "./Button";
import "../../index.css";

const meta: ComponentMeta<typeof Button> = {
  title: "Design System/Button",
  component: Button,
};
export default meta;

export const Default: ComponentStoryObj<typeof Button> = {
  args: {
    children: "primary",
  },
};
export const Disabled: ComponentStoryObj<typeof Button> = {
  args: {
    children: "disabled",
    disabled: true,
  },
};
export const SuccessVariant: ComponentStoryObj<typeof Button> = {
  args: {
    children: "success",
    variant: BUTTON_VARIANTS.SUCCESS,
  },
};
export const WithClickHandler: ComponentStoryObj<typeof Button> = {
  args: {
    children: "click me",
    onClick: () => alert("button clicked"),
  },
};
