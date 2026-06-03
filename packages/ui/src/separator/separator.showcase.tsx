"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Separator } from "./separator";

function Horizontal() {
  return (
    <div className="w-48">
      <p className="text-sm text-foreground">瑚琏设计系统</p>
      <Separator className="my-3" />
      <p className="text-sm text-muted">吸取式聚合组件库</p>
    </div>
  );
}

function Vertical() {
  return (
    <div className="flex h-6 items-center gap-3 text-sm text-muted">
      <span>文档</span>
      <Separator orientation="vertical" />
      <span>组件</span>
      <Separator orientation="vertical" />
      <span>主题</span>
    </div>
  );
}

export const separatorShowcase: ShowcaseSpec = {
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
