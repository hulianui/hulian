"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Heatmap } from "./heatmap";
import type { HeatCell } from "./heatmap.matrix";

const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const MODULES = ["登录", "支付", "订单", "搜索", "推送"];

// 模块 × 周问题密度（确定性伪随机，避免 SSR/CSR 漂移）。
const moduleData: HeatCell[] = MODULES.flatMap((m, mi) =>
  WEEKDAYS.map((d, di) => ({ x: d, y: m, value: ((mi * 7 + di * 3 + 2) % 10) })),
);

// 12 周贡献活动。
const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
const contribData: HeatCell[] = ["一", "二", "三", "四", "五", "六", "日"].flatMap((day, dy) =>
  weeks.map((w, wi) => ({ x: w, y: day, value: ((dy * 5 + wi * 7) % 9) })),
);

export const heatmapShowcase: ShowcaseSpec = {
  controls: [
    { prop: "colorScale", type: "number", defaultValue: 5, label: "色阶档数" },
    { prop: "cellSize", type: "number", defaultValue: 16, label: "格子边长" },
    { prop: "showLabels", type: "boolean", defaultValue: true, label: "显示标签" },
  ],
  states: [
    {
      name: "模块×周问题密度",
      render: () => <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} cellSize={18} />,
    },
    {
      name: "12 周贡献活动",
      render: () => (
        <Heatmap data={contribData} xLabels={weeks} yLabels={["一", "二", "三", "四", "五", "六", "日"]} cellSize={14} />
      ),
    },
    {
      name: "无标签紧凑",
      render: () => <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} showLabels={false} cellSize={12} />,
    },
  ],
  renderWithProps: (p) => (
    <Heatmap
      data={moduleData}
      xLabels={WEEKDAYS}
      yLabels={MODULES}
      colorScale={Number(p.colorScale)}
      cellSize={Number(p.cellSize)}
      showLabels={p.showLabels as boolean}
    />
  ),
  toCode: (p) =>
    `<Heatmap data={data} colorScale={${Number(p.colorScale)}} cellSize={${Number(p.cellSize)}}${p.showLabels ? "" : " showLabels={false}"} />`,
};
