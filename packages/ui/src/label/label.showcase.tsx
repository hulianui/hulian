"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Label } from "./label";
import { Input } from "../input/input";
import { Switch } from "../switch/switch";

export const labelShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "htmlFor 指向控件的 id，点标签即聚焦控件。",
      code: `<Label htmlFor="email">邮箱</Label>
<Input id="email" placeholder="you@work.com" />`,
      render: () => (
        <div className="flex w-72 flex-col gap-1.5">
          <Label htmlFor="showcase-label-email">邮箱</Label>
          <Input id="showcase-label-email" placeholder="you@work.com" />
        </div>
      ),
    },
    {
      title: "设置行（左标签右控件）",
      description: "已有排版、进不去 Field 的场景：标签在左，控件在右。",
      code: `<div className="flex items-center justify-between">
  <Label htmlFor="sidebar">保持侧边栏展开</Label>
  <Switch id="sidebar" defaultChecked />
</div>`,
      render: () => (
        <div className="flex w-72 items-center justify-between">
          <Label htmlFor="showcase-label-sidebar">保持侧边栏展开</Label>
          <Switch id="showcase-label-sidebar" defaultChecked />
        </div>
      ),
    },
    {
      title: "改字号",
      description: "className 走 twMerge，传 text-xs 顶掉默认的 text-sm。",
      code: `<Label htmlFor="theme" className="text-xs">主题</Label>`,
      render: () => (
        <div className="flex w-72 flex-col gap-1.5">
          <Label htmlFor="showcase-label-theme" className="text-xs">
            主题
          </Label>
          <Input id="showcase-label-theme" placeholder="深色" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "children", type: "text", defaultValue: "邮箱", label: "文本" },
    { prop: "htmlFor", type: "text", defaultValue: "email", label: "htmlFor" },
  ],
  states: [
    { name: "default", render: () => <Label htmlFor="state-default">邮箱</Label> },
    {
      name: "withControl",
      render: () => (
        <div className="flex w-72 flex-col gap-1.5">
          <Label htmlFor="state-with-control">邮箱</Label>
          <Input id="state-with-control" placeholder="you@work.com" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Label htmlFor={(p.htmlFor as string) || undefined}>{p.children as string}</Label>
  ),
  toCode: (p) => `<Label${p.htmlFor ? ` htmlFor="${p.htmlFor}"` : ""}>${p.children}</Label>`,
};
