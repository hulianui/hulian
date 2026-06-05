"use client";
import { AreaChart, BarChart, Card, CardBody, CardHeader, PieChart, Stat } from "@hulian/ui";
import { mulberry32 } from "../../_lib/rng";

const r = mulberry32(20260605);

// —— 确定性 mock 数据（seed 固定 → 复盘数据稳定）——
const FUNNEL = [
  { name: "进入直播间", value: 86000 },
  { name: "有效停留", value: 52400 },
  { name: "参与互动", value: 31800 },
  { name: "点击商品", value: 18600 },
  { name: "提交订单", value: 7240 },
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
  { name: "广东", value: 24, color: "var(--color-chart-1)" },
  { name: "江浙沪", value: 31, color: "var(--color-chart-2)" },
  { name: "川渝", value: 14, color: "var(--color-chart-3)" },
  { name: "其他", value: 31, color: "var(--color-chart-4)" },
];

export function ReviewBoard() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="场观人次" value="86,240" delta={12.4} />
        <Stat label="最高在线" value="21,580" delta={6.1} />
        <Stat label="平均停留" value="4分38秒" delta={3.2} />
        <Stat label="成交额" value="¥18.9万" delta={18.7} />
        <Stat label="成交转化" value="8.4%" delta={1.5} />
        <Stat label="千次观看成交" value="¥219" delta={-2.3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>转化漏斗</CardHeader>
          <CardBody>
            <BarChart
              data={FUNNEL}
              xKey="name"
              horizontal
              height={240}
              series={[{ key: "value", label: "人数", color: "var(--color-chart-2)" }]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>礼物 / 打赏趋势</CardHeader>
          <CardBody>
            <AreaChart
              data={GIFT_TREND}
              xKey="t"
              height={240}
              stacked
              series={[
                { key: "礼物", label: "礼物值", color: "var(--color-chart-1)" },
                { key: "打赏", label: "打赏值", color: "var(--color-chart-4)" },
              ]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>时段在线峰值</CardHeader>
          <CardBody>
            <BarChart
              data={HOURLY}
              xKey="t"
              height={220}
              series={[{ key: "在线", label: "在线人数", color: "var(--color-chart-3)" }]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>观众画像</CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-center text-xs text-muted">年龄分布</div>
                <PieChart data={AGE} donut height={200} />
              </div>
              <div>
                <div className="mb-1 text-center text-xs text-muted">地域分布</div>
                <PieChart data={REGION} donut height={200} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
