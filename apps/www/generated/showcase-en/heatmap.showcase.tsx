"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Heatmap } from "../../../../packages/ui/src/heatmap/heatmap";
import type { HeatCell } from "../../../../packages/ui/src/heatmap/heatmap.matrix";
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MODULES = ["Login", "Payment", "Order", "Search", "Push"];
const moduleData: HeatCell[] = MODULES.flatMap((m, mi) => WEEKDAYS.map((d, di) => ({ x: d, y: m, value: ((mi * 7 + di * 3 + 2) % 10) })));
const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
const contribData: HeatCell[] = ["1", "2", "Three", "Four", "Five", "Six", "Day"].flatMap((day, dy) => weeks.map((w, wi) => ({ x: w, y: day, value: ((dy * 5 + wi * 7) % 9) })));
const TOPICS = ["Rational numbers", "Integer", "Equation", "Function", "Geometry"];
const CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4"];
const masteryData: HeatCell[] = CLASSES.flatMap((c, ci) => TOPICS.map((t, ti) => ({ x: t, y: c, value: 0.5 + (((ci * 5 + ti * 3) % 8) / 20) })));
const masterySparse: HeatCell[] = masteryData
    .filter((c) => !(c.y === "Class 3" && (c.x === "Function" || c.x === "Geometry")))
    .map((c) => (c.y === "Class 4" && c.x === "Equation" ? { ...c, value: 0 } : c));
