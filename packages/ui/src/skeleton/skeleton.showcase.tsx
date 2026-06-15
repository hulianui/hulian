"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Skeleton } from "./skeleton";
import { CardSkeleton, ListSkeleton } from "./skeleton-presets";

export const skeletonShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "形状",
      description: "shape 支持 text / circle / rect，尺寸用 className 控制。",
      code: `<div className="flex items-center gap-4">
  <Skeleton className="w-32" />
  <Skeleton shape="circle" className="size-10" />
  <Skeleton shape="rect" className="h-16 w-32" />
</div>`,
      render: () => (
        <div className="flex items-center gap-4">
          <Skeleton className="w-32" />
          <Skeleton shape="circle" className="size-10" />
          <Skeleton shape="rect" className="h-16 w-32" />
        </div>
      ),
    },
    {
      title: "头像 + 文本行",
      description: "组合圆形与文本块，模拟用户信息加载占位。",
      code: `<div className="flex items-center gap-3">
  <Skeleton shape="circle" className="size-10" />
  <div className="flex-1 space-y-2">
    <Skeleton className="w-24" />
    <Skeleton className="w-40" />
  </div>
</div>`,
      render: () => (
        <div className="flex w-72 items-center gap-3">
          <Skeleton shape="circle" className="size-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-24" />
            <Skeleton className="w-40" />
          </div>
        </div>
      ),
    },
    {
      title: "列表预设",
      description: "ListSkeleton 一行配置出多行列表占位。",
      code: `<ListSkeleton rows={3} />`,
      render: () => (
        <div className="w-72">
          <ListSkeleton rows={3} />
        </div>
      ),
    },
    {
      title: "卡片网格预设",
      description: "CardSkeleton 输出卡片网格占位。",
      code: `<CardSkeleton count={2} />`,
      render: () => (
        <div className="w-full max-w-md">
          <CardSkeleton count={2} />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "shape", type: "select", options: ["text", "circle", "rect"], defaultValue: "text" },
  ],
  states: [
    { name: "text", render: () => <Skeleton className="w-32" /> },
    { name: "circle", render: () => <Skeleton shape="circle" className="size-10" /> },
    { name: "rect", render: () => <Skeleton shape="rect" className="h-16 w-32" /> },
    {
      name: "ListSkeleton 列表",
      render: () => (
        <div className="w-72">
          <ListSkeleton rows={3} />
        </div>
      ),
    },
    {
      name: "CardSkeleton 卡片网格",
      render: () => (
        <div className="w-full max-w-md">
          <CardSkeleton count={2} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => <Skeleton shape={p.shape as "text" | "circle" | "rect"} className="h-12 w-32" />,
  toCode: (p) => `<Skeleton shape="${p.shape}" />`,
};
