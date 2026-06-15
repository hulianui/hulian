"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Switch } from "./switch";

function Controlled(p: Record<string, unknown>) {
  const [on, setOn] = useState(false);
  return (
    <Switch
      checked={on}
      onCheckedChange={setOn}
      disabled={p.disabled as boolean}
      aria-label="demo"
    />
  );
}

export const switchShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认关闭，点击切换开关。",
      code: `<Switch aria-label="开关" />`,
      render: () => <Switch aria-label="开关" />,
    },
    {
      title: "默认开启",
      description: "非受控写法用 defaultChecked 设初始开启态。",
      code: `<Switch defaultChecked aria-label="开关" />`,
      render: () => <Switch defaultChecked aria-label="开关" />,
    },
    {
      title: "禁用",
      description: "disabled 锁定开关，关/开两态均可禁用。",
      code: `<>
  <Switch disabled aria-label="禁用-关" />
  <Switch disabled defaultChecked aria-label="禁用-开" />
</>`,
      render: () => (
        <div className="flex items-center gap-4">
          <Switch disabled aria-label="禁用-关" />
          <Switch disabled defaultChecked aria-label="禁用-开" />
        </div>
      ),
    },
    {
      title: "带说明文字",
      description: "用 label 关联文案，点击文字也能切换。",
      code: `<label className="inline-flex items-center gap-2">
  <Switch defaultChecked aria-label="接收通知" />
  <span className="text-sm text-foreground">接收通知</span>
</label>`,
      render: () => (
        <label className="inline-flex items-center gap-2">
          <Switch defaultChecked aria-label="接收通知" />
          <span className="text-sm text-foreground">接收通知</span>
        </label>
      ),
    },
  ],
  controls: [{ prop: "disabled", type: "boolean", defaultValue: false }],
  states: [
    { name: "off", render: () => <Switch aria-label="off" /> },
    { name: "on", render: () => <Switch defaultChecked aria-label="on" /> },
    { name: "disabled", render: () => <Switch disabled aria-label="disabled" /> },
    { name: "disabled-on", render: () => <Switch disabled defaultChecked aria-label="disabled-on" /> },
  ],
  renderWithProps: (p) => <Controlled {...p} />,
  toCode: (p) => `<Switch${p.disabled ? " disabled" : ""} />`,
};
