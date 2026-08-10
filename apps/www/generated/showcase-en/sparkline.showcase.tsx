import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Sparkline } from "../../../../packages/ui/src/sparkline/sparkline";
import type { SparklineVariant } from "../../../../packages/ui/src/sparkline/sparkline.types";
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
    { name: "Request volume QPS", value: "1,284", trend: [8, 9, 7, 11, 10, 13, 12, 15], tone: "var(--color-primary)", up: true },
    { name: "Average delay ms", value: "62", trend: [80, 78, 74, 70, 66, 64, 63, 62], tone: "var(--color-chart-2)", up: false },
    { name: "Error rate \u2030", value: "0.4", trend: [2, 1.5, 1.8, 1.2, 0.9, 0.6, 0.5, 0.4], tone: "var(--color-danger)", up: false },
    { name: "Token consumption", value: "3.2M", trend: [1, 1.4, 1.2, 2, 2.6, 2.4, 3, 3.2], tone: "var(--color-chart-4)", up: true },
];
function InlineTable() {
    return (<div className="overflow-hidden rounded-[var(--radius)] border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-subtle text-left text-muted-foreground">
            <th className="px-4 py-2 font-medium">Indicators</th>
            <th className="px-4 py-2 font-medium">Current</th>
            <th className="px-4 py-2 font-medium">Recent 8 period trends</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (<tr key={r.name} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 text-foreground">{r.name}</td>
              <td className="px-4 py-2.5 font-medium tabular-nums text-foreground">{r.value}</td>
              <td className="px-4 py-2.5">
                <Sparkline data={r.trend} variant="line" tone={r.tone} highlightLast width={96} height={22} renderTooltip={(v, i) => `No. ${i + 1} Period:${v}`}/>
              </td>
            </tr>))}
        </tbody>
      </table>
    </div>);
}
export const sparklineShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Polyline (basic usage)",
            description: "The default form is line. data can be passed as a pure digital sequence, with zero dependency on pure SVG.",
            code: `<Sparkline data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 14]} />`,
            render: () => <Sparkline data={series} width={140} height={36}/>,
        },
        {
            title: "Emphasize the last point",
            description: "highlightLast Draw an emphasis dot at the last point to highlight the latest value.",
            code: `<Sparkline
  data={[4, 6, 5, 8, 7, 10, 9, 12, 11, 14]}
  highlightLast
  width={140}
  height={36}
/>`,
            render: () => (<Sparkline data={series} highlightLast width={140} height={36}/>),
        },
        {
            title: "Form: Area / Column",
            description: "variant switches line / area / bar; tone eats semantic colors or token variables.",
            code: `<>
  <Sparkline data={series} variant="area" tone="var(--color-chart-2)" width={140} height={36} />
  <Sparkline data={dipSeries} variant="bar" tone="var(--color-chart-4)" width={140} height={36} />
</>`,
            render: () => (<div className="flex items-center gap-6">
          <Sparkline data={series} variant="area" tone="var(--color-chart-2)" width={140} height={36}/>
          <Sparkline data={dipSeries} variant="bar" tone="var(--color-chart-4)" width={140} height={36}/>
        </div>),
        },
        {
            title: "Inline in table",
            description: "One trend per line, with renderTooltip (native <title>, zero JS, RSC safe) for point-by-point explanation.",
            code: `<Sparkline
  data={row.trend}
  variant="line"
  tone={row.tone}
  highlightLast
  width={96}
  height={22}
  renderTooltip={(v, i) => \`\${i + 1} period: \${v}\`}
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
            label: "Form",
        },
        { prop: "highlightLast", type: "boolean", defaultValue: true, label: "Emphasize the last point" },
        { prop: "width", type: "number", defaultValue: 120, label: "Wide" },
        { prop: "height", type: "number", defaultValue: 32, label: "High" },
    ],
    states: [
        {
            name: "Line (polyline\u00B7emphasis on the end point)",
            render: () => (<Sparkline data={series} variant="line" highlightLast width={140} height={36}/>),
        },
        {
            name: "Area (area fade fill)",
            render: () => (<Sparkline data={series} variant="area" tone="var(--color-chart-2)" width={140} height={36}/>),
        },
        {
            name: "Bar (Constant width bar \u00B7 Downtrend)",
            render: () => (<Sparkline data={dipSeries} variant="bar" tone="var(--color-chart-4)" width={140} height={36}/>),
        },
        {
            name: "Table inline (one trend per row \u00B7 native point-by-point tooltip)",
            render: () => <InlineTable />,
        },
    ],
    renderWithProps: (p) => (<Sparkline data={series} variant={(p.variant as SparklineVariant) ?? "line"} highlightLast={p.highlightLast as boolean} width={p.width as number} height={p.height as number}/>),
    toCode: (p) => `<Sparkline
  data={[4, 6, 5, 8, 7, 10, 9, 12]}
  variant="${(p.variant as string) ?? "line"}"${p.highlightLast ? "\n  highlightLast" : ""}
  width={${p.width ?? 120}}
  height={${p.height ?? 32}}
/>`,
};
