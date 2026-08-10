"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Separator } from "./separator";

function Horizontal() {
  return (
    <div className="w-48">
      <p className="text-sm text-foreground">瑚琏设计系统</p>
      <Separator className="my-3" />
      <p className="text-sm text-muted-foreground">吸取式聚合组件库</p>
    </div>
  );
}

function Vertical() {
  return (
    <div className="flex h-6 items-center gap-3 text-sm text-muted-foreground">
      <span>文档</span>
      <Separator orientation="vertical" />
      <span>组件</span>
      <Separator orientation="vertical" />
      <span>主题</span>
    </div>
  );
}

export const separatorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "水平分隔",
      description: "默认方向，渲染一条占满宽度的横线分隔上下内容。",
      code: `<div className="w-48">
  <p>瑚琏设计系统</p>
  <Separator className="my-3" />
  <p>吸取式聚合组件库</p>
</div>`,
      render: () => <Horizontal />,
    },
    {
      title: "垂直分隔",
      description: '在 flex 容器内用 orientation="vertical" 撑满高度画竖线。',
      code: `<div className="flex h-6 items-center gap-3">
  <span>文档</span>
  <Separator orientation="vertical" />
  <span>组件</span>
  <Separator orientation="vertical" />
  <span>主题</span>
</div>`,
      render: () => <Vertical />,
    },
  ],
  controls: [
    { prop: "orientation", type: "select", options: ["horizontal", "vertical"], defaultValue: "horizontal" },
  ],
  states: [
    { name: "horizontal", render: () => <Horizontal /> },
    { name: "vertical", render: () => <Vertical /> },
  ],
  renderWithProps: (p) => (p.orientation === "vertical" ? <Vertical /> : <Horizontal />),
  toCode: (p) => `<Separator${p.orientation === "vertical" ? ' orientation="vertical"' : ""} />`,
};
