"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Checkbox } from "./checkbox";
import { Field } from "../field/field";

const STATE_MAP: Record<string, { checked: boolean; indeterminate: boolean }> = {
  未选: { checked: false, indeterminate: false },
  已选: { checked: true, indeterminate: false },
  半选: { checked: false, indeterminate: true },
};

function CheckboxPlayground(p: Record<string, unknown>) {
  const init = STATE_MAP[(p.state as string) ?? "未选"] ?? STATE_MAP["未选"];
  const [checked, setChecked] = useState(init.checked);
  const [indeterminate, setIndeterminate] = useState(init.indeterminate);
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={(c) => {
        setChecked(c);
        setIndeterminate(false); // 半选点一下消解为确定态
      }}
      disabled={p.disabled as boolean}
      label={p.label as string}
    />
  );
}

export const checkboxShowcase: ShowcaseSpec = {
  controls: [
    { prop: "state", type: "select", options: ["未选", "已选", "半选"], defaultValue: "未选", label: "初始态" },
    { prop: "label", type: "text", defaultValue: "同意条款", label: "label" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "unchecked", render: () => <Checkbox aria-label="unchecked" /> },
    { name: "checked", render: () => <Checkbox defaultChecked aria-label="checked" /> },
    { name: "indeterminate", render: () => <Checkbox indeterminate aria-label="indeterminate" /> },
    { name: "with-label", render: () => <Checkbox defaultChecked label="记住我" /> },
    { name: "disabled", render: () => <Checkbox disabled label="禁用" /> },
    { name: "disabled-checked", render: () => <Checkbox disabled defaultChecked label="禁用已选" /> },
    {
      name: "in-field",
      render: () => (
        <Field label="服务条款" error="必须勾选才能继续" className="w-72">
          <Checkbox label="我已阅读并同意" />
        </Field>
      ),
    },
  ],
  // key=state → select 改变时 remount 重置初始态；label/disabled 经 props 即时生效。
  renderWithProps: (p) => <CheckboxPlayground key={p.state as string} {...p} />,
  toCode: (p) => {
    const s = p.state as string;
    const tri = s === "已选" ? " defaultChecked" : s === "半选" ? " indeterminate" : "";
    return `<Checkbox${tri}${p.disabled ? " disabled" : ""} label="${p.label}" />`;
  },
};
