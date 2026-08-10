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
          <span className="text-xs text-muted-foreground">14:32</span>
        </div>
      </SwipeAction>
    </div>
  );
}

export const swipeActionShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "右滑删除",
      description: "right 数组定义右侧动作（内容左移露出），tone 决定背景色调。",
      code: `<SwipeAction right={[{ key: "del", label: "删除", tone: "danger" }]}>
  <div className="bg-surface px-4 py-3">会话项 · 向左滑动试试</div>
</SwipeAction>`,
      render: () => (
        <div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border">
          <SwipeAction right={[{ key: "del", label: "删除", tone: "danger" }]}>
            <div className="bg-surface px-4 py-3 text-sm text-foreground">会话项 · 向左滑动试试</div>
          </SwipeAction>
        </div>
      ),
    },
    {
      title: "左右双向动作",
      description: "left / right 同时配置；每侧可多个按钮，依次排开。",
      code: `<SwipeAction
  left={[{ key: "read", label: "标记已读", tone: "primary" }]}
  right={[
    { key: "top", label: "置顶", tone: "warning" },
    { key: "del", label: "删除", tone: "danger" },
  ]}
>
  <Row />
</SwipeAction>`,
      render: () => <Row />,
    },
    {
      title: "色调变体",
      description: "tone 支持 default / primary / success / warning / danger。",
      code: `<SwipeAction
  right={[
    { key: "ok", label: "完成", tone: "success" },
    { key: "more", label: "更多", tone: "default" },
  ]}
>
  <div className="bg-surface px-4 py-3">多色动作</div>
</SwipeAction>`,
      render: () => (
        <div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border">
          <SwipeAction
            right={[
              { key: "ok", label: "完成", tone: "success" },
              { key: "more", label: "更多", tone: "default" },
            ]}
          >
            <div className="bg-surface px-4 py-3 text-sm text-foreground">多色动作 · 向左滑动</div>
          </SwipeAction>
        </div>
      ),
    },
  ],
  controls: [],
  states: [{ name: "左/右双向动作", render: () => <Row /> }],
  renderWithProps: () => <Row />,
  toCode: () =>
    `<SwipeAction\n  left={[{ key: "read", label: "已读", tone: "primary" }]}\n  right={[{ key: "del", label: "删除", tone: "danger" }]}\n>\n  <Row />\n</SwipeAction>`,
};
