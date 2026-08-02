import { Sparkline, Stat } from "@hulianui/ui";
const KPIS = [
    {
        label: "Total customers",
        value: "1,284",
        delta: 8.3,
        deltaLabel: "Compared with last month",
        tone: "var(--color-chart-1)" as const,
        data: [120, 132, 141, 155, 148, 162, 178, 190, 204, 218, 232, 241],
    },
    {
        label: "New this month",
        value: "36",
        delta: 33.3,
        deltaLabel: "Compared with last month",
        tone: "var(--color-chart-2)" as const,
        data: [18, 22, 19, 28, 24, 32, 27, 35, 31, 38, 34, 36],
    },
    {
        label: "Opportunity value",
        value: "\u00A54.28 million",
        delta: 12.0,
        deltaLabel: "Compared with last month",
        tone: "var(--color-chart-3)" as const,
        data: [280, 310, 295, 330, 320, 355, 340, 375, 360, 400, 415, 428],
    },
    {
        label: "Total closed revenue",
        value: "\u00A510.76 million",
        delta: -3.2,
        deltaLabel: "Compared with last month",
        tone: "var(--color-chart-4)" as const,
        data: [820, 840, 815, 860, 835, 870, 850, 890, 875, 910, 930, 920],
    },
];
export function KpiRailBlock() {
    return (<div className="mx-auto w-full max-w-7xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (<div key={kpi.label} className="relative">
            <Stat label={kpi.label} value={kpi.value} delta={kpi.delta} deltaLabel={kpi.deltaLabel}/>
            <div className="pointer-events-none absolute right-4 top-4">
              <Sparkline data={kpi.data} variant="area" width={72} height={36} tone={kpi.tone} highlightLast/>
            </div>
          </div>))}
      </div>
    </div>);
}
