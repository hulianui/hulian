"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { ColorSwatchPicker } from "./color-swatch-picker";
import type { SwatchSize } from "./color-swatch-picker.types";

const PALETTE = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

function Demo({ size = "md", disabled = false }: { size?: SwatchSize; disabled?: boolean }) {
  const [v, setV] = useState("#3b82f6");
  return (
    <div className="flex flex-col gap-2">
      <ColorSwatchPicker colors={PALETTE} value={v} onValueChange={setV} size={size} disabled={disabled} />
      <code className="font-mono text-xs text-muted">{v}</code>
    </div>
  );
}

export const colorSwatchPickerShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "尺寸" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "sm", render: () => <Demo size="sm" /> },
    { name: "lg", render: () => <Demo size="lg" /> },
    { name: "disabled", render: () => <Demo disabled /> },
  ],
  renderWithProps: (props) => (
    <Demo size={(props.size as SwatchSize) ?? "md"} disabled={Boolean(props.disabled)} />
  ),
  toCode: (props) => {
    const attrs: string[] = ["colors={PALETTE}", `defaultValue="#3b82f6"`];
    if (props.size && props.size !== "md") attrs.push(`size="${props.size}"`);
    if (props.disabled) attrs.push("disabled");
    return `<ColorSwatchPicker ${attrs.join(" ")} />`;
  },
};
