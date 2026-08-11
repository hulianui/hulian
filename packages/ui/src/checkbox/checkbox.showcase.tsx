"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Checkbox } from "./checkbox";
import { Field } from "../field/field";

const STATE_MAP: Record<string, { checked: boolean; indeterminate: boolean }> = {
  "未选": { checked: false, indeterminate: false },
  "已选": { checked: true, indeterminate: false },
  "半选": { checked: false, indeterminate: true },
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
  examples: [
    {
      title: "基础用法",
      description: "label 渲染盒右文案并原生关联，点击文字也可切换。",
      code: `<Checkbox label="同意条款" />`,
      render: () => <Checkbox label="同意条款" />,
    },
    {
      title: "默认选中",
      description: "非受控写法用 defaultChecked 预设勾选。",
      code: `<Checkbox defaultChecked label="记住我" />`,
      render: () => <Checkbox defaultChecked label="记住我" />,
    },
    {
      title: "三态：半选",
      description: "indeterminate 渲染横杠，常用于「全选」父项。",
      code: `<>
  <Checkbox indeterminate label="半选" />
  <Checkbox defaultChecked label="已选" />
  <Checkbox label="未选" />
</>`,
      render: () => (
        <div className="flex flex-col gap-2">
          <Checkbox indeterminate label="半选" />
          <Checkbox defaultChecked label="已选" />
          <Checkbox label="未选" />
        </div>
      ),
    },
    {
      title: "禁用态",
      description: "disabled 降透明度并屏蔽交互（选中态同样可禁用）。",
      code: `<>
  <Checkbox disabled label="禁用" />
  <Checkbox disabled defaultChecked label="禁用已选" />
</>`,
      render: () => (
        <div className="flex flex-col gap-2">
          <Checkbox disabled label="禁用" />
          <Checkbox disabled defaultChecked label="禁用已选" />
        </div>
      ),
    },
    {
      title: "配合 Field",
      description: "放进 Field 内自动串联标签与错误信息。",
      code: `<Field label="服务条款" error="必须勾选才能继续" className="w-72">
  <Checkbox label="我已阅读并同意" />
</Field>`,
      render: () => (
        <Field label="服务条款" error="必须勾选才能继续" className="w-72">
          <Checkbox label="我已阅读并同意" />
        </Field>
      ),
    },
  ],
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
    {
      name: "size=sm（密集界面）",
      render: () => (
        <div className="flex items-center gap-4">
          <Checkbox defaultChecked size="sm" label="长期有效" />
          <Checkbox defaultChecked size="sm" label="必填" labelClassName="text-muted-foreground" />
        </div>
      ),
    },
    { name: "size 对照（sm / md）", render: () => (
      <div className="flex items-center gap-4">
        <Checkbox defaultChecked size="sm" label="sm" />
        <Checkbox defaultChecked label="md" />
      </div>
    ) },
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
