import type { Meta, StoryObj } from "@storybook/react-vite";
import { FullOverlay } from "./FullOverlay";
import { PassState } from "@qwreey-js/react-util";

function show(options: Omit<FullOverlay.Params, "open">) {
  const open = PassState.use(false);

  return (
    <div>
      <button onClick={() => open.update(true)}>click to open dialog</button>
      <FullOverlay open={open} {...options} />
    </div>
  );
}

const meta = {
  title: "Layout/FullOverlay",
  component: show,
} satisfies Meta<typeof show>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: <div>test</div>,
    maxScreenWidth: null,
  },
};
