"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Dot } from "./dot";

export const dotShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "语气色",
      description: "tone 提供 neutral / brand / success / warning / danger 五档状态色。",
      code: `<>
  <Dot tone="neutral" />
  <Dot tone="brand" />
  <Dot tone="success" />
  <Dot tone="warning" />
  <Dot tone="danger" />
</>`,
      render: () => (
        <div className="flex items-center gap-3">
          <Dot tone="neutral" />
          <Dot tone="brand" />
          <Dot tone="success" />
          <Dot tone="warning" />
          <Dot tone="danger" />
        </div>
      ),
    },
    {
      title: "尺寸",
      description: "size 提供 sm / md / lg 三档。",
      code: `<>
  <Dot size="sm" tone="brand" />
  <Dot size="md" tone="brand" />
  <Dot size="lg" tone="brand" />
</>`,
      render: () => (
        <div className="flex items-center gap-3">
          <Dot size="sm" tone="brand" />
          <Dot size="md" tone="brand" />
          <Dot size="lg" tone="brand" />
        </div>
      ),
    },
    {
      title: "呼吸（在线）",
      description: "pulse 加 animate-ping 扩散动画表示活跃态；传 label 让读屏播报语义。",
      code: `<Dot tone="success" pulse label="在线" />`,
      render: () => <Dot tone="success" pulse label="在线" />,
    },
    {
      title: "任意色（图表图例）",
      description:
        "color 接语义色名 / 任意 CSS 色，与 ChartSeries.color、Brand.color 同一条 resolveTone 路径——五档 tone 接不住 chart-1..6。注意 style={{ color }} 改不动圆点（那是文字色，静默失效）。",
      code: `<>
  <Dot color="chart-1" />
  <Dot color="chart-2" />
  <Dot color="chart-3" />
  <Dot color="#ff8800" />
</>`,
      render: () => (
        <div className="flex items-center gap-3">
          <Dot color="chart-1" />
          <Dot color="chart-2" />
          <Dot color="chart-3" />
          <Dot color="#ff8800" />
        </div>
      ),
    },
    {
      title: "列表前导标记",
      description: "Dot 作为行内原语，常做列表项的状态前导点。",
      code: `<span className="inline-flex items-center gap-2">
  <Dot tone="success" />
  服务运行中
</span>`,
      render: () => (
        <span className="inline-flex items-center gap-2 text-sm text-foreground">
          <Dot tone="success" />
          服务运行中
        </span>
      ),
    },
  ],
  controls: [
    {
      prop: "tone",
      type: "select",
      options: ["neutral", "brand", "success", "warning", "danger"],
      defaultValue: "success",
    },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "pulse", type: "boolean", defaultValue: false, label: "呼吸" },
  ],
  states: [
    { name: "neutral", render: () => <Dot tone="neutral" /> },
    { name: "brand", render: () => <Dot tone="brand" /> },
    { name: "success", render: () => <Dot tone="success" /> },
    { name: "warning", render: () => <Dot tone="warning" /> },
    { name: "danger", render: () => <Dot tone="danger" /> },
    { name: "pulse（在线）", render: () => <Dot tone="success" pulse label="在线" /> },
    { name: "lg", render: () => <Dot size="lg" tone="brand" /> },
  ],
  renderWithProps: (p) => (
    <Dot
      tone={p.tone as "neutral" | "brand" | "success" | "warning" | "danger"}
      size={p.size as "sm" | "md" | "lg"}
      pulse={p.pulse as boolean}
    />
  ),
  toCode: (p) => `<Dot tone="${p.tone}" size="${p.size}"${p.pulse ? " pulse" : ""} />`,
};
