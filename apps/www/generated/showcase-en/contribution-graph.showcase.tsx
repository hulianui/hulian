"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ContributionGraph } from "../../../../packages/ui/src/contribution-graph/contribution-graph";
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
    const out: {
        date: string;
        count: number;
    }[] = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        const r = rand();
        if (r > density)
            continue;
        out.push({ date: d.toISOString().slice(0, 10), count: 1 + Math.floor(rand() * 9) });
    }
    return out;
}
const yearData = makeData(365, 20260801);
const monthData = makeData(30, 7, 0.3);
export const contributionGraphShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Contribution wall (one year)",
            description: "Week column \u00D7 week row + month label + color scale legend; tone=\"success\" is the green wall of GitHub.",
            code: `<ContributionGraph
  data={commits}          // [{ date: "2026-07-30", count: 3 }, ...]
  days={365}
  tone="success"
  showLegend
/>`,
            render: () => <ContributionGraph data={yearData} days={365} endDate={END} tone="success" showLegend/>,
        },
        {
            title: "Activity bar (single line)",
            description: "layout=\"strip\" Put the most recent N days into a line and insert them to the right of the card title as an activity summary.",
            code: `<ContributionGraph layout="strip" days={30} data={events} tone="danger" />`,
            render: () => (<div className="flex w-full max-w-2xl items-center justify-between gap-4 rounded-[var(--radius)] border border-border bg-surface px-4 py-3">
          <span className="font-semibold text-danger">
            {monthData.reduce((s, d) => s + d.count, 0)} contributions · Last 30 days
          </span>
          <ContributionGraph layout="strip" days={30} endDate={END} data={monthData} tone="danger"/>
        </div>),
        },
        {
            title: "Weekday tag \u00B7 Counts starting on Monday \u00B7 Drill-down possible",
            description: "showWeekdayLabels Follow the convention of GitHub to only mark odd-numbered rows; onDayClick makes the grid focusable.",
            code: `<ContributionGraph
  data={commits}
  days={120}
  weekStart={1}
  showWeekdayLabels
  onDayClick={(d) => router.push(\`/activity?date=\${d.date}\`)}
/>`,
            render: () => (<ContributionGraph data={yearData} days={120} endDate={END} weekStart={1} showWeekdayLabels onDayClick={() => { }}/>),
        },
        {
            title: "Color \u00B7 Density",
            description: "tone is the color changing system; cellSize/gap is the density adjustment, and levels is the number of color adjustment levels.",
            code: `<>
  <ContributionGraph data={commits} days={180} tone="chart-4" cellSize={9} gap={2} />
  <ContributionGraph data={commits} days={180} tone="warning" levels={3} cellSize={14} />
</>`,
            render: () => (<div className="flex flex-col gap-4">
          <ContributionGraph data={yearData} days={180} endDate={END} tone="chart-4" cellSize={9} gap={2}/>
          <ContributionGraph data={yearData} days={180} endDate={END} tone="warning" levels={3} cellSize={14}/>
        </div>),
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
            name: "Contribution wall (one year \u00B7 GitHub Green)",
            render: () => <ContributionGraph data={yearData} days={365} endDate={END} tone="success" showLegend/>,
        },
        {
            name: "Activity bar (single line 30 days)",
            render: () => (<ContributionGraph layout="strip" days={30} endDate={END} data={monthData} tone="danger"/>),
        },
        {
            name: "Weekday tag \u00B7 Counts starting on Monday \u00B7 Drill-down possible",
            render: () => (<ContributionGraph data={yearData} days={120} endDate={END} weekStart={1} showWeekdayLabels onDayClick={() => { }}/>),
        },
        {
            name: "Color \u00B7 Density",
            render: () => (<div className="flex flex-col gap-4">
          <ContributionGraph data={yearData} days={180} endDate={END} tone="chart-4" cellSize={9} gap={2}/>
          <ContributionGraph data={yearData} days={180} endDate={END} tone="warning" levels={3} cellSize={14}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<ContributionGraph data={yearData} endDate={END} days={Number(p.days ?? 120)} layout={(p.layout as "calendar" | "strip") ?? "calendar"} tone={(p.tone as string) ?? "primary"} cellSize={Number(p.cellSize ?? 11)} showWeekdayLabels={p.showWeekdayLabels === true} showLegend={p.showLegend === true}/>),
    toCode: (p) => `<ContributionGraph
  data={commits}
  days={${p.days ?? 120}}${p.layout === "strip" ? "\n  layout=\"strip\"" : ""}${p.tone && p.tone !== "primary" ? `
  tone="${p.tone}"` : ""}${p.cellSize && Number(p.cellSize) !== 11 ? `
  cellSize={${p.cellSize}}` : ""}${p.showWeekdayLabels === true ? "\n  showWeekdayLabels" : ""}${p.showLegend === true ? "\n  showLegend" : ""}
/>`,
};
