"use client";
import { useState } from "react";
import { LayoutGrid, List, Map } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Tag } from "../tag/tag";
import { Segmented } from "./segmented";
import type { SegmentedItem } from "./segmented.types";

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
      disabled={p.disabled as boolean}
      aria-label="周期"
    />
  );
}

export const segmentedShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
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
    `<Segmented\n  items={[{ value: "day", label: "日" }, { value: "week", label: "周" }, { value: "month", label: "月" }]}\n  defaultValue="week"${p.size && p.size !== "md" ? `\n  size="${p.size}"` : ""}${p.disabled ? "\n  disabled" : ""}\n/>`,
};
