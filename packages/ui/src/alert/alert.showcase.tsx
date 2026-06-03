"use client";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Alert } from "./alert";
import { Button } from "../button";
import { Spinner } from "../spinner";

// showcase 内联极简图标（零依赖），按 tone 取用。
const InfoIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
      clipRule="evenodd"
    />
  </svg>
);
const SuccessIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);
const WarningIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);
const DangerIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 5a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 9a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

type Tone = "neutral" | "info" | "success" | "warning" | "danger";
const iconByTone: Record<Tone, ReactNode> = {
  neutral: InfoIcon,
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};

export const alertShowcase: ShowcaseSpec = {
  controls: [
    { prop: "tone", type: "select", options: ["neutral", "info", "success", "warning", "danger"], defaultValue: "info" },
    { prop: "variant", type: "select", options: ["soft", "outline"], defaultValue: "soft" },
    { prop: "title", type: "text", defaultValue: "提示标题", label: "标题" },
    { prop: "description", type: "text", defaultValue: "这是一条提示信息。", label: "正文" },
    { prop: "withIcon", type: "boolean", defaultValue: true, label: "显示图标" },
    { prop: "withAction", type: "boolean", defaultValue: false, label: "动作按钮" },
    { prop: "dismissible", type: "boolean", defaultValue: false, label: "可关闭" },
  ],
  states: [
    {
      name: "五语气一览",
      render: () => (
        <div className="flex w-96 flex-col gap-3">
          <Alert tone="neutral" icon={InfoIcon} title="中性提示">
            这是一条中性背景的提示。
          </Alert>
          <Alert tone="info" icon={InfoIcon} title="信息提示">
            这是一条普通信息提示。
          </Alert>
          <Alert tone="success" icon={SuccessIcon} title="操作成功">
            个人资料已保存。
          </Alert>
          <Alert tone="warning" icon={WarningIcon} title="计划内维护">
            服务将于周日 02:00–06:00 不可用。
          </Alert>
          <Alert tone="danger" icon={DangerIcon} title="无法连接服务器">
            出现连接问题，请稍后重试。
          </Alert>
        </div>
      ),
    },
    {
      name: "带动作按钮",
      render: () => (
        <div className="flex w-96 flex-col gap-3">
          <Alert tone="info" icon={InfoIcon} title="有可用更新" action={<Button size="sm">刷新</Button>}>
            应用有新版本，请刷新以获取最新功能。
          </Alert>
          <Alert
            tone="danger"
            icon={DangerIcon}
            title="无法连接服务器"
            action={
              <Button size="sm" tone="danger">
                重试
              </Button>
            }
          >
            出现连接问题，请稍后重试。
          </Alert>
        </div>
      ),
    },
    {
      name: "可关闭",
      render: () => (
        <Alert tone="success" icon={SuccessIcon} title="个人资料更新成功" onClose={() => {}} className="w-96" />
      ),
    },
    {
      name: "加载态",
      render: () => (
        <Alert tone="info" icon={<Spinner size="sm" />} title="正在处理你的请求" className="w-96">
          正在同步数据，请稍候……
        </Alert>
      ),
    },
    {
      name: "富正文（列表）",
      render: () => (
        <Alert tone="danger" icon={DangerIcon} title="无法连接服务器" className="w-96">
          出现连接问题，请尝试以下操作：
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            <li>检查网络连接</li>
            <li>刷新页面</li>
            <li>清除浏览器缓存</li>
          </ul>
        </Alert>
      ),
    },
    {
      name: "描边变体",
      render: () => (
        <div className="flex w-96 flex-col gap-3">
          <Alert variant="outline" tone="info" icon={InfoIcon} title="描边信息">
            透明底靠边框划界。
          </Alert>
          <Alert variant="outline" tone="warning" icon={WarningIcon} title="描边警告">
            描边警告态。
          </Alert>
        </div>
      ),
    },
    {
      name: "仅正文（无 title 无 icon）",
      render: () => <Alert className="w-96">只有一行正文的精简提示。</Alert>,
    },
  ],
  renderWithProps: (p) => {
    const tone = p.tone as Tone;
    return (
      <Alert
        tone={tone}
        variant={p.variant as "soft" | "outline"}
        icon={p.withIcon ? iconByTone[tone] : undefined}
        title={(p.title as string) || undefined}
        action={
          p.withAction ? (
            <Button size="sm" tone={tone === "danger" ? "danger" : "brand"}>
              操作
            </Button>
          ) : undefined
        }
        onClose={p.dismissible ? () => {} : undefined}
        className="w-96"
      >
        {(p.description as string) || undefined}
      </Alert>
    );
  },
  toCode: (p) =>
    `<Alert tone="${p.tone}" variant="${p.variant}"${p.withIcon ? " icon={<Icon />}" : ""}${
      p.title ? ` title="${p.title}"` : ""
    }${p.withAction ? ' action={<Button size="sm">操作</Button>}' : ""}${
      p.dismissible ? " onClose={() => {}}" : ""
    }>${p.description ?? ""}</Alert>`,
};
