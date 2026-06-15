"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { CodeReviewThread } from "./code-review-thread";
import type { ReviewComment } from "./code-review-thread.types";

const aiCritical: ReviewComment[] = [
  {
    id: "c1",
    author: { name: "AI 审查官", kind: "ai" },
    severity: "critical",
    body: "未对 user 可能为 null 的情况做防御，直接解引用会在登出态崩溃。",
    time: "刚刚",
    suggestion: { oldText: "const name = user.profile.name;", newText: "const name = user?.profile?.name ?? \"\";" },
  },
];

const conversation: ReviewComment[] = [
  {
    id: "c1",
    author: { name: "AI 审查官", kind: "ai" },
    severity: "major",
    body: "这个循环在 O(n²)，列表大时会卡。",
    time: "2 分钟前",
  },
  { id: "c2", author: { name: "林开发", kind: "human" }, body: "数据量上限 50，先这样吧。", time: "1 分钟前" },
  { id: "c3", author: { name: "AI 审查官", kind: "ai" }, severity: "minor", body: "那加个注释说明上限假设。", time: "刚刚" },
];

export const codeReviewThreadShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "AI 严重批注 + 建议",
      description: "comment 带 severity 渲染左侧色条；suggestion 内嵌建议 diff + 采纳按钮。",
      code: `<CodeReviewThread comments={comments} />`,
      render: () => <CodeReviewThread comments={aiCritical} />,
    },
    {
      title: "多轮对话",
      description: "comments 顺序渲染为 AI 与人类交替的评论线程。",
      code: `<CodeReviewThread comments={comments} />`,
      render: () => <CodeReviewThread comments={conversation} />,
    },
    {
      title: "已解决态",
      description: "传 status=\"resolved\" 受控展示已解决标签（不传则内部自管）。",
      code: `<CodeReviewThread comments={comments} status="resolved" />`,
      render: () => <CodeReviewThread comments={aiCritical} status="resolved" />,
    },
    {
      title: "默认折叠",
      description: "defaultCollapsed 让线程初始收起，只露标题摘要，点击展开。",
      code: `<CodeReviewThread comments={comments} defaultCollapsed />`,
      render: () => <CodeReviewThread comments={conversation} defaultCollapsed />,
    },
    {
      title: "禁用回复",
      description: "replyable={false} 隐藏底部回复框，做只读展示。",
      code: `<CodeReviewThread comments={comments} replyable={false} />`,
      render: () => <CodeReviewThread comments={aiCritical} replyable={false} />,
    },
  ],
  controls: [
    { prop: "replyable", type: "boolean", defaultValue: true, label: "可回复" },
    { prop: "defaultCollapsed", type: "boolean", defaultValue: false, label: "默认折叠" },
  ],
  states: [
    { name: "AI 严重批注 + 建议", render: () => <CodeReviewThread comments={aiCritical} /> },
    { name: "多轮对话", render: () => <CodeReviewThread comments={conversation} /> },
    { name: "已解决态", render: () => <CodeReviewThread comments={aiCritical} status="resolved" /> },
    { name: "折叠态", render: () => <CodeReviewThread comments={conversation} defaultCollapsed /> },
  ],
  renderWithProps: (p) => (
    <CodeReviewThread
      comments={aiCritical}
      replyable={p.replyable as boolean}
      defaultCollapsed={p.defaultCollapsed as boolean}
    />
  ),
  toCode: (p) =>
    `<CodeReviewThread comments={comments}${p.replyable ? "" : " replyable={false}"}${p.defaultCollapsed ? " defaultCollapsed" : ""} />`,
};
