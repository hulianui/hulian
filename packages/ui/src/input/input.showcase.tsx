"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Input } from "./input";

export const inputShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "最简输入框，传 placeholder 占位。",
      code: `<Input placeholder="请输入…" className="w-64" />`,
      render: () => <Input placeholder="请输入…" className="w-64" />,
    },
    {
      title: "前后缀",
      description: "prefix / suffix 槽嵌入单位、货币符号等。",
      code: `<Input prefix="¥" suffix=".00" placeholder="0" className="w-64" />`,
      render: () => <Input prefix="¥" suffix=".00" placeholder="0" className="w-64" />,
    },
    {
      title: "尺寸",
      description: "size 提供 sm / md（默认）/ lg 三档。",
      code: `<>
  <Input size="sm" placeholder="sm" className="w-64" />
  <Input size="md" placeholder="md" className="w-64" />
  <Input size="lg" placeholder="lg" className="w-64" />
</>`,
      render: () => (
        <div className="flex flex-col gap-3">
          <Input size="sm" placeholder="sm" className="w-64" />
          <Input size="md" placeholder="md" className="w-64" />
          <Input size="lg" placeholder="lg" className="w-64" />
        </div>
      ),
    },
    {
      title: "无效态",
      description: "invalid 标红边框与焦点环（独立使用时手动传）。",
      code: `<Input invalid defaultValue="错的值" className="w-64" />`,
      render: () => <Input invalid defaultValue="错的值" className="w-64" />,
    },
    {
      title: "禁用态",
      description: "disabled 降透明度并屏蔽交互。",
      code: `<Input disabled defaultValue="禁用态" className="w-64" />`,
      render: () => <Input disabled defaultValue="禁用态" className="w-64" />,
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "placeholder", type: "text", defaultValue: "请输入…", label: "占位符" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "default", render: () => <Input placeholder="请输入…" className="w-64" /> },
    { name: "前后缀", render: () => <Input prefix="¥" suffix=".00" placeholder="0" className="w-64" /> },
    { name: "invalid", render: () => <Input invalid defaultValue="错的值" className="w-64" /> },
    { name: "disabled", render: () => <Input disabled defaultValue="禁用态" className="w-64" /> },
    { name: "sm", render: () => <Input size="sm" placeholder="sm" className="w-64" /> },
    { name: "lg", render: () => <Input size="lg" placeholder="lg" className="w-64" /> },
  ],
  renderWithProps: (p) => (
    <Input
      size={p.size as "sm" | "md" | "lg"}
      placeholder={p.placeholder as string}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      className="w-64"
    />
  ),
  toCode: (p) =>
    `<Input size="${p.size}" placeholder="${p.placeholder}"${p.invalid ? " invalid" : ""}${
      p.disabled ? " disabled" : ""
    } />`,
};