const EMPTY_TONE = "repeating-linear-gradient(45deg, var(--color-border) 0 2px, transparent 2px 4px)";
export const heatmapShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass the sparse point set data + row and column labels, and automatically map to the main color transparency file by value.",
            code: `<Heatmap data={data} xLabels={WEEKDAYS} yLabels={MODULES} cellSize={18} />`,
            render: () => <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} cellSize={18}/>,
        },
        {
            title: "Contribution Activity Diagram",
            description: "GitHub-style 12-week activity heat with the grid turned down for a more compact fit.",
            code: `<Heatmap
  data={contribData}
  xLabels={weeks}
  yLabels={["1", "2", "Three", "Four", "Five", "Six", "Day"]}
  cellSize={14}
/>`,
            render: () => (<Heatmap data={contribData} xLabels={weeks} yLabels={["1", "2", "Three", "Four", "Five", "Six", "Day"]} cellSize={14}/>),
        },
        {
            title: "Number of color levels",
            description: "colorScale controls the color level binning. The more bales there are, the more delicate the transition will be.",
            code: `<Heatmap data={data} xLabels={WEEKDAYS} yLabels={MODULES} colorScale={9} />`,
            render: () => <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} colorScale={9}/>,
        },
        {
            title: "Label-less compact",
            description: "showLabels={false} hides row and column labels, suitable for putting into cards as thumbnails.",
            code: `<Heatmap data={data} xLabels={WEEKDAYS} yLabels={MODULES} showLabels={false} cellSize={12} />`,
            render: () => (<Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} showLabels={false} cellSize={12}/>),
        },
        {
            title: "Decimal Value Field / Percent + Legend",
            description: "The ratio data (0\u20131) passed to domain tightens the value range and fills the color scale; valueFormat makes tooltip and the legend automatically add %; showLegend displays the color scale legend.",
            code: `<Heatmap
  data={masteryData} // value is a mastery rate of 0.5~0.85
  xLabels={TOPICS}
  yLabels={CLASSES}
  domain={[0.5, 0.9]} // Binning according to the proportion of the value range, the low range can also be filled with color levels
  valueFormat={(v) => \`\${Math.round(v * 100)}%\`}
  showLegend
  cellSize={18}
/>`,
            render: () => (<Heatmap data={masteryData} xLabels={TOPICS} yLabels={CLASSES} domain={[0.5, 0.9]} valueFormat={(v) => `${Math.round(v * 100)}%`} showLegend cellSize={18}/>),
        },
        {
            title: "No data vs value is 0",
            description: "The absent cell (there is no such point in data) defaults to the same color as the 0 level; pass emptyCellTone and paint it in an independent style to separate it from the \"real 0\". The legend will automatically fill in a \"no data\" sample.",
            code: `<Heatmap
  data={masterySparse} // The function/geometric grid of class 3 is absent, the equation of class 4 is real 0
  xLabels={TOPICS}
  yLabels={CLASSES}
  domain={[0, 1]}
  valueFormat={(v) => \`\${Math.round(v * 100)}%\`}
  emptyCellTone="repeating-linear-gradient(45deg, var(--color-border) 0 2px, transparent 2px 4px)"
  showLegend
  formatTooltip={(c) => (c.empty ? \`\${c.y} \u00B7 \${c.x}: Not answered\` : \`\${c.y} \u00B7 \${c.x}: \${Math.round(c.value * 100)}%\`)}
/>`,
            render: () => (<Heatmap data={masterySparse} xLabels={TOPICS} yLabels={CLASSES} domain={[0, 1]} valueFormat={(v) => `${Math.round(v * 100)}%`} emptyCellTone={EMPTY_TONE} showLegend cellSize={18} formatTooltip={(c) => c.empty ? `${c.y} \u00B7 ${c.x}: No answer` : `${c.y} \u00B7 ${c.x}:${Math.round(c.value * 100)}%`}/>),
        },
        {
            title: "Custom prompt + drill down",
            description: "formatTooltip Customize the hover copy; after passing onCellClick, the grid becomes a clickable button.",
            code: `<Heatmap
  data={data}
  xLabels={WEEKDAYS}
  yLabels={MODULES}
  formatTooltip={(c) => \`\${c.y} in \${c.x}: \${c.value} questions\`}
  onCellClick={(c) => alert(\`\${c.y} \u00B7 \${c.x}\`)}
/>`,
            render: () => (<Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} cellSize={18} formatTooltip={(c) => `${c.y} in ${c.x}:${c.value} questions`} onCellClick={() => { }}/>),
        },
    ],
    controls: [
        { prop: "colorScale", type: "number", defaultValue: 5, label: "Number of color levels" },
        { prop: "cellSize", type: "number", defaultValue: 16, label: "Grid side length" },
        { prop: "showLabels", type: "boolean", defaultValue: true, label: "Show label" },
    ],
    states: [
        {
            name: "Module \u00D7 Weekly Question Density",
            render: () => <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} cellSize={18}/>,
        },
        {
            name: "12 weeks of contribution activities",
            render: () => (<Heatmap data={contribData} xLabels={weeks} yLabels={["1", "2", "Three", "Four", "Five", "Six", "Day"]} cellSize={14}/>),
        },
        {
            name: "Label-less compact",
            render: () => <Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} showLabels={false} cellSize={12}/>,
        },
        {
            name: "Color absent cells (no data \u2260 0)",
            render: () => (<Heatmap data={masterySparse} xLabels={TOPICS} yLabels={CLASSES} domain={[0, 1]} valueFormat={(v) => `${Math.round(v * 100)}%`} emptyCellTone={EMPTY_TONE} showLegend cellSize={18}/>),
        },
        {
            name: "Mastery rate (decimal value field + % legend)",
            render: () => (<Heatmap data={masteryData} xLabels={TOPICS} yLabels={CLASSES} domain={[0.5, 0.9]} valueFormat={(v) => `${Math.round(v * 100)}%`} showLegend cellSize={18}/>),
        },
    ],
    renderWithProps: (p) => (<Heatmap data={moduleData} xLabels={WEEKDAYS} yLabels={MODULES} colorScale={Number(p.colorScale)} cellSize={Number(p.cellSize)} showLabels={p.showLabels as boolean}/>),
    toCode: (p) => `<Heatmap data={data} colorScale={${Number(p.colorScale)}} cellSize={${Number(p.cellSize)}}${p.showLabels ? "" : " showLabels={false}"} />`,
};
