import type { Meta, StoryObj } from "@storybook/react-vite";
import { TransformDiv } from "./TransformDiv";
import { useRef, useState } from "react";

function show() {
  const [isForward, setIsForward] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button
        onClick={() => {
          setIsForward(!isForward);
        }}
      >
        click me to move red div
      </button>
      <TransformDiv
        targetState={
          isForward
            ? TransformDiv.TransformState.Forward
            : TransformDiv.TransformState.Backward
        }
        getExtraEndTransform={() => ({
          afterTranslate: "rotate(12deg)",
        })}
        getStartPos={() => targetRef.current?.getBoundingClientRect()}
        style={{
          background: "red",
          width: "100px",
          height: "100px",
        }}
      >
        Hello world!
      </TransformDiv>
      <div
        ref={targetRef}
        style={{
          width: "400px",
          height: "600px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "blue",
            transform: "rotate(12deg)",
            opacity: 0.5,
          }}
        >
          target div
        </div>
      </div>
    </>
  );
}

const meta = {
  title: "Layout/TransformDiv",
  component: show,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} satisfies Meta<typeof show>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
