"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Sparkline } from "../../../../packages/ui/src/sparkline";
import { Legend } from "../../../../packages/ui/src/legend/legend";
import type { LegendItem } from "../../../../packages/ui/src/legend/legend.types";
const base: LegendItem[] = [
    { id: "opened", label: "Opened" },
    { id: "closed", label: "Closed" },
    { id: "merged", label: "Merged" },
];
function Toggleable() {
    const [hidden, setHidden] = useState<Record<string, boolean>>({ merged: true });
    return (<Legend items={base.map((i) => ({ ...i, hidden: hidden[String(i.id)] }))} onItemClick={(item) => setHidden((h) => ({ ...h, [String(item.id)]: !h[String(item.id)] }))}/>);
}
export const legendShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Color point + series name, the default colors are chart-1..6 in order, which is the same set of token as Chart.",
            code: `<Legend items={[{ label: "Opened" }, { label: "Closed" }, { label: "Merged" }]} />`,
            render: () => <Legend items={base}/>,
        },
        {
            title: "With self-drawn graphics",
            description: "Legend of recharts cannot appear outside the picture - self-drawn Sparkline / Heatmap / Use this for the legend of the contribution wall.",
            code: `<div className="flex items-center justify-between">
  <Legend
    marker="line"
    items={[
      { label: "This week", color: "primary", value: "1.2k" },
      { label: "Last week", color: "muted", value: "980" },
    ]}
  />
  <Sparkline data={[3, 7, 4, 9, 6, 11, 8]} variant="bar" />
</div>`,
            render: () => (<div className="flex w-full max-w-md items-center justify-between gap-6 rounded-[var(--radius)] border border-border bg-surface px-4 py-3">
          <Legend marker="line" items={[
                    { label: "This week", color: "primary", value: "1.2k" },
                    { label: "Last week", color: "muted", value: "980" },
                ]}/>
          <Sparkline data={[3, 7, 4, 9, 6, 11, 8]} variant="bar"/>
        </div>),
        },
        {
            title: "Vertical arrangement \u00B7 With numerical value",
            description: "layout=\"column\" When value is automatically right-aligned, it fits the series table next to the pie chart.",
            code: `<Legend
  layout="column"
  marker="square"
  items={[
    { label: "Natural traffic", value: "48%" },
    { label: "Paid placement", value: "31%" },
    { label: "Private domain repurchase", value: "21%" },
  ]}
/>`,
            render: () => (<div className="w-56 rounded-[var(--radius)] border border-border bg-surface p-4">
          <Legend layout="column" marker="square" items={[
                    { label: "Natural traffic", value: "48%" },
                    { label: "Paid placement", value: "31%" },
                    { label: "Private domain repurchase", value: "21%" },
                ]}/>
        </div>),
        },
        {
            title: "Click to switch series",
            description: "After passing onItemClick, the entry becomes a button (aria-pressed expression switch); the visibility is controlled, and the state is held by the caller.",
            code: `const [hidden, setHidden] = useState<Record<string, boolean>>({ merged: true })

<Legend
  items={series.map((i) => ({ ...i, hidden: hidden[i.id] }))}
  onItemClick={(item) => setHidden((h) => ({ ...h, [item.id]: !h[item.id] }))}
/>`,
            render: () => <Toggleable />,
        },
    ],
    controls: [
        { prop: "marker", type: "select", options: ["dot", "square", "line"], defaultValue: "dot" },
        { prop: "layout", type: "select", options: ["row", "column"], defaultValue: "row" },
        { prop: "size", type: "select", options: ["md", "sm"], defaultValue: "md" },
    ],
    states: [
        { name: "Default (horizontal color dots)", render: () => <Legend items={base}/> },
        {
            name: "Three mark shapes",
            render: () => (<div className="flex flex-col gap-2">
          <Legend items={base} marker="dot"/>
          <Legend items={base} marker="square"/>
          <Legend items={base} marker="line"/>
        </div>),
        },
        {
            name: "Vertical arrangement \u00B7 With numerical value",
            render: () => (<div className="w-56">
          <Legend layout="column" marker="square" items={[
                    { label: "Natural traffic", value: "48%" },
                    { label: "Paid placement", value: "31%" },
                    { label: "Private domain repurchase", value: "21%" },
                ]}/>
        </div>),
        },
        { name: "Click to switch (the third item is closed)", render: () => <Toggleable /> },
    ],
    renderWithProps: (p) => (<div className={p.layout === "column" ? "w-48" : undefined}>
      <Legend items={base.map((i, idx) => ({ ...i, value: idx === 0 ? "42" : undefined }))} marker={(p.marker as "dot" | "square" | "line") ?? "dot"} layout={(p.layout as "row" | "column") ?? "row"} size={(p.size as "sm" | "md") ?? "md"}/>
    </div>),
    toCode: (p) => `<Legend
  items={[{ label: "Opened" }, { label: "Closed" }]}${p.marker && p.marker !== "dot" ? `
  marker="${p.marker}"` : ""}${p.layout === "column" ? "\n  layout=\"column\"" : ""}${p.size === "sm" ? "\n  size=\"sm\"" : ""}
/>`,
};
