"use client";
import { useState } from "react";
import { LayoutGrid, List, Map } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Tag } from "../tag/tag";
import { Segmented } from "./segmented";
import type { SegmentedItem, SegmentedTone } from "./segmented.types";

const periodItems: SegmentedItem[] = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];

function Demo(p: Record<string, unknown>) {
  const [v, setV] = useState("week");
  return (
    <Segmented
      items={periodItems}
      value={v}
      onValueChange={setV}
      size={(p.size as "sm" | "md") ?? "md"}
      tone={(p.tone as SegmentedTone) ?? "neutral"}
      disabled={p.disabled as boolean}
      aria-label="周期"
    />
  );
}

export const segmentedShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入 items 数组，defaultValue 设初始选中段，滑块平滑过渡。",
      code: `<Segmented
  items={[
    { value: "day", label: "日" },
    { value: "week", label: "周" },
    { value: "month", label: "月" },
  ]}
  defaultValue="week"
  aria-label="周期"
/>`,
      render: () => <Segmented items={periodItems} defaultValue="week" aria-label="周期" />,
    },
    {
      title: "图标段",
      description: "label 用图标时，ariaLabel 提供无障碍名称。",
      code: `<Segmented
  items={[
    { value: "grid", ariaLabel: "网格视图", label: <LayoutGrid className="size-4" /> },
    { value: "list", ariaLabel: "列表视图", label: <List className="size-4" /> },
    { value: "map", ariaLabel: "地图视图", label: <Map className="size-4" /> },
  ]}
  defaultValue="grid"
  aria-label="视图"
/>`,
      render: () => (
        <Segmented
          items={[
            { value: "grid", ariaLabel: "网格视图", label: <LayoutGrid className="size-4" /> },
            { value: "list", ariaLabel: "列表视图", label: <List className="size-4" /> },
            { value: "map", ariaLabel: "地图视图", label: <Map className="size-4" /> },
          ]}
          defaultValue="grid"
          aria-label="视图"
        />
      ),
    },
    {
      title: "段内徽标",
      description: "label 可放富节点，如计费周期里嵌一枚优惠 Tag。",
      code: `<Segmented
  items={[
    { value: "monthly", label: "按月付费" },
    {
      value: "yearly",
      ariaLabel: "按年付费，立省 2 个月",
      label: (
        <>
          按年付费
          <Tag variant="soft" tone="success" size="sm">省 2 个月</Tag>
        </>
      ),
    },
  ]}
  defaultValue="monthly"
  aria-label="计费周期"
/>`,
      render: () => (
        <Segmented
          items={[
            { value: "monthly", label: "按月付费" },
            {
              value: "yearly",
              ariaLabel: "按年付费，立省 2 个月",
              label: (
                <>
                  按年付费
                  <Tag variant="soft" tone="success" size="sm">
                    省 2 个月
                  </Tag>
                </>
              ),
            },
          ]}
          defaultValue="monthly"
          aria-label="计费周期"
        />
      ),
    },
    {
      title: "语义色档（tone）",
      description:
        "tone 与 TabsList 同名同取值，选中段的文字带上语义色，滑块仍是白药丸。默认 neutral 保持库既有的中性选中态，不传就不变。",
      code: `<Segmented
  items={[
    { value: "day", label: "日" },
    { value: "week", label: "周" },
    { value: "month", label: "月" },
  ]}
  defaultValue="week"
  tone="brand"
  aria-label="周期"
/>`,
      render: () => (
        <Segmented items={periodItems} defaultValue="week" tone="brand" aria-label="周期" />
      ),
    },
    {
      title: "尺寸",
      description: "size=\"sm\" 用于工具栏等紧凑场景。",
      code: `<>
  <Segmented size="sm" items={periodItems} defaultValue="day" aria-label="周期-小" />
  <Segmented items={periodItems} defaultValue="day" aria-label="周期-中" />
</>`,
      render: () => (
        <div className="flex items-center gap-3">
          <Segmented size="sm" items={periodItems} defaultValue="day" aria-label="周期-小" />
          <Segmented items={periodItems} defaultValue="day" aria-label="周期-中" />
        </div>
      ),
    },
    {
      title: "禁用",
      description: "单段 disabled 跳过该项；整体 disabled 禁用全部。",
      code: `<>
  <Segmented
    items={[
      { value: "a", label: "甲" },
      { value: "b", label: "乙", disabled: true },
      { value: "c", label: "丙" },
    ]}
    defaultValue="a"
    aria-label="示例"
  />
  <Segmented items={periodItems} defaultValue="week" disabled aria-label="周期" />
</>`,
      render: () => (
        <div className="flex items-center gap-3">
          <Segmented
            items={[
              { value: "a", label: "甲" },
              { value: "b", label: "乙", disabled: true },
              { value: "c", label: "丙" },
            ]}
            defaultValue="a"
            aria-label="示例"
          />
          <Segmented items={periodItems} defaultValue="week" disabled aria-label="周期" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
    {
      prop: "tone",
      type: "select",
      options: ["neutral", "brand", "success", "warning", "danger"],
      defaultValue: "neutral",
    },
    { prop: "disabled", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "default",
      render: () => <Segmented items={periodItems} defaultValue="week" aria-label="周期" />,
    },
    {
      name: "two-options",
      render: () => (
        <Segmented
          items={[
            { value: "off", label: "关闭" },
            { value: "on", label: "开启" },
          ]}
          defaultValue="on"
          aria-label="开关"
        />
      ),
    },
    {
      name: "with-icon",
      render: () => (
        <Segmented
          items={[
            { value: "grid", ariaLabel: "网格视图", label: <LayoutGrid className="size-4" /> },
            { value: "list", ariaLabel: "列表视图", label: <List className="size-4" /> },
            { value: "map", ariaLabel: "地图视图", label: <Map className="size-4" /> },
          ]}
          defaultValue="grid"
          aria-label="视图"
        />
      ),
    },
    {
      name: "with-badge",
      render: () => (
        <Segmented
          items={[
            { value: "monthly", label: "按月付费" },
            {
              value: "yearly",
              ariaLabel: "按年付费，立省 2 个月",
              label: (
                <>
                  按年付费
                  <Tag variant="soft" tone="success" size="sm">
                    省 2 个月
                  </Tag>
                </>
              ),
            },
          ]}
          defaultValue="monthly"
          aria-label="计费周期"
        />
      ),
    },
    {
      name: "tone-brand",
      render: () => (
        <Segmented items={periodItems} defaultValue="week" tone="brand" aria-label="周期" />
      ),
    },
    {
      name: "size-sm",
      render: () => <Segmented size="sm" items={periodItems} defaultValue="day" aria-label="周期" />,
    },
    {
      name: "disabled-item",
      render: () => (
        <Segmented
          items={[
            { value: "a", label: "甲" },
            { value: "b", label: "乙", disabled: true },
            { value: "c", label: "丙" },
          ]}
          defaultValue="a"
          aria-label="示例"
        />
      ),
    },
    {
      name: "disabled",
      render: () => (
        <Segmented items={periodItems} defaultValue="week" disabled aria-label="周期" />
      ),
    },
  ],
  renderWithProps: (p) => <Demo {...p} />,
  toCode: (p) =>
    `<Segmented\n  items={[{ value: "day", label: "日" }, { value: "week", label: "周" }, { value: "month", label: "月" }]}\n  defaultValue="week"${p.size && p.size !== "md" ? `\n  size="${p.size}"` : ""}${
      p.tone && p.tone !== "neutral" ? `\n  tone="${p.tone}"` : ""
    }${p.disabled ? "\n  disabled" : ""}\n/>`,
};
