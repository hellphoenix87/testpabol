import type { Meta, StoryObj } from "@storybook/react";

import { AutoHeightTextarea } from "@app/components/AutoHeightTextarea";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: "App/components/AutoHeightTextarea",
  component: AutoHeightTextarea,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    value: { control: "color" },
  },
} satisfies Meta<typeof AutoHeightTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {
    value: "My value",
    id: "field",
    className: "",
    placeholder: "Please, fill in this field",
    disabled: false,
    onChange: () => {
      console.log("onChange");
    },
    onBlur: () => {
      console.log("onBlur");
    },
  },
};
