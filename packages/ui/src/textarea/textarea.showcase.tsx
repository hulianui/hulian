"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Textarea } from "./textarea";

export const textareaShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "多行输入，rows 控制初始可见行数（默认 3）。",
      code: `<Textarea placeholder="写点什么…" className="w-64" />`,
      render: () => <Textarea placeholder="写点什么…" className="w-64" />,
    },
    {
      title: "尺寸",
      description: "size 提供 sm / md（默认）/ lg 三档。",
      code: `<>
  <Textarea size="sm" placeholder="sm" className="w-64" />
  <Textarea size="md" placeholder="md" className="w-64" />
  <Textarea size="lg" placeholder="lg" className="w-64" />
</>`,
      render: () => (
        <div className="flex flex-col gap-3">
          <Textarea size="sm" placeholder="sm" className="w-64" />
          <Textarea size="md" placeholder="md" className="w-64" />
          <Textarea size="lg" placeholder="lg" className="w-64" />
        </div>
      ),
    },
    {
      title: "自适应高度",
      description: "autoResize 随内容自动长高，rows 作下限。",
      code: `<Textarea autoResize defaultValue={"随内容长高\\n第二行\\n第三行"} className="w-64" />`,
      render: () => (
        <Textarea autoResize defaultValue={"随内容长高\n第二行\n第三行"} className="w-64" />
      ),
    },
    {
      title: "无效态",
      description: "invalid 标红边框与焦点环（独立使用时手动传）。",
      code: `<Textarea invalid defaultValue="错的内容" className="w-64" />`,
      render: () => <Textarea invalid defaultValue="错的内容" className="w-64" />,
    },
    {
      title: "禁用态",
      description: "disabled 降透明度并屏蔽交互。",
      code: `<Textarea disabled defaultValue="禁用态" className="w-64" />`,
      render: () => <Textarea disabled defaultValue="禁用态" className="w-64" />,
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "placeholder", type: "text", defaultValue: "写点什么…", label: "占位符" },
    { prop: "rows", type: "number", defaultValue: 3, label: "rows" },
    { prop: "autoResize", type: "boolean", defaultValue: false, label: "自适应高度" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "default", render: () => <Textarea placeholder="写点什么…" className="w-64" /> },
    {
      name: "autoResize",
      render: () => (
        <Textarea autoResize defaultValue={"随内容长高\n第二行\n第三行\n第四行"} className="w-64" />
      ),
    },
    { name: "invalid", render: () => <Textarea invalid defaultValue="错的内容" className="w-64" /> },
    { name: "disabled", render: () => <Textarea disabled defaultValue="禁用态" className="w-64" /> },
  ],
  renderWithProps: (p) => (
    <Textarea
      size={p.size as "sm" | "md" | "lg"}
      placeholder={p.placeholder as string}
      rows={p.rows as number}
      autoResize={p.autoResize as boolean}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      className="w-64"
    />
  ),
  toCode: (p) =>
    `<Textarea size="${p.size}" placeholder="${p.placeholder}" rows={${p.rows}}${
      p.autoResize ? " autoResize" : ""
    }${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""} />`,
};
