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
  examples: [
    {
      title: "包裹计数",
      description: "包裹子元素时角标叠到右上角，超过 max 显示 99+。",
      code: `<>
  <Badge count={5}>
    <Icon />
  </Badge>
  <Badge count={1000} max={99}>
    <Icon />
  </Badge>
</>`,
      render: () => (
        <div className="flex items-center gap-6">
          <Badge count={5}>
            <Host />
          </Badge>
          <Badge count={1000} max={99}>
            <Host />
          </Badge>
        </div>
      ),
    },
    {
      title: "纯点",
      description: "dot 只显示小圆点，不显示数字（常用于「未读」提示）。",
      code: `<Badge dot tone="danger">
  <Icon />
</Badge>`,
      render: () => (
        <Badge dot tone="danger">
          <Host />
        </Badge>
      ),
    },
    {
      title: "语气色",
      description: "tone 提供 danger（默认）/ brand / success / warning / neutral。",
      code: `<>
  <Badge count={3} tone="danger" />
  <Badge count={3} tone="brand" />
  <Badge count={3} tone="success" />
  <Badge count={3} tone="warning" />
</>`,
      render: () => (
        <div className="flex items-center gap-3">
          <Badge count={3} tone="danger" />
          <Badge count={3} tone="brand" />
          <Badge count={3} tone="success" />
          <Badge count={3} tone="warning" />
        </div>
      ),
    },
    {
      title: "头像在线状态",
      description: "placement 把角标钉到指定角；content 槽放自定义内容（如绿勾）。",
      code: `<>
  <Badge dot tone="success" placement="bottom-right">
    <Avatar fallback="瑚" />
  </Badge>
  <Badge tone="success" placement="bottom-right" content={<Check className="size-2.5" />}>
    <Avatar fallback="EM" />
  </Badge>
</>`,
      render: () => (
        <div className="flex items-center gap-6">
          <Badge dot tone="success" placement="bottom-right">
            <Avatar fallback="瑚" />
          </Badge>
          <Badge tone="success" placement="bottom-right" content={<Check className="size-2.5" />}>
            <Avatar fallback="EM" />
          </Badge>
        </div>
      ),
    },
  ],
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
