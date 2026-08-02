"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PricingTable } from "../../../../packages/ui/src/pricing-table/pricing-table";
import type { PricingColumn, PricingRow } from "../../../../packages/ui/src/pricing-table/pricing-table.types";
const columns: PricingColumn[] = [
    { key: "gpt", title: "GPT-5.5" },
    { key: "opus", title: "Claude Opus 4.7", highlight: true, badge: "Recommended" },
    { key: "deepseek", title: "DeepSeek V4" },
];
const plainColumns: PricingColumn[] = [
    { key: "gpt", title: "GPT-5.5" },
    { key: "opus", title: "Claude Opus 4.7" },
    { key: "deepseek", title: "DeepSeek V4" },
];
const rows: PricingRow[] = [
    { key: "in", label: "Input price / 1M", values: { gpt: "$5.00", opus: "$5.00", deepseek: "$0.55" } },
    { key: "out", label: "Output price / 1M", values: { gpt: "$30.00", opus: "$25.00", deepseek: "$2.20" } },
    { key: "ctx", label: "Context Window", values: { gpt: "256K", opus: "200K", deepseek: "128K" } },
    { key: "vision", label: "Vision", values: { gpt: "\u2713", opus: "\u2713", deepseek: "\u2014" } },
    { key: "reason", label: "Reasoning", values: { gpt: "\u2713", opus: "\u2713", deepseek: "\u2713" } },
];
export const pricingTableShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "columns is the compared item (column), rows is the attribute row; the key of row.values corresponds to column.key.",
            code: `const columns = [
  { key: "gpt", title: "GPT-5.5" },
  { key: "opus", title: "Claude Opus 4.7" },
  { key: "deepseek", title: "DeepSeek V4" },
];
const rows = [
  { key: "in", label: "Input price / 1M", values: { gpt: "$5.00", opus: "$5.00", deepseek: "$0.55" } },
  { key: "out", label: "Output price / 1M", values: { gpt: "$30.00", opus: "$25.00", deepseek: "$2.20" } },
  { key: "ctx", label: "Context Window", values: { gpt: "256K", opus: "200K", deepseek: "128K" } },
];

<PricingTable columns={columns} rows={rows} />`,
            render: () => (<div className="w-full max-w-2xl">
          <PricingTable columns={plainColumns} rows={rows}/>
        </div>),
        },
        {
            title: "Highlight recommended column",
            description: "Add highlight stroke to highlight the column, and badge hang the corner mark at the column head.",
            code: `const columns = [
  { key: "gpt", title: "GPT-5.5" },
  { key: "opus", title: "Claude Opus 4.7", highlight: true, badge: "Recommended" },
  { key: "deepseek", title: "DeepSeek V4" },
];

<PricingTable columns={columns} rows={rows} />`,
            render: () => (<div className="w-full max-w-2xl">
          <PricingTable columns={columns} rows={rows}/>
        </div>),
        },
    ],
    controls: [{ prop: "stickyHeader", type: "boolean", defaultValue: true, label: "Meter head ceiling" }],
    states: [
        {
            name: "Model pricing comparison",
            render: () => (<div className="w-full max-w-2xl">
          <PricingTable columns={columns} rows={rows}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-full max-w-2xl">
      <PricingTable columns={columns} rows={rows} stickyHeader={p.stickyHeader as boolean}/>
    </div>),
    toCode: () => `<PricingTable columns={columns} rows={rows} />`,
};
