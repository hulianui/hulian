"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ColorPicker } from "../../../../packages/ui/src/colorpicker/color-picker";
import type { ColorFormat } from "../../../../packages/ui/src/colorpicker/color-picker.types";
function Demo({ showInput = true, showFormatSwitcher = true, defaultFormat = "hex", disabled = false, }: {
    showInput?: boolean;
    showFormatSwitcher?: boolean;
    defaultFormat?: ColorFormat;
    disabled?: boolean;
}) {
    const [v, setV] = useState("#3b82f6");
    return (<div className="flex flex-col gap-2">
      <ColorPicker value={v} onValueChange={setV} defaultFormat={defaultFormat} showInput={showInput} showFormatSwitcher={showFormatSwitcher} disabled={disabled}/>
      <code className="font-mono text-xs text-muted">{v}</code>
    </div>);
}
export const colorPickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Drag and drop color palette + text input, use defaultValue as the initial color if not controlled.",
            code: `<ColorPicker defaultValue="#3b82f6" />`,
            render: () => <ColorPicker defaultValue="#3b82f6"/>,
        },
        {
            title: "Output format",
            description: "defaultFormat determines the callback and input box format: hex / rgb / hsl.",
            code: `<>
  <ColorPicker defaultValue="#22c55e" defaultFormat="rgb" />
  <ColorPicker defaultValue="#8b5cf6" defaultFormat="hsl" />
</>`,
            render: () => (<div className="flex flex-wrap gap-4">
          <ColorPicker defaultValue="#22c55e" defaultFormat="rgb"/>
          <ColorPicker defaultValue="#8b5cf6" defaultFormat="hsl"/>
        </div>),
        },
        {
            title: "Simplification: Hide switcher/input box",
            description: "showFormatSwitcher / showInput Turn off non-essential parts, leaving only the color plate.",
            code: `<>
  <ColorPicker defaultValue="#ef4444" showFormatSwitcher={false} />
  <ColorPicker defaultValue="#06b6d4" showInput={false} />
</>`,
            render: () => (<div className="flex flex-wrap gap-4">
          <ColorPicker defaultValue="#ef4444" showFormatSwitcher={false}/>
          <ColorPicker defaultValue="#06b6d4" showInput={false}/>
        </div>),
        },
        {
            title: "Disabled",
            description: "disabled Overlay + Shield interaction.",
            code: `<ColorPicker defaultValue="#3b82f6" disabled />`,
            render: () => <ColorPicker defaultValue="#3b82f6" disabled/>,
        },
    ],
    controls: [
        { prop: "defaultFormat", type: "select", options: ["hex", "rgb", "hsl"], defaultValue: "hex", label: "Format" },
        { prop: "showFormatSwitcher", type: "boolean", defaultValue: true, label: "Display format switcher" },
        { prop: "showInput", type: "boolean", defaultValue: true, label: "Show input box" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "rgb", render: () => <Demo defaultFormat="rgb"/> },
        { name: "hsl", render: () => <Demo defaultFormat="hsl"/> },
        { name: "no-switcher", render: () => <Demo showFormatSwitcher={false}/> },
        { name: "no-input", render: () => <Demo showInput={false}/> },
        { name: "disabled", render: () => <Demo disabled/> },
    ],
    renderWithProps: (props) => (<Demo defaultFormat={(props.defaultFormat as ColorFormat) ?? "hex"} showFormatSwitcher={props.showFormatSwitcher !== false} showInput={props.showInput !== false} disabled={Boolean(props.disabled)}/>),
    toCode: (props) => {
        const attrs: string[] = [`defaultValue="#3b82f6"`];
        if (props.defaultFormat && props.defaultFormat !== "hex")
            attrs.push(`defaultFormat="${props.defaultFormat}"`);
        if (props.showFormatSwitcher === false)
            attrs.push("showFormatSwitcher={false}");
        if (props.showInput === false)
            attrs.push("showInput={false}");
        if (props.disabled)
            attrs.push("disabled");
        return `<ColorPicker ${attrs.join(" ")} />`;
    },
};
