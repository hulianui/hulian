/** @jsxImportSource ../../../lib/fixture-jsx */
// 仪表盘图表网格 —— 左大面积趋势图 + 右柱状图 + 下饼图，3 张图卡网格。
// 复制后改：TREND_DATA / BAR_DATA / PIE_DATA 内联数据；CardHeader 标题与说明文案。
// AreaChart/BarChart/PieChart 均走 recharts 引擎，数据格式：对象数组 + xKey + series[]{key,label}。

import { AreaChart, BarChart, Card, CardBody, CardHeader, Heading, PieChart, Text } from "@hulianui/ui";

// 近 6 个月成交趋势（万元）
const TREND_DATA = [
  { month: "1月", 成交额: 142, 商机额: 320 },
  { month: "2月", 成交额: 118, 商机额: 290 },
  { month: "3月", 成交额: 165, 商机额: 380 },
  { month: "4月", 成交额: 198, 商机额: 415 },
  { month: "5月", 成交额: 176, 商机额: 400 },
  { month: "6月", 成交额: 224, 商机额: 460 },
];

// 各渠道新增客户
const BAR_DATA = [
  { channel: "官网", 新增: 68 },
  { channel: "电话", 新增: 42 },
  { channel: "推荐", 新增: 55 },
  { channel: "展会", 新增: 29 },
  { channel: "合作", 新增: 38 },
];

// 商机阶段分布（PieChart data 格式：{name,value}[]）
const PIE_DATA = [
  { name: "初步接触", value: 28 },
  { name: "方案演示", value: 22 },
  { name: "商务谈判", value: 16 },
  { name: "待签约", value: 10 },
  { name: "已成交", value: 24 },
];

export function ChartGridBlock() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* 主图行：大趋势 2/3 + 柱状 1/3 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="outline" className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <Heading level={3} size="base">
              成交与商机趋势
            </Heading>
            <Text size="sm" tone="muted">
              近 6 个月 · 万元
            </Text>
          </CardHeader>
          <CardBody className="pt-0">
            <AreaChart
              data={TREND_DATA}
              series={[
                { key: "成交额", label: "成交额（万）" },
                { key: "商机额", label: "商机额（万）" },
              ]}
              xKey="month"
              height={240}
            />
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <Heading level={3} size="base">
              渠道新增客户
            </Heading>
          </CardHeader>
          <CardBody className="pt-0">
            <BarChart
              data={BAR_DATA}
              series={[{ key: "新增", label: "新增客户数" }]}
              xKey="channel"
              height={240}
            />
          </CardBody>
        </Card>
      </div>

      {/* 次图行：饼图独占一列，右侧可加更多图卡 */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="outline">
          <CardHeader>
            <Heading level={3} size="base">
              商机阶段分布
            </Heading>
          </CardHeader>
          <CardBody className="pt-0">
            <PieChart data={PIE_DATA} donut height={240} />
          </CardBody>
        </Card>

        {/* 占位：可继续放 LineChart / BarChart 等 */}
        <Card variant="outline" className="lg:col-span-2">
          <CardHeader>
            <Heading level={3} size="base">
              本月各销售成交额
            </Heading>
          </CardHeader>
          <CardBody className="pt-0">
            <BarChart
              data={[
                { name: "林晚晴", 成交: 58 },
                { name: "周明远", 成交: 47 },
                { name: "高敏", 成交: 35 },
                { name: "陈策", 成交: 62 },
                { name: "苏晓", 成交: 22 },
              ]}
              series={[{ key: "成交", label: "成交额（万）" }]}
              xKey="name"
              height={240}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
