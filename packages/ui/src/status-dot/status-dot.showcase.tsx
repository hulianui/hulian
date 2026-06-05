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
