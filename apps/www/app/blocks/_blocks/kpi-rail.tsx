/** @jsxImportSource ../../../lib/fixture-jsx */
// KPI 指标卡横轨 —— 4 张卡，每张含指标名、大数字、环比 delta（涨绿跌红）、迷你 Sparkline 趋势。
// 复制后改：KPIS 数组中的 label / value / delta / data 字段即可。
// delta 正数=涨(text-primary)、负数=跌(text-danger)，符合 Stat 组件约定。
// Stat 本身已含卡片边框/背景（border-border bg-surface p-5），此处用 relative 容器叠加 Sparkline 右上角。

import { Sparkline, Stat } from "@hulianui/ui";
import { translateFixtureText } from "../../../lib/fixture-copy";

const KPIS = [
  {
    label: "客户总数",
    value: "1,284",
    delta: 8.3,
    deltaLabel: "较上月",
    tone: "var(--color-chart-1)" as const,
    data: [120, 132, 141, 155, 148, 162, 178, 190, 204, 218, 232, 241],
  },
  {
    label: "本月新增",
    value: "36",
    delta: 33.3,
    deltaLabel: "较上月",
    tone: "var(--color-chart-2)" as const,
    data: [18, 22, 19, 28, 24, 32, 27, 35, 31, 38, 34, 36],
  },
  {
    label: "商机金额",
    value: "¥428 万",
    delta: 12.0,
    deltaLabel: "较上月",
    tone: "var(--color-chart-3)" as const,
    data: [280, 310, 295, 330, 320, 355, 340, 375, 360, 400, 415, 428],
  },
  {
    label: "累计成交",
    value: "¥1,076 万",
    delta: -3.2,
    deltaLabel: "较上月",
    tone: "var(--color-chart-4)" as const,
    data: [820, 840, 815, 860, 835, 870, 850, 890, 875, 910, 930, 920],
  },
];

export function KpiRailBlock() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          // Stat 自带卡片外壳（border + bg-surface + p-5），用相对定位容器叠加右上角趋势图
          <div key={kpi.label} className="relative">
            <Stat
              label={kpi.label}
              value={translateFixtureText(kpi.value)}
              delta={kpi.delta}
              deltaLabel={kpi.deltaLabel}
            />
            <div className="pointer-events-none absolute right-4 top-4">
              <Sparkline
                data={kpi.data}
                variant="area"
                width={72}
                height={36}
                tone={kpi.tone}
                highlightLast
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
