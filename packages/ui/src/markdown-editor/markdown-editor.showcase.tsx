"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { MarkdownEditor } from "./markdown-editor";
import { Field } from "../field";

const SAMPLE =
  "# 订单备注\n\n这是一段**重点**说明，包含：\n\n- 列表项一\n- 列表项二\n\n> 引用块\n\n`行内代码`";

function ControlledDemo() {
  const [md, setMd] = useState("# 实时回显\n\n下方显示当前 markdown");
  return (
    <div className="w-[32rem] space-y-2">
      <MarkdownEditor value={md} onChange={setMd} />
      <pre className="max-h-32 overflow-auto rounded bg-surface-hover p-2 text-xs text-muted-foreground">
        {md}
      </pre>
    </div>
  );
}

export const markdownEditorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "非受控写法，用 defaultValue 灌初始 markdown，自带工具栏。",
      code: `<MarkdownEditor defaultValue="# 标题\\n\\n正文段落" className="w-[32rem]" />`,
      render: () => <MarkdownEditor defaultValue={SAMPLE} className="w-[32rem]" />,
    },
    {
      title: "占位符 + 行高",
      description: "placeholder 提示空态，minRows 控制内容区最小高度。",
      code: `<MarkdownEditor placeholder="写点什么…" minRows={3} className="w-[32rem]" />`,
      render: () => (
        <MarkdownEditor placeholder="写点什么…" minRows={3} className="w-[32rem]" />
      ),
    },
    {
      title: "表单内（Field）",
      description: "配 Field 用，invalid 触发 danger 外壳，name 桥接原生表单。",
      code: `<Field label="订单详情（必填）" error="详情不能为空" className="w-[32rem]">
  <MarkdownEditor name="detail" invalid placeholder="必填" />
</Field>`,
      render: () => (
        <Field label="订单详情（必填）" error="详情不能为空" className="w-[32rem]">
          <MarkdownEditor name="detail" invalid placeholder="必填" />
        </Field>
      ),
    },
    {
      title: "禁用",
      description: "disabled 隐藏工具栏并锁定编辑，整体降透明度。",
      code: `<MarkdownEditor disabled defaultValue="# 只读内容" className="w-[32rem]" />`,
      render: () => <MarkdownEditor disabled defaultValue={SAMPLE} className="w-[32rem]" />,
    },
  ],
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "输入 markdown…", label: "占位符" },
    { prop: "minRows", type: "number", defaultValue: 6, label: "最小行数" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    {
      name: "default",
      render: () => <MarkdownEditor defaultValue={SAMPLE} className="w-[32rem]" />,
    },
    {
      name: "inField",
      render: () => (
        <Field label="订单详情（必填）" error="详情不能为空" className="w-[32rem]">
          <MarkdownEditor name="detail" invalid placeholder="必填" />
        </Field>
      ),
    },
    {
      name: "controlled",
      render: () => <ControlledDemo />,
    },
    {
      name: "disabled",
      render: () => <MarkdownEditor disabled defaultValue={SAMPLE} className="w-[32rem]" />,
    },
  ],
  renderWithProps: (p) => (
    <MarkdownEditor
      placeholder={p.placeholder as string}
      minRows={p.minRows as number}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      defaultValue={SAMPLE}
      className="w-[32rem]"
    />
  ),
  toCode: (p) =>
    `<MarkdownEditor${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""} placeholder="${p.placeholder}" minRows={${p.minRows}} />`,
};
