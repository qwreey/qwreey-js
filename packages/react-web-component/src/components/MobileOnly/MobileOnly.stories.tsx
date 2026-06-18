import type { Meta, StoryObj } from "@storybook/react-vite";
import { MobileOnly } from "./MobileOnly";

const meta = {
  title: "Layout/MobileOnly",
  component: MobileOnly,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} satisfies Meta<typeof MobileOnly>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: <div>This text only visible in mobile size screen</div>,
  },
};
