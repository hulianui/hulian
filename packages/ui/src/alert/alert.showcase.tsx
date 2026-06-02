"use client";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Alert } from "./alert";

// showcase 内联三个极简图标（零依赖），按 tone 取用。
const InfoIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
      clipRule="evenodd"
    />
  </svg>
);
const DangerIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);
const iconByTone: Record<string, ReactNode> = {
  info: InfoIcon,
  danger: DangerIcon,
  neutral: InfoIcon,
};

export const alertShowcase: ShowcaseSpec = {
  controls: [
    { prop: "tone", type: "select", options: ["info", "danger", "neutral"], defaultValue: "info" },
    { prop: "variant", type: "select", options: ["soft", "outline"], defaultValue: "soft" },
    { prop: "title", type: "text", defaultValue: "提示", label: "标题" },
    { prop: "description", type: "text", defaultValue: "这是一条提示信息。", label: "正文" },
    { prop: "withIcon", type: "boolean", defaultValue: true, label: "显示图标" },
  ],
  states: [
    {
      name: "info / soft",
      render: () => (
        <Alert icon={InfoIcon} title="信息提示" className="w-80">
          这是一条普通信息提示。
        </Alert>
      ),
    },
    {
      name: "danger / soft",
      render: () => (
        <Alert tone="danger" icon={DangerIcon} title="出错了" className="w-80">
          表单提交失败，请检查后重试。
        </Alert>
      ),
    },
    {
      name: "neutral / soft",
      render: () => (
        <Alert tone="neutral" title="中性提示" className="w-80">
          这是一条中性背景的提示。
        </Alert>
      ),
    },
    {
      name: "info / outline",
      render: () => (
        <Alert variant="outline" icon={InfoIcon} title="描边信息" className="w-80">
          描边变体，透明底靠边框划界。
        </Alert>
      ),
    },
    {
      name: "danger / outline",
      render: () => (
        <Alert variant="outline" tone="danger" icon={DangerIcon} title="描边错误" className="w-80">
          描边错误态。
        </Alert>
      ),
    },
    {
      name: "仅正文（无 title 无 icon）",
      render: () => <Alert className="w-80">只有一行正文的精简提示。</Alert>,
    },
    {
      name: "仅 title + icon（无正文）",
      render: () => <Alert icon={InfoIcon} title="只有标题的提示" className="w-80" />,
    },
  ],
  renderWithProps: (p) => (
    <Alert
      tone={p.tone as "info" | "danger" | "neutral"}
      variant={p.variant as "soft" | "outline"}
      icon={p.withIcon ? iconByTone[p.tone as string] : undefined}
      title={(p.title as string) || undefined}
      className="w-80"
    >
      {(p.description as string) || undefined}
    </Alert>
  ),
  toCode: (p) =>
    `<Alert tone="${p.tone}" variant="${p.variant}"${p.withIcon ? " icon={<Icon />}" : ""}${
      p.title ? ` title="${p.title}"` : ""
    }>${p.description ?? ""}</Alert>`,
};
