"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "./button";

export const buttonShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认实心按钮，另有描边、幽灵、文字链接 4 种变体。",
      code: `<Button>默认</Button>
<Button variant="outline">描边</Button>
<Button variant="ghost">幽灵</Button>
<Button variant="link">文字链接</Button>`,
      render: () => (
        <>
          <Button>默认</Button>
          <Button variant="outline">描边</Button>
          <Button variant="ghost">幽灵</Button>
          <Button variant="link">文字链接</Button>
        </>
      ),
    },
    {
      title: "尺寸",
      description: "sm / md / lg 三档高度。",
      code: `<Button size="sm">小</Button>
<Button size="md">中</Button>
<Button size="lg">大</Button>`,
      render: () => (
        <>
          <Button size="sm">小</Button>
          <Button size="md">中</Button>
          <Button size="lg">大</Button>
        </>
      ),
    },
    {
      title: "加载与禁用",
      description: "loading 自动进入禁用并显示 spinner；tone=danger 表危险操作。",
      code: `<Button loading>加载中</Button>
<Button disabled>禁用</Button>
<Button tone="danger">删除</Button>`,
      render: () => (
        <>
          <Button loading>加载中</Button>
          <Button disabled>禁用</Button>
          <Button tone="danger">删除</Button>
        </>
      ),
    },
  ],
  controls: [
    { prop: "variant", type: "select", options: ["solid", "outline", "ghost", "link"], defaultValue: "solid" },
    { prop: "tone", type: "select", options: ["brand", "danger"], defaultValue: "brand" },
    { prop: "size", type: "select", options: ["sm", "md", "lg", "icon", "iconSm"], defaultValue: "md" },
    { prop: "loading", type: "boolean", defaultValue: false },
    { prop: "children", type: "text", defaultValue: "瑚琏按钮", label: "文案" },
  ],
  states: [
    { name: "default", render: () => <Button>默认</Button> },
    { name: "outline", render: () => <Button variant="outline">描边</Button> },
    { name: "ghost", render: () => <Button variant="ghost">幽灵</Button> },
    { name: "link", render: () => <Button variant="link">文字链接</Button> },
    { name: "danger", render: () => <Button tone="danger">危险</Button> },
    { name: "disabled", render: () => <Button disabled>禁用</Button> },
    { name: "loading", render: () => <Button loading>加载中</Button> },
  ],
  renderWithProps: (p) => (
    <Button
      variant={p.variant as "solid" | "outline" | "ghost" | "link"}
      tone={p.tone as "brand" | "danger"}
      size={p.size as "sm" | "md" | "lg" | "icon" | "iconSm"}
      loading={p.loading as boolean}
    >
      {p.children as string}
    </Button>
  ),
  toCode: (p) =>
    `<Button variant="${p.variant}" tone="${p.tone}" size="${p.size}"${p.loading ? " loading" : ""}>${p.children}</Button>`,
};
