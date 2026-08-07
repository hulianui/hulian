"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ChevronDown } from "../_icons";
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
      title: "图标档与文字档等高",
      description:
        "iconSm/icon/iconLg 的边长依次等于 sm/md/lg 的高度（32/40/48）。混排取同名的一对才不会露台阶。",
      code: `<Button size="sm">小</Button>
<Button size="iconSm" aria-label="更多"><ChevronDown className="size-4" /></Button>
<Button size="md">中</Button>
<Button size="icon" aria-label="更多"><ChevronDown className="size-4" /></Button>
<Button size="lg">大</Button>
<Button size="iconLg" aria-label="更多"><ChevronDown className="size-5" /></Button>`,
      render: () => (
        <>
          <Button size="sm">小</Button>
          <Button size="iconSm" aria-label="更多">
            <ChevronDown className="size-4" />
          </Button>
          <Button size="md">中</Button>
          <Button size="icon" aria-label="更多">
            <ChevronDown className="size-4" />
          </Button>
          <Button size="lg">大</Button>
          <Button size="iconLg" aria-label="更多">
            <ChevronDown className="size-5" />
          </Button>
        </>
      ),
    },
    {
      title: "语义档",
      description:
        "tone 表达「这是什么性质的操作」，与 variant（形态）正交。neutral 的实心是反色，不是灰底。",
      code: `<Button>提交</Button>
<Button tone="success">通过</Button>
<Button tone="warning">驳回</Button>
<Button tone="danger">删除</Button>
<Button tone="neutral">跳过</Button>`,
      render: () => (
        <>
          <Button>提交</Button>
          <Button tone="success">通过</Button>
          <Button tone="warning">驳回</Button>
          <Button tone="danger">删除</Button>
          <Button tone="neutral">跳过</Button>
        </>
      ),
    },
    {
      title: "语义档 × 形态",
      description: "同一个 tone 换 variant 即得描边 / 幽灵形态，不必为此另开枚举值。",
      code: `<Button tone="success" variant="outline">通过</Button>
<Button tone="warning" variant="outline">驳回</Button>
<Button tone="danger" variant="outline">删除</Button>
<Button tone="success" variant="ghost">通过</Button>
<Button tone="danger" variant="link">删除</Button>`,
      render: () => (
        <>
          <Button tone="success" variant="outline">
            通过
          </Button>
          <Button tone="warning" variant="outline">
            驳回
          </Button>
          <Button tone="danger" variant="outline">
            删除
          </Button>
          <Button tone="success" variant="ghost">
            通过
          </Button>
          <Button tone="danger" variant="link">
            删除
          </Button>
        </>
      ),
    },
    {
      title: "块级铺满",
      description: "block 让按钮撑满容器宽度，用于移动端主操作与表单底部提交。",
      code: `<Button block>登录</Button>
<Button block variant="outline">使用其它方式</Button>`,
      render: () => (
        <div className="w-full max-w-xs space-y-2">
          <Button block>登录</Button>
          <Button block variant="outline">
            使用其它方式
          </Button>
        </div>
      ),
    },
    {
      title: "加载与禁用",
      description: "loading 自动进入禁用并显示 spinner。",
      code: `<Button loading>加载中</Button>
<Button disabled>禁用</Button>`,
      render: () => (
        <>
          <Button loading>加载中</Button>
          <Button disabled>禁用</Button>
        </>
      ),
    },
  ],
  controls: [
    { prop: "variant", type: "select", options: ["solid", "outline", "ghost", "link"], defaultValue: "solid" },
    {
      prop: "tone",
      type: "select",
      options: ["brand", "success", "warning", "danger", "neutral"],
      defaultValue: "brand",
    },
    {
      prop: "size",
      type: "select",
      options: ["sm", "md", "lg", "icon", "iconSm", "iconLg"],
      defaultValue: "md",
    },
    { prop: "block", type: "boolean", defaultValue: false, label: "块级铺满" },
    { prop: "loading", type: "boolean", defaultValue: false },
    { prop: "children", type: "text", defaultValue: "瑚琏按钮", label: "文案" },
  ],
  states: [
    { name: "default", render: () => <Button>默认</Button> },
    { name: "outline", render: () => <Button variant="outline">描边</Button> },
    { name: "ghost", render: () => <Button variant="ghost">幽灵</Button> },
    { name: "link", render: () => <Button variant="link">文字链接</Button> },
    { name: "success", render: () => <Button tone="success">通过</Button> },
    { name: "warning", render: () => <Button tone="warning">驳回</Button> },
    { name: "danger", render: () => <Button tone="danger">危险</Button> },
    { name: "neutral", render: () => <Button tone="neutral">跳过</Button> },
    { name: "disabled", render: () => <Button disabled>禁用</Button> },
    { name: "loading", render: () => <Button loading>加载中</Button> },
  ],
  renderWithProps: (p) => (
    <Button
      variant={p.variant as "solid" | "outline" | "ghost" | "link"}
      tone={p.tone as "brand" | "success" | "warning" | "danger" | "neutral"}
      size={p.size as "sm" | "md" | "lg" | "icon" | "iconSm" | "iconLg"}
      block={p.block as boolean}
      loading={p.loading as boolean}
    >
      {p.children as string}
    </Button>
  ),
  toCode: (p) =>
    `<Button variant="${p.variant}" tone="${p.tone}" size="${p.size}"${p.block ? " block" : ""}${p.loading ? " loading" : ""}>${p.children}</Button>`,
};
