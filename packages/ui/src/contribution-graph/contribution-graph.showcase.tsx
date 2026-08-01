"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ContributionGraph } from "./contribution-graph";

// 固定结束日 + 确定性伪随机：文档站每次渲染都一样，便于视觉回归对比。
const END = "2026-08-01";

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function makeData(days: number, seed: number, density = 0.45) {
  const rand = seeded(seed);
  const end = new Date(`${END}T00:00:00`);
  const out: { date: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const r = rand();
    if (r > density) continue;
    out.push({ date: d.toISOString().slice(0, 10), count: 1 + Math.floor(rand() * 9) });
  }
  return out;
}

const yearData = makeData(365, 20260801);
const monthData = makeData(30, 7, 0.3);

export const contributionGraphShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "贡献墙（一年）",
      description: "周列 × 星期行 + 月份标签 + 色阶图例；tone=\"success\" 即 GitHub 那面绿墙。",
      code: `<ContributionGraph
  data={commits}          // [{ date: "2026-07-30", count: 3 }, ...]
  days={365}
  tone="success"
  showLegend
/>`,
      render: () => <ContributionGraph data={yearData} days={365} endDate={END} tone="success" showLegend />,
    },
    {
      title: "活动条（单行）",
      description: "layout=\"strip\" 把最近 N 天压成一行，塞进卡片标题右侧当活动摘要。",
      code: `<ContributionGraph layout="strip" days={30} data={events} tone="danger" />`,
      render: () => (
        <div className="flex w-full max-w-2xl items-center justify-between gap-4 rounded-[var(--radius)] border border-border bg-surface px-4 py-3">
          <span className="font-semibold text-danger">
            {monthData.reduce((s, d) => s + d.count, 0)} 次贡献 · 最近 30 天
          </span>
          <ContributionGraph layout="strip" days={30} endDate={END} data={monthData} tone="danger" />
        </div>
      ),
    },
    {
      title: "星期标签 · 周一起算 · 可下钻",
      description: "showWeekdayLabels 按 GitHub 惯例只标奇数行；onDayClick 让格子变可聚焦按钮。",
      code: `<ContributionGraph
  data={commits}
  days={120}
  weekStart={1}
  showWeekdayLabels
  onDayClick={(d) => router.push(\`/activity?date=\${d.date}\`)}
/>`,
      render: () => (
        <ContributionGraph
          data={yearData}
          days={120}
          endDate={END}
          weekStart={1}
          showWeekdayLabels
          onDayClick={() => {}}
        />
      ),
    },
    {
      title: "色系 · 密度",
      description: "tone 换色系；cellSize/gap 调密度，levels 调色阶档数。",
      code: `<>
  <ContributionGraph data={commits} days={180} tone="chart-4" cellSize={9} gap={2} />
  <ContributionGraph data={commits} days={180} tone="warning" levels={3} cellSize={14} />
</>`,
      render: () => (
        <div className="flex flex-col gap-4">
          <ContributionGraph data={yearData} days={180} endDate={END} tone="chart-4" cellSize={9} gap={2} />
          <ContributionGraph data={yearData} days={180} endDate={END} tone="warning" levels={3} cellSize={14} />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "layout", type: "select", options: ["calendar", "strip"], defaultValue: "calendar" },
    {
      prop: "tone",
      type: "select",
      options: ["primary", "success", "warning", "danger", "chart-4"],
      defaultValue: "primary",
    },
    { prop: "days", type: "number", defaultValue: 120 },
    { prop: "cellSize", type: "number", defaultValue: 11 },
    { prop: "showWeekdayLabels", type: "boolean", defaultValue: false },
    { prop: "showLegend", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "贡献墙（一年 · GitHub 绿）",
      render: () => <ContributionGraph data={yearData} days={365} endDate={END} tone="success" showLegend />,
    },
    {
      name: "活动条（单行 30 天）",
      render: () => (
        <ContributionGraph layout="strip" days={30} endDate={END} data={monthData} tone="danger" />
      ),
    },
    {
      name: "星期标签 · 周一起算 · 可下钻",
      render: () => (
        <ContributionGraph
          data={yearData}
          days={120}
          endDate={END}
          weekStart={1}
          showWeekdayLabels
          onDayClick={() => {}}
        />
      ),
    },
    {
      name: "色系 · 密度",
      render: () => (
        <div className="flex flex-col gap-4">
          <ContributionGraph data={yearData} days={180} endDate={END} tone="chart-4" cellSize={9} gap={2} />
          <ContributionGraph data={yearData} days={180} endDate={END} tone="warning" levels={3} cellSize={14} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <ContributionGraph
      data={yearData}
      endDate={END}
      days={Number(p.days ?? 120)}
      layout={(p.layout as "calendar" | "strip") ?? "calendar"}
      tone={(p.tone as string) ?? "primary"}
      cellSize={Number(p.cellSize ?? 11)}
      showWeekdayLabels={p.showWeekdayLabels === true}
      showLegend={p.showLegend === true}
    />
  ),
  toCode: (p) =>
    `<ContributionGraph\n  data={commits}\n  days={${p.days ?? 120}}${
      p.layout === "strip" ? '\n  layout="strip"' : ""
    }${p.tone && p.tone !== "primary" ? `\n  tone="${p.tone}"` : ""}${
      p.cellSize && Number(p.cellSize) !== 11 ? `\n  cellSize={${p.cellSize}}` : ""
    }${p.showWeekdayLabels === true ? "\n  showWeekdayLabels" : ""}${
      p.showLegend === true ? "\n  showLegend" : ""
    }\n/>`,
};
