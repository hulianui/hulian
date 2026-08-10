"use client";
import { copy } from "./review-board.content";
import { AreaChart, BarChart, Card, CardBody, CardHeader, PieChart, Stat } from "@hulianui/ui";
import { mulberry32 } from "../../_lib/rng";

const r = mulberry32(20260605);

// —— 确定性 mock 数据（seed 固定 → 复盘数据稳定）——
const FUNNEL = [
  { name: copy("openAudienceRoom"), value: 86000 },
  { name: copy("qualifiedViewers"), value: 52400 },
  { name: copy("engagedViewers"), value: 31800 },
  { name: copy("productClicks"), value: 18600 },
  { name: copy("ordersSubmitted"), value: 7240 },
];

const GIFT_TREND = Array.from({ length: 12 }, (_, i) => ({
  t: `${i * 10}m`,
  礼物: Math.round(200 + r() * 800),
  打赏: Math.round(120 + r() * 500),
}));

const HOURLY = Array.from({ length: 8 }, (_, i) => ({
  t: `${19 + Math.floor(i / 2)}:${i % 2 ? "30" : "00"}`,
  在线: Math.round(6000 + r() * 9000),
}));

const AGE = [
  { name: "18-23", value: 28, color: "var(--color-chart-1)" },
  { name: "24-30", value: 41, color: "var(--color-chart-2)" },
  { name: "31-40", value: 22, color: "var(--color-chart-3)" },
  { name: "40+", value: 9, color: "var(--color-chart-4)" },
];

const REGION = [
  { name: copy("guangdong"), value: 24, color: "var(--color-chart-1)" },
  { name: copy("jiangsuZhejiangShanghai"), value: 31, color: "var(--color-chart-2)" },
  { name: copy("sichuanChongqing"), value: 14, color: "var(--color-chart-3)" },
  { name: copy("other"), value: 31, color: "var(--color-chart-4)" },
];

export function ReviewBoard() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label={copy("totalViews")} value="86,240" delta={12.4} />
        <Stat label={copy("peakViewers")} value="21,580" delta={6.1} />
        <Stat label={copy("averageWatchTime")} value={copy("text4m38s")} delta={3.2} />
        <Stat label={copy("revenue")} value={copy("text189k")} delta={18.7} />
        <Stat label={copy("salesConversion")} value="8.4%" delta={1.5} />
        <Stat label={copy("salesPer1kViews")} value="¥219" delta={-2.3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>{copy("conversionFunnel")}</CardHeader>
          <CardBody>
            <BarChart
              data={FUNNEL}
              xKey="name"
              horizontal
              height={240}
              series={[{ key: "value", label: copy("viewers"), color: "var(--color-chart-2)" }]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>{copy("giftTipTrend")}</CardHeader>
          <CardBody>
            <AreaChart
              data={GIFT_TREND}
              xKey="t"
              height={240}
              stacked
              series={[
                { key: copy("gifts"), label: copy("giftValue"), color: "var(--color-chart-1)" },
                { key: copy("tips"), label: copy("tipValue"), color: "var(--color-chart-4)" },
              ]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>{copy("peakConcurrentViewers")}</CardHeader>
          <CardBody>
            <BarChart
              data={HOURLY}
              xKey="t"
              height={220}
              series={[{ key: copy("online"), label: copy("viewers2"), color: "var(--color-chart-3)" }]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>{copy("audienceProfile")}</CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-center text-xs text-muted-foreground">{copy("ageDistribution")}</div>
                <PieChart data={AGE} donut height={200} />
              </div>
              <div>
                <div className="mb-1 text-center text-xs text-muted-foreground">{copy("regionDistribution")}</div>
                <PieChart data={REGION} donut height={200} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
