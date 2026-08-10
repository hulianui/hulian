import type { ShowcaseSpec } from "../showcase/types";
import { Sparkline } from "./sparkline";
import type { SparklineVariant } from "./sparkline.types";

const series = [4, 6, 5, 8, 7, 10, 9, 12, 11, 14];
const dipSeries = [12, 10, 11, 8, 9, 6, 7, 5, 6, 4];

interface Row {
  name: string;
  value: string;
  trend: number[];
  tone: string;
  up: boolean;
}

const rows: Row[] = [
  { name: "请求量 QPS", value: "1,284", trend: [8, 9, 7, 11, 10, 13, 12, 15], tone: "var(--color-primary)", up: true },
  { name: "平均时延 ms", value: "62", trend: [80, 78, 74, 70, 66, 64, 63, 62], tone: "var(--color-chart-2)", up: false },
  { name: "错误率 ‰", value: "0.4", trend: [2, 1.5, 1.8, 1.2, 0.9, 0.6, 0.5, 0.4], tone: "var(--color-danger)", up: false },
  { name: "Token 消耗", value: "3.2M", trend: [1, 1.4, 1.2, 2, 2.6, 2.4, 3, 3.2], tone: "var(--color-chart-4)", up: true },
];

function InlineTable() {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-subtle text-left text-muted-foreground">
            <th className="px-4 py-2 font-medium">指标</th>
            <th className="px-4 py-2 font-medium">当前</th>
            <th className="px-4 py-2 font-medium">近 8 周期趋势</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 text-foreground">{r.name}</td>
              <td className="px-4 py-2.5 font-medium tabular-nums text-foreground">{r.value}</td>
              <td className="px-4 py-2.5">
                <Sparkline
                  data={r.trend}
                  variant="line"
                  tone={r.tone}
                  highlightLast
                  width={96}
                  height={22}
                  renderTooltip={(v, i) => `第 ${i + 1} 周期：${v}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const sparklineShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "折线（基础用法）",
      description: "默认 line 形态，data 传纯数字序列即可，零依赖纯 SVG。",
      code: `<Sparkline data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 14]} />`,
      render: () => <Sparkline data={series} width={140} height={36} />,
    },
    {
      title: "强调末点",
      description: "highlightLast 在末点画强调圆点，突出最新值。",
      code: `<Sparkline
  data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 14]}
  highlightLast
  width={140}
  height={36}
/>`,
      render: () => (
        <Sparkline data={series} highlightLast width={140} height={36} />
      ),
    },
    {
      title: "形态：面积 / 柱",
      description: "variant 切换 line / area / bar；tone 吃语义色或 token 变量。",
      code: `<>
  <Sparkline data={series} variant="area" tone="var(--color-chart-2)" width={140} height={36} />
  <Sparkline data={dipSeries} variant="bar" tone="var(--color-chart-4)" width={140} height={36} />
</>`,
      render: () => (
        <div className="flex items-center gap-6">
          <Sparkline
            data={series}
            variant="area"
            tone="var(--color-chart-2)"
            width={140}
            height={36}
          />
          <Sparkline
            data={dipSeries}
            variant="bar"
            tone="var(--color-chart-4)"
            width={140}
            height={36}
          />
        </div>
      ),
    },
    {
      title: "表格内联",
      description:
        "每行一条趋势，配 renderTooltip（原生 <title>，零 JS、RSC 安全）做逐点说明。",
      code: `<Sparkline
  data={row.trend}
  variant="line"
  tone={row.tone}
  highlightLast
  width={96}
  height={22}
  renderTooltip={(v, i) => \`第 \${i + 1} 周期：\${v}\`}
/>`,
      render: () => <InlineTable />,
    },
  ],
  controls: [
    {
      prop: "variant",
      type: "select",
      options: ["line", "area", "bar"],
      defaultValue: "line",
      label: "形态",
    },
    { prop: "highlightLast", type: "boolean", defaultValue: true, label: "强调末点" },
    { prop: "width", type: "number", defaultValue: 120, label: "宽" },
    { prop: "height", type: "number", defaultValue: 32, label: "高" },
  ],
  states: [
    {
      name: "Line（折线 · 强调末点）",
      render: () => (
        <Sparkline data={series} variant="line" highlightLast width={140} height={36} />
      ),
    },
    {
      name: "Area（面积渐隐填充）",
      render: () => (
        <Sparkline data={series} variant="area" tone="var(--color-chart-2)" width={140} height={36} />
      ),
    },
    {
      name: "Bar（等宽柱 · 下行趋势）",
      render: () => (
        <Sparkline data={dipSeries} variant="bar" tone="var(--color-chart-4)" width={140} height={36} />
      ),
    },
    {
      name: "表格内联（每行一条趋势 · 原生逐点 tooltip）",
      render: () => <InlineTable />,
    },
  ],
  renderWithProps: (p) => (
    <Sparkline
      data={series}
      variant={(p.variant as SparklineVariant) ?? "line"}
      highlightLast={p.highlightLast as boolean}
      width={p.width as number}
      height={p.height as number}
    />
  ),
  toCode: (p) =>
    `<Sparkline
  data={[4, 6, 5, 8, 7, 10, 9, 12]}
  variant="${(p.variant as string) ?? "line"}"${p.highlightLast ? "\n  highlightLast" : ""}
  width={${p.width ?? 120}}
  height={${p.height ?? 32}}
/>`,
};
