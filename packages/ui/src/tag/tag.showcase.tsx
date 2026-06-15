"use client";
import { useState } from "react";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Tag } from "./tag";

type Variant = "soft" | "solid" | "outline";
type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

function Closable() {
  const [items, setItems] = useState(["待审核", "已通过", "已驳回", "草稿"]);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((t) => (
        <Tag key={t} onClose={() => setItems((s) => s.filter((x) => x !== t))}>
          {t}
        </Tag>
      ))}
      {items.length === 0 && <span className="text-sm text-muted">全部移除</span>}
    </div>
  );
}

export const tagShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "语气色",
      description: "tone 覆盖状态光谱：neutral / brand / success / warning / danger。",
      code: `<>
  <Tag>默认</Tag>
  <Tag tone="brand">处理中</Tag>
  <Tag tone="success">成功</Tag>
  <Tag tone="warning">警告</Tag>
  <Tag tone="danger">错误</Tag>
</>`,
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag>默认</Tag>
          <Tag tone="brand">处理中</Tag>
          <Tag tone="success">成功</Tag>
          <Tag tone="warning">警告</Tag>
          <Tag tone="danger">错误</Tag>
        </div>
      ),
    },
    {
      title: "变体",
      description: "variant 提供 soft（默认浅底）/ solid 实底 / outline 描边。",
      code: `<>
  <Tag variant="soft" tone="brand">soft</Tag>
  <Tag variant="solid" tone="brand">solid</Tag>
  <Tag variant="outline" tone="brand">outline</Tag>
</>`,
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag variant="soft" tone="brand">soft</Tag>
          <Tag variant="solid" tone="brand">solid</Tag>
          <Tag variant="outline" tone="brand">outline</Tag>
        </div>
      ),
    },
    {
      title: "状态圆点",
      description: "dot 前导状态点；pulse 让点呼吸闪烁，表达进行态。",
      code: `<>
  <Tag dot tone="success">运行中</Tag>
  <Tag dot pulse tone="brand">部署中</Tag>
  <Tag dot pulse tone="warning">重试中</Tag>
</>`,
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag dot tone="success">运行中</Tag>
          <Tag dot pulse tone="brand">部署中</Tag>
          <Tag dot pulse tone="warning">重试中</Tag>
        </div>
      ),
    },
    {
      title: "带图标",
      description: "icon 槽放前导图标（存在时不渲染 dot）。",
      code: `<>
  <Tag tone="success" icon={<CircleCheck />}>已通过</Tag>
  <Tag tone="danger" icon={<CircleX />}>已驳回</Tag>
</>`,
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag tone="success" icon={<CircleCheck />}>已通过</Tag>
          <Tag tone="danger" icon={<CircleX />}>已驳回</Tag>
        </div>
      ),
    },
    {
      title: "可关闭",
      description: "传 onClose 渲染关闭按钮，点击触发回调由调用方移除标签。",
      code: `<Tag tone="brand" onClose={() => remove(tag)}>
  可移除
</Tag>`,
      render: () => (
        <Tag tone="brand" onClose={() => {}}>
          可移除
        </Tag>
      ),
    },
  ],
  controls: [
    { prop: "variant", type: "select", options: ["soft", "solid", "outline"], defaultValue: "soft" },
    { prop: "tone", type: "select", options: ["neutral", "brand", "success", "warning", "danger"], defaultValue: "neutral" },
  ],
  states: [
    {
      name: "soft（默认）",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag>默认</Tag>
          <Tag tone="brand">处理中</Tag>
          <Tag tone="success">成功</Tag>
          <Tag tone="warning">警告</Tag>
          <Tag tone="danger">错误</Tag>
        </div>
      ),
    },
    {
      name: "solid",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag variant="solid" tone="brand">处理中</Tag>
          <Tag variant="solid" tone="success">成功</Tag>
          <Tag variant="solid" tone="warning">警告</Tag>
          <Tag variant="solid" tone="danger">错误</Tag>
        </div>
      ),
    },
    {
      name: "outline",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag variant="outline">默认</Tag>
          <Tag variant="outline" tone="brand">处理中</Tag>
          <Tag variant="outline" tone="success">成功</Tag>
        </div>
      ),
    },
    {
      name: "状态圆点",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag dot tone="neutral">已下线</Tag>
          <Tag dot tone="success">运行中</Tag>
          <Tag dot tone="warning">告警</Tag>
          <Tag dot tone="danger">已停机</Tag>
        </div>
      ),
    },
    {
      name: "呼吸圆点（进行态）",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag dot pulse tone="brand">部署中</Tag>
          <Tag dot pulse tone="success">同步中</Tag>
          <Tag dot pulse tone="warning">重试中</Tag>
        </div>
      ),
    },
    {
      name: "带图标",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag tone="brand" icon={<Info />}>信息</Tag>
          <Tag tone="success" icon={<CircleCheck />}>已通过</Tag>
          <Tag tone="warning" icon={<TriangleAlert />}>待复核</Tag>
          <Tag tone="danger" icon={<CircleX />}>已驳回</Tag>
        </div>
      ),
    },
    {
      name: "尺寸",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <Tag size="sm" tone="brand" dot>small</Tag>
          <Tag size="md" tone="brand" dot>medium</Tag>
        </div>
      ),
    },
    {
      name: "禁用",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Tag isDisabled tone="success">禁用</Tag>
          <Tag isDisabled tone="danger" onClose={() => {}}>禁用可关闭</Tag>
        </div>
      ),
    },
    { name: "可关闭", render: () => <Closable /> },
  ],
  renderWithProps: (p) => (
    <Tag variant={(p.variant as Variant) ?? "soft"} tone={(p.tone as Tone) ?? "neutral"} dot>
      状态标签
    </Tag>
  ),
  toCode: (p) =>
    `<Tag${p.variant && p.variant !== "soft" ? ` variant="${p.variant}"` : ""}${p.tone && p.tone !== "neutral" ? ` tone="${p.tone}"` : ""} dot>状态标签</Tag>`,
};
