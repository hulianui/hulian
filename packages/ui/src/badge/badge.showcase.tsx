"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Avatar } from "../avatar";
import { Check } from "../_icons";
import { Badge } from "./badge";
import type { BadgePlacement, BadgeTone } from "./badge.types";

// 演示用宿主：一个圆角方块，代表 App 图标 / 头像。
function Host() {
  return <span className="block size-10 rounded-xl bg-surface-hover" aria-hidden />;
}

export const badgeShowcase: ShowcaseSpec = {
  controls: [
    { prop: "count", type: "number", defaultValue: 5, label: "计数" },
    { prop: "max", type: "number", defaultValue: 99, label: "上限" },
    { prop: "dot", type: "boolean", defaultValue: false, label: "纯点" },
    { prop: "showZero", type: "boolean", defaultValue: false, label: "显示 0" },
    {
      prop: "tone",
      type: "select",
      options: ["danger", "brand", "success", "warning", "neutral"],
      defaultValue: "danger",
    },
    { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
    {
      prop: "placement",
      type: "select",
      options: ["top-right", "top-left", "bottom-right", "bottom-left"],
      defaultValue: "top-right",
    },
  ],
  states: [
    { name: "独立计数", render: () => <Badge count={5} /> },
    { name: "溢出 99+", render: () => <Badge count={1000} max={99} /> },
    { name: "纯点", render: () => <Badge dot /> },
    {
      name: "图标 + 计数",
      render: () => (
        <Badge count={1}>
          <Host />
        </Badge>
      ),
    },
    {
      name: "头像 + 绿勾",
      render: () => (
        <Badge tone="success" placement="bottom-right" content={<Check className="size-2.5" />}>
          <Avatar fallback="EM" />
        </Badge>
      ),
    },
    {
      name: "头像 + 在线点",
      render: () => (
        <Badge dot tone="success" placement="bottom-right">
          <Avatar fallback="瑚" />
        </Badge>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Badge
      count={p.count as number}
      max={p.max as number}
      dot={p.dot as boolean}
      showZero={p.showZero as boolean}
      tone={p.tone as BadgeTone}
      size={p.size as "sm" | "md"}
      placement={p.placement as BadgePlacement}
    >
      <Host />
    </Badge>
  ),
  toCode: (p) =>
    `<Badge count={${p.count}} max={${p.max}} tone="${p.tone}" placement="${p.placement}">\n  <Icon />\n</Badge>`,
};
