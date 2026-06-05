"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { RelativeTime } from "./relative-time";

// 固定基准，保证文档静态示例可复现（不随渲染时刻漂移）。
const BASE = new Date("2026-06-05T12:00:00");
const ago = (sec: number) => new Date(BASE.getTime() - sec * 1000);
const after = (sec: number) => new Date(BASE.getTime() + sec * 1000);

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

export const relativeTimeShowcase: ShowcaseSpec = {
  controls: [{ prop: "locale", type: "select", options: ["zh", "en"], defaultValue: "zh" }],
  states: [
    {
      name: "过去（固定基准）",
      render: () => (
        <div className="w-72">
          <Row label="3 秒前"><RelativeTime value={ago(3)} base={BASE} /></Row>
          <Row label="45 秒前"><RelativeTime value={ago(45)} base={BASE} /></Row>
          <Row label="20 分钟前"><RelativeTime value={ago(20 * 60)} base={BASE} /></Row>
          <Row label="5 小时前"><RelativeTime value={ago(5 * 3600)} base={BASE} /></Row>
          <Row label="1 天前"><RelativeTime value={ago(86400 + 60)} base={BASE} /></Row>
          <Row label="8 天前"><RelativeTime value={ago(8 * 86400)} base={BASE} /></Row>
          <Row label="3 个月前"><RelativeTime value={ago(95 * 86400)} base={BASE} /></Row>
          <Row label="2 年前"><RelativeTime value={ago(800 * 86400)} base={BASE} /></Row>
        </div>
      ),
    },
    {
      name: "未来",
      render: () => (
        <div className="w-72">
          <Row label="10 分钟后"><RelativeTime value={after(10 * 60)} base={BASE} /></Row>
          <Row label="明天"><RelativeTime value={after(86400 + 60)} base={BASE} /></Row>
          <Row label="3 天后"><RelativeTime value={after(3 * 86400)} base={BASE} /></Row>
        </div>
      ),
    },
    {
      name: "英文 locale",
      render: () => (
        <div className="w-72">
          <Row label="5 分钟前"><RelativeTime value={ago(5 * 60)} base={BASE} locale="en" /></Row>
          <Row label="2 小时前"><RelativeTime value={ago(2 * 3600)} base={BASE} locale="en" /></Row>
          <Row label="in 5m"><RelativeTime value={after(5 * 60)} base={BASE} locale="en" /></Row>
        </div>
      ),
    },
    {
      name: "实时刷新（无 base · 每分钟自动更新）",
      render: () => (
        <p className="text-sm text-muted">
          发布于 <RelativeTime value={new Date(Date.now() - 90 * 1000)} className="text-foreground" />，悬停看绝对时间
        </p>
      ),
    },
  ],
  renderWithProps: (p) => <RelativeTime value={ago(20 * 60)} base={BASE} locale={(p.locale as "zh" | "en") ?? "zh"} />,
  toCode: (p) => `<RelativeTime value={publishedAt}${p.locale && p.locale !== "zh" ? ` locale="${p.locale}"` : ""} />`,
};
