"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Field } from "./field";
import { Input } from "../input/input";

export const fieldShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "label 串 Field.Label，children 为控件（Input / Textarea）。",
      code: `<Field label="邮箱">
  <Input placeholder="you@work.com" />
</Field>`,
      render: () => (
        <Field label="邮箱" className="w-72">
          <Input placeholder="you@work.com" />
        </Field>
      ),
    },
    {
      title: "帮助说明",
      description: "description 渲染 muted 小字，自动串 aria-describedby。",
      code: `<Field label="邮箱" description="我们不会公开你的邮箱">
  <Input placeholder="you@work.com" />
</Field>`,
      render: () => (
        <Field label="邮箱" description="我们不会公开你的邮箱" className="w-72">
          <Input placeholder="you@work.com" />
        </Field>
      ),
    },
    {
      title: "错误态",
      description: "error 非空即隐含 invalid（标红 + 显错），无需另传 invalid。",
      code: `<Field label="邮箱" error="邮箱格式不正确">
  <Input defaultValue="not-an-email" />
</Field>`,
      render: () => (
        <Field label="邮箱" error="邮箱格式不正确" className="w-72">
          <Input defaultValue="not-an-email" />
        </Field>
      ),
    },
    {
      title: "禁用态",
      description: "disabled 透传 Field.Root，控件随之禁用。",
      code: `<Field label="邮箱" disabled>
  <Input placeholder="you@work.com" />
</Field>`,
      render: () => (
        <Field label="邮箱" disabled className="w-72">
          <Input placeholder="you@work.com" />
        </Field>
      ),
    },
  ],
  controls: [
    { prop: "label", type: "text", defaultValue: "邮箱", label: "label" },
    { prop: "description", type: "text", defaultValue: "我们不会公开你的邮箱", label: "help" },
    { prop: "error", type: "text", defaultValue: "", label: "error（非空即标红+显错）" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    {
      name: "default",
      render: () => (
        <Field label="邮箱" className="w-72">
          <Input placeholder="you@work.com" />
        </Field>
      ),
    },
    {
      name: "withHelp",
      render: () => (
        <Field label="邮箱" description="我们不会公开你的邮箱" className="w-72">
          <Input placeholder="you@work.com" />
        </Field>
      ),
    },
    {
      name: "invalid+error",
      render: () => (
        <Field label="邮箱" error="邮箱格式不正确" className="w-72">
          <Input defaultValue="not-an-email" />
        </Field>
      ),
    },
    {
      name: "disabled",
      render: () => (
        <Field label="邮箱" disabled className="w-72">
          <Input placeholder="you@work.com" />
        </Field>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Field
      label={p.label as string}
      description={(p.description as string) || undefined}
      error={(p.error as string) || undefined}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      className="w-72"
    >
      <Input placeholder="you@work.com" />
    </Field>
  ),
  toCode: (p) =>
    `<Field label="${p.label}"${p.description ? ` description="${p.description}"` : ""}${
      p.error ? ` error="${p.error}"` : ""
    }${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""}>\n  <Input placeholder="you@work.com" />\n</Field>`,
};
