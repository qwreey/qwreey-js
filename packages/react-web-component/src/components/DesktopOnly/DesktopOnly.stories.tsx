import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesktopOnly } from "./DesktopOnly";

const meta = {
  title: "Layout/DesktopOnly",
  component: DesktopOnly,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} satisfies Meta<typeof DesktopOnly>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: <div>This text only visible in desktop size screen</div>,
  },
};
