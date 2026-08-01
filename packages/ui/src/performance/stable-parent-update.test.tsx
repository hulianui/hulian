import { Profiler, type ReactElement } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Cascader } from "../cascader/cascader";
import { Calendar } from "../calendar/calendar";
import { Checkbox } from "../checkbox/checkbox";
import { CodeReviewThread } from "../code-review-thread/code-review-thread";
import type { ReviewComment } from "../code-review-thread/code-review-thread.types";
import { ColorSwatchPicker } from "../color-swatch-picker/color-swatch-picker";
import { Glimpse } from "../glimpse/glimpse";
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

const cases: Array<[string, () => ReactElement]> = [
  ["Glimpse", () => <Glimpse title="性能预览">稳定链接</Glimpse>],
  ["TreeSelect", () => <TreeSelect nodes={NODES} />],
  ["Cascader", () => <Cascader nodes={NODES} />],
  ["ColorSwatchPicker", () => <ColorSwatchPicker colors={COLORS} />],
  ["Calendar", () => <Calendar defaultMonth="2026-08-01" />],
  ["Checkbox", () => <Checkbox label="稳定选项" />],
  ["CodeReviewThread", () => <CodeReviewThread comments={COMMENTS} />],
];

describe("高开销组件的稳定父更新", () => {
  it.each(cases)("%s 跳过内部子树", async (name, renderComponent) => {
    const onRender = vi.fn();
    const { rerender } = render(
      <div data-parent-version="0">
        <Profiler id={name} onRender={onRender}>
          {renderComponent()}
        </Profiler>
      </div>,
    );
    await act(async () => undefined);
    onRender.mockClear();

    rerender(
      <div data-parent-version="1">
        <Profiler id={name} onRender={onRender}>
          {renderComponent()}
        </Profiler>
      </div>,
    );

    const update = onRender.mock.calls.at(-1);
    expect(update?.[1]).toBe("update");
    expect(update?.[2]).toBeLessThan(update?.[3] * 0.1);
  });
});
