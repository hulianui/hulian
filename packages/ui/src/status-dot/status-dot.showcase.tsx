"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { StatusDot } from "./status-dot";
import type { ChannelStatus } from "./status-dot.types";

const labelOf: Record<ChannelStatus, string> = {
  online: "在线",
  degraded: "降级",
  offline: "离线",
  maintenance: "维护",
};

export const statusDotShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "健康状态",
      description: "四种语义态：online 在线 / degraded 降级 / offline 离线 / maintenance 维护，颜色随 tone 自动派生。",
      code: `<>
  <StatusDot status="online" label="在线" />
  <StatusDot status="degraded" label="降级" />
  <StatusDot status="offline" label="离线" />
  <StatusDot status="maintenance" label="维护中" />
</>`,
      render: () => (
        <div className="flex flex-wrap items-center gap-4">
          <StatusDot status="online" label="在线" />
          <StatusDot status="degraded" label="降级" />
          <StatusDot status="offline" label="离线" />
          <StatusDot status="maintenance" label="维护中" />
        </div>
      ),
    },
    {
      title: "尾部数值槽",
      description: "extra 槽放延迟 / 成功率等数值，tabular-nums 对齐。",
      code: `<>
  <StatusDot status="online" label="网关 A" extra="86ms" />
  <StatusDot status="degraded" label="网关 B" extra="412ms" />
</>`,
      render: () => (
        <div className="flex flex-col gap-2">
          <StatusDot status="online" label="网关 A" extra="86ms" />
          <StatusDot status="degraded" label="网关 B" extra="412ms" />
        </div>
      ),
    },
    {
      title: "脉冲",
      description: "online 默认呼吸脉冲；可用 pulse 显式开关。",
      code: `<>
  <StatusDot status="online" label="自动脉冲" />
  <StatusDot status="degraded" label="强制脉冲" pulse />
  <StatusDot status="online" label="关闭脉冲" pulse={false} />
</>`,
      render: () => (
        <div className="flex flex-wrap items-center gap-4">
          <StatusDot status="online" label="自动脉冲" />
          <StatusDot status="degraded" label="强制脉冲" pulse />
          <StatusDot status="online" label="关闭脉冲" pulse={false} />
        </div>
      ),
    },
    {
      title: "尺寸 & 仅圆点",
      description: "size 控制圆点大小；省略 label 时仅渲染圆点。",
      code: `<>
  <StatusDot status="online" size="sm" />
  <StatusDot status="online" size="md" />
  <StatusDot status="online" size="lg" />
</>`,
      render: () => (
        <div className="flex items-center gap-4">
          <StatusDot status="online" size="sm" />
          <StatusDot status="online" size="md" />
          <StatusDot status="online" size="lg" />
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "status",
      type: "select",
      options: ["online", "degraded", "offline", "maintenance"],
      defaultValue: "online",
    },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "pulse", type: "boolean", defaultValue: true, label: "脉冲" },
  ],
  states: [
    { name: "online", render: () => <StatusDot status="online" label="在线" extra="86ms" /> },
    { name: "degraded", render: () => <StatusDot status="degraded" label="降级" extra="412ms" /> },
    { name: "offline", render: () => <StatusDot status="offline" label="离线" /> },
    { name: "maintenance", render: () => <StatusDot status="maintenance" label="维护中" /> },
    { name: "仅圆点", render: () => <StatusDot status="online" /> },
  ],
  renderWithProps: (p) => (
    <StatusDot
      status={p.status as ChannelStatus}
      size={p.size as "sm" | "md" | "lg"}
      pulse={p.pulse as boolean}
      label={labelOf[p.status as ChannelStatus]}
    />
  ),
  toCode: (p) =>
    `<StatusDot status="${p.status}" size="${p.size}"${p.pulse ? " pulse" : ""} label="${labelOf[p.status as ChannelStatus]}" />`,
};
