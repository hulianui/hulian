"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { ColorPicker } from "./color-picker";

// 受控演示载体：内部 state 承接 onValueChange
function Demo({ showInput = true, disabled = false }: { showInput?: boolean; disabled?: boolean }) {
  const [v, setV] = useState("#3b82f6");
  return <ColorPicker value={v} onValueChange={setV} showInput={showInput} disabled={disabled} />;
}

export const colorPickerShowcase: ShowcaseSpec = {
  controls: [
    { prop: "showInput", type: "boolean", defaultValue: true, label: "显示输入框" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "no-input", render: () => <Demo showInput={false} /> },
    { name: "disabled", render: () => <Demo disabled /> },
  ],
  renderWithProps: (props) => (
    <Demo showInput={props.showInput !== false} disabled={Boolean(props.disabled)} />
  ),
  toCode: (props) => {
    const attrs: string[] = [`defaultValue="#3b82f6"`];
    if (props.showInput === false) attrs.push("showInput={false}");
    if (props.disabled) attrs.push("disabled");
    return `<ColorPicker ${attrs.join(" ")} />`;
  },
};
