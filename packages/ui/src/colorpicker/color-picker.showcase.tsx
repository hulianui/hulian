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
  examples: [
    {
      title: "基础用法",
      description: "色板拖拽 + 文本输入，非受控用 defaultValue 给初始色。",
      code: `<ColorPicker defaultValue="#3b82f6" />`,
      render: () => <ColorPicker defaultValue="#3b82f6" />,
    },
    {
      title: "输出格式",
      description: "defaultFormat 决定回调与输入框格式：hex / rgb / hsl。",
      code: `<>
  <ColorPicker defaultValue="#22c55e" defaultFormat="rgb" />
  <ColorPicker defaultValue="#8b5cf6" defaultFormat="hsl" />
</>`,
      render: () => (
        <div className="flex flex-wrap gap-4">
          <ColorPicker defaultValue="#22c55e" defaultFormat="rgb" />
          <ColorPicker defaultValue="#8b5cf6" defaultFormat="hsl" />
        </div>
      ),
    },
    {
      title: "精简：隐藏切换器 / 输入框",
      description: "showFormatSwitcher / showInput 关掉非必要部件，只留色板。",
      code: `<>
  <ColorPicker defaultValue="#ef4444" showFormatSwitcher={false} />
  <ColorPicker defaultValue="#06b6d4" showInput={false} />
</>`,
      render: () => (
        <div className="flex flex-wrap gap-4">
          <ColorPicker defaultValue="#ef4444" showFormatSwitcher={false} />
          <ColorPicker defaultValue="#06b6d4" showInput={false} />
        </div>
      ),
    },
    {
      title: "禁用",
      description: "disabled 罩层 + 屏蔽交互。",
      code: `<ColorPicker defaultValue="#3b82f6" disabled />`,
      render: () => <ColorPicker defaultValue="#3b82f6" disabled />,
    },
  ],
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
