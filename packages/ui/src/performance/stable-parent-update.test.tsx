import type { ReactElement } from "react";
import { describe, it } from "vitest";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";
import { Cascader } from "../cascader/cascader";
import { Calendar } from "../calendar/calendar";
import { Checkbox } from "../checkbox/checkbox";
import { CodeReviewThread } from "../code-review-thread/code-review-thread";
import type { ReviewComment } from "../code-review-thread/code-review-thread.types";
import { CodeDiff } from "../code-diff/code-diff";
import { ColorSwatchPicker } from "../color-swatch-picker/color-swatch-picker";
import { Gantt } from "../gantt/gantt";
import type { GanttTask } from "../gantt/gantt.types";
import { Glimpse } from "../glimpse/glimpse";
import { Markdown } from "../markdown/markdown";
import { PricingTable } from "../pricing-table/pricing-table";
import type { PricingColumn, PricingRow } from "../pricing-table/pricing-table.types";
import { TreeSelect } from "../tree-select/tree-select";
import type { TreeNode } from "../tree/tree-core";

const NODES: TreeNode[] = [
  {
    key: "zhejiang",
    label: "浙江",
    children: [{ key: "hangzhou", label: "杭州" }],
  },
  { key: "jiangsu", label: "江苏" },
];
const COLORS = ["#ef4444", "#3b82f6", "#22c55e"];
const COMMENTS: ReviewComment[] = [
  {
    id: "review-1",
    author: { name: "Hulian Scan", kind: "ai" },
    body: "稳定父更新不应重建评论线程。",
    severity: "major",
  },
];
const TASKS: GanttTask[] = [
  { id: "plan", name: "性能治理", start: "2026-08-01", end: "2026-08-05", progress: 60 },
];
const PRICING_COLUMNS: PricingColumn[] = [{ key: "fast", title: "优化后" }];
const PRICING_ROWS: PricingRow[] = [
  { key: "render", label: "渲染", values: { fast: "更快" } },
];
const MARKDOWN = "## Hulian Scan\n\n稳定父更新不应重复解析 **Markdown**。";

const cases: Array<[string, () => ReactElement]> = [
  ["Glimpse", () => <Glimpse title="性能预览">稳定链接</Glimpse>],
  ["TreeSelect", () => <TreeSelect nodes={NODES} />],
  ["Cascader", () => <Cascader nodes={NODES} />],
  ["ColorSwatchPicker", () => <ColorSwatchPicker colors={COLORS} />],
  ["Calendar", () => <Calendar defaultMonth="2026-08-01" />],
  ["Checkbox", () => <Checkbox label="稳定选项" />],
  ["CodeReviewThread", () => <CodeReviewThread comments={COMMENTS} />],
  ["CodeDiff", () => <CodeDiff oldText="slow" newText="fast" />],
  ["Gantt", () => <Gantt tasks={TASKS} unit="week" />],
  ["Markdown", () => <Markdown>{MARKDOWN}</Markdown>],
  ["PricingTable", () => <PricingTable columns={PRICING_COLUMNS} rows={PRICING_ROWS} />],
];

describe("高开销组件的稳定父更新", () => {
  it.each(cases)("%s 跳过内部子树", async (_name, renderComponent) => {
    await expectMemoSkipsSubtree(renderComponent);
  });
});
