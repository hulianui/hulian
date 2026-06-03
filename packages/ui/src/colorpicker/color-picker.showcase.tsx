"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { ColorPicker } from "./color-picker";
import type { ColorFormat } from "./color-picker.types";

// 受控演示载体：内部 state 承接 onValueChange（已是所选格式字符串）
function Demo({
  showInput = true,
  showFormatSwitcher = true,
  defaultFormat = "hex",
  disabled = false,
}: {
  showInput?: boolean;
  showFormatSwitcher?: boolean;
  defaultFormat?: ColorFormat;
  disabled?: boolean;
}) {
  const [v, setV] = useState("#3b82f6");
  return (
    <div className="flex flex-col gap-2">
      <ColorPicker
        value={v}
        onValueChange={setV}
        defaultFormat={defaultFormat}
        showInput={showInput}
        showFormatSwitcher={showFormatSwitcher}
        disabled={disabled}
      />
      <code className="font-mono text-xs text-muted">{v}</code>
    </div>
  );
}

export const colorPickerShowcase: ShowcaseSpec = {
  controls: [
    { prop: "defaultFormat", type: "select", options: ["hex", "rgb", "hsl"], defaultValue: "hex", label: "格式" },
    { prop: "showFormatSwitcher", type: "boolean", defaultValue: true, label: "显示格式切换器" },
    { prop: "showInput", type: "boolean", defaultValue: true, label: "显示输入框" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "rgb", render: () => <Demo defaultFormat="rgb" /> },
    { name: "hsl", render: () => <Demo defaultFormat="hsl" /> },
    { name: "no-switcher", render: () => <Demo showFormatSwitcher={false} /> },
    { name: "no-input", render: () => <Demo showInput={false} /> },
    { name: "disabled", render: () => <Demo disabled /> },
  ],
  renderWithProps: (props) => (
    <Demo
      defaultFormat={(props.defaultFormat as ColorFormat) ?? "hex"}
      showFormatSwitcher={props.showFormatSwitcher !== false}
      showInput={props.showInput !== false}
      disabled={Boolean(props.disabled)}
    />
  ),
  toCode: (props) => {
    const attrs: string[] = [`defaultValue="#3b82f6"`];
    if (props.defaultFormat && props.defaultFormat !== "hex") attrs.push(`defaultFormat="${props.defaultFormat}"`);
    if (props.showFormatSwitcher === false) attrs.push("showFormatSwitcher={false}");
    if (props.showInput === false) attrs.push("showInput={false}");
    if (props.disabled) attrs.push("disabled");
    return `<ColorPicker ${attrs.join(" ")} />`;
  },
};
