"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { PricingTable } from "./pricing-table";
import type { PricingColumn, PricingRow } from "./pricing-table.types";

const columns: PricingColumn[] = [
  { key: "gpt", title: "GPT-5.5" },
  { key: "opus", title: "Claude Opus 4.7", highlight: true, badge: "推荐" },
  { key: "deepseek", title: "DeepSeek V4" },
];

const rows: PricingRow[] = [
  { key: "in", label: "输入价 / 1M", values: { gpt: "$5.00", opus: "$5.00", deepseek: "$0.55" } },
  { key: "out", label: "输出价 / 1M", values: { gpt: "$30.00", opus: "$25.00", deepseek: "$2.20" } },
  { key: "ctx", label: "上下文窗口", values: { gpt: "256K", opus: "200K", deepseek: "128K" } },
  { key: "vision", label: "视觉", values: { gpt: "✓", opus: "✓", deepseek: "—" } },
  { key: "reason", label: "推理", values: { gpt: "✓", opus: "✓", deepseek: "✓" } },
];

export const pricingTableShowcase: ShowcaseSpec = {
  controls: [{ prop: "stickyHeader", type: "boolean", defaultValue: true, label: "表头吸顶" }],
  states: [
    {
      name: "模型定价对比",
      render: () => (
        <div className="w-full max-w-2xl">
          <PricingTable columns={columns} rows={rows} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-full max-w-2xl">
      <PricingTable columns={columns} rows={rows} stickyHeader={p.stickyHeader as boolean} />
    </div>
  ),
  toCode: () => `<PricingTable columns={columns} rows={rows} />`,
};
