"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SwipeAction } from "./swipe-action";

function Row() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border">
      <SwipeAction
        left={[{ key: "read", label: "标记已读", tone: "primary" }]}
        right={[
          { key: "top", label: "置顶", tone: "warning" },
          { key: "del", label: "删除", tone: "danger" },
        ]}
      >
        <div className="flex items-center justify-between bg-surface px-4 py-3">
          <span className="text-sm text-foreground">会话项 · 左右滑动试试</span>
          <span className="text-xs text-muted">14:32</span>
        </div>
      </SwipeAction>
    </div>
  );
}

export const swipeActionShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "左/右双向动作", render: () => <Row /> }],
  renderWithProps: () => <Row />,
  toCode: () =>
    `<SwipeAction\n  left={[{ key: "read", label: "已读", tone: "primary" }]}\n  right={[{ key: "del", label: "删除", tone: "danger" }]}\n>\n  <Row />\n</SwipeAction>`,
};
