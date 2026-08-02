import { AreaChart, BarChart, Card, CardBody, CardHeader, Heading, PieChart, Text } from "@hulianui/ui";
const TREND_DATA = [
    { month: "January", "Revenue": 142, "Pipeline value": 320 },
    { month: "February", "Revenue": 118, "Pipeline value": 290 },
    { month: "March", "Revenue": 165, "Pipeline value": 380 },
    { month: "April", "Revenue": 198, "Pipeline value": 415 },
    { month: "May", "Revenue": 176, "Pipeline value": 400 },
    { month: "June", "Revenue": 224, "Pipeline value": 460 },
];
const BAR_DATA = [
    { channel: "Website", "New": 68 },
    { channel: "Phone", "New": 42 },
    { channel: "Recommended", "New": 55 },
    { channel: "Exhibition", "New": 29 },
    { channel: "Partners", "New": 38 },
];
const PIE_DATA = [
    { name: "Initial contact", value: 28 },
    { name: "Solution demo", value: 22 },
    { name: "Negotiation", value: 16 },
    { name: "Awaiting signature", value: 10 },
    { name: "Closed won", value: 24 },
];
export function ChartGridBlock() {
    return (<div className="mx-auto w-full max-w-7xl">

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="outline" className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <Heading level={3} size="base">
              Closed revenue and pipeline trend
            </Heading>
            <Text size="sm" tone="muted">
              Last 6 months · ¥10k
            </Text>
          </CardHeader>
          <CardBody className="pt-0">
            <AreaChart data={TREND_DATA} series={[
            { key: "Revenue", label: "Revenue (\u00A510k)" },
            { key: "Pipeline value", label: "Pipeline value (\u00A510k)" },
        ]} xKey="month" height={240}/>
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <Heading level={3} size="base">
              New customers by channel
            </Heading>
          </CardHeader>
          <CardBody className="pt-0">
            <BarChart data={BAR_DATA} series={[{ key: "New", label: "New customers" }]} xKey="channel" height={240}/>
          </CardBody>
        </Card>
      </div>


      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="outline">
          <CardHeader>
            <Heading level={3} size="base">
              Pipeline by stage
            </Heading>
          </CardHeader>
          <CardBody className="pt-0">
            <PieChart data={PIE_DATA} donut height={240}/>
          </CardBody>
        </Card>


        <Card variant="outline" className="lg:col-span-2">
          <CardHeader>
            <Heading level={3} size="base">
              Sales by representative this month
            </Heading>
          </CardHeader>
          <CardBody className="pt-0">
            <BarChart data={[
            { name: "Lin Wanqing", "Closed deals": 58 },
            { name: "Zhou Mingyuan", "Closed deals": 47 },
            { name: "Gao Min", "Closed deals": 35 },
            { name: "Chen Ce", "Closed deals": 62 },
            { name: "Su Xiao", "Closed deals": 22 },
        ]} series={[{ key: "Closed deals", label: "Revenue (\u00A510k)" }]} xKey="name" height={240}/>
          </CardBody>
        </Card>
      </div>
    </div>);
}
