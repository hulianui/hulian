"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ColorSwatchPicker } from "../../../../packages/ui/src/color-swatch-picker/color-swatch-picker";
import type { SwatchSize } from "../../../../packages/ui/src/color-swatch-picker/color-swatch-picker.types";
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
function Demo({ size = "md", disabled = false }: {
    size?: SwatchSize;
    disabled?: boolean;
}) {
    const [v, setV] = useState("#3b82f6");
    return (<div className="flex flex-col gap-2">
      <ColorSwatchPicker colors={PALETTE} value={v} onValueChange={setV} size={size} disabled={disabled}/>
      <code className="font-mono text-xs text-muted">{v}</code>
    </div>);
}
export const colorSwatchPickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Discrete preset color block radio selection, uncontrolled use defaultValue for initial selection.",
            code: `const PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

<ColorSwatchPicker colors={PALETTE} defaultValue="#3b82f6" />`,
            render: () => <ColorSwatchPicker colors={PALETTE} defaultValue="#3b82f6"/>,
        },
        {
            title: "Dimensions",
            description: "size supports sm / md / lg.",
            code: `<>
  <ColorSwatchPicker colors={PALETTE} defaultValue="#22c55e" size="sm" />
  <ColorSwatchPicker colors={PALETTE} defaultValue="#22c55e" size="lg" />
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <ColorSwatchPicker colors={PALETTE} defaultValue="#22c55e" size="sm"/>
          <ColorSwatchPicker colors={PALETTE} defaultValue="#22c55e" size="lg"/>
        </div>),
        },
        {
            title: "Disabled",
            description: "disabled Reduces the transparency of the entire group and blocks interaction.",
            code: `<ColorSwatchPicker colors={PALETTE} defaultValue="#8b5cf6" disabled />`,
            render: () => <ColorSwatchPicker colors={PALETTE} defaultValue="#8b5cf6" disabled/>,
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "Dimensions" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "sm", render: () => <Demo size="sm"/> },
        { name: "lg", render: () => <Demo size="lg"/> },
        { name: "disabled", render: () => <Demo disabled/> },
    ],
    renderWithProps: (props) => (<Demo size={(props.size as SwatchSize) ?? "md"} disabled={Boolean(props.disabled)}/>),
    toCode: (props) => {
        const attrs: string[] = ["colors={PALETTE}", `defaultValue="#3b82f6"`];
        if (props.size && props.size !== "md")
            attrs.push(`size="${props.size}"`);
        if (props.disabled)
            attrs.push("disabled");
        return `<ColorSwatchPicker ${attrs.join(" ")} />`;
    },
};
