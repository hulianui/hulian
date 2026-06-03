"use client";
import { useState } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Toggle, ToggleGroup } from "./toggle";

function SingleToggle(p: Record<string, unknown>) {
  const [on, setOn] = useState(false);
  return (
    <Toggle
      pressed={on}
      onPressedChange={setOn}
      variant={(p.variant as "default" | "outline") ?? "default"}
      disabled={p.disabled as boolean}
      aria-label="bold"
    >
      <Bold className="size-4" />
    </Toggle>
  );
}

export const toggleShowcase: ShowcaseSpec = {
  controls: [
    { prop: "variant", type: "select", options: ["default", "outline"], defaultValue: "default" },
    { prop: "disabled", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "off", render: () => <Toggle aria-label="bold"><Bold className="size-4" /></Toggle> },
    { name: "on", render: () => <Toggle defaultPressed aria-label="bold"><Bold className="size-4" /></Toggle> },
    {
      name: "group-single",
      render: () => (
        <ToggleGroup defaultValue={["center"]}>
          <Toggle value="left" aria-label="左对齐"><AlignLeft className="size-4" /></Toggle>
          <Toggle value="center" aria-label="居中"><AlignCenter className="size-4" /></Toggle>
          <Toggle value="right" aria-label="右对齐"><AlignRight className="size-4" /></Toggle>
        </ToggleGroup>
      ),
    },
    {
      name: "group-multiple",
      render: () => (
        <ToggleGroup multiple defaultValue={["bold", "italic"]}>
          <Toggle value="bold" aria-label="加粗"><Bold className="size-4" /></Toggle>
          <Toggle value="italic" aria-label="斜体"><Italic className="size-4" /></Toggle>
          <Toggle value="underline" aria-label="下划线"><Underline className="size-4" /></Toggle>
        </ToggleGroup>
      ),
    },
    { name: "disabled", render: () => <Toggle disabled defaultPressed aria-label="bold"><Bold className="size-4" /></Toggle> },
  ],
  renderWithProps: (p) => <SingleToggle {...p} />,
  toCode: (p) =>
    `<Toggle${p.variant && p.variant !== "default" ? ` variant="${p.variant}"` : ""}${p.disabled ? " disabled" : ""}>\n  <Bold />\n</Toggle>`,
};
