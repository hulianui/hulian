"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { PullToRefresh } from "./pull-to-refresh";

function Demo() {
  const [rows, setRows] = useState(() => Array.from({ length: 8 }, (_, i) => `列表项 ${i + 1}`));
  const refresh = () =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        setRows((prev) => [`新内容 ${prev.length + 1}`, ...prev]);
        resolve();
      }, 800),
    );
  return (
    <div className="h-56 w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r} className="px-4 py-3 text-sm text-foreground">
              {r}
            </div>
          ))}
        </div>
      </PullToRefresh>
    </div>
  );
}

/** 无状态静态列表：示例预览只演示外观与下拉手势，onRefresh 为异步空操作。 */
function StaticList({
  onRefresh = () => new Promise<void>((r) => setTimeout(r, 600)),
  threshold,
  pullingText,
  armedText,
}: {
  onRefresh?: () => Promise<void>;
  threshold?: number;
  pullingText?: string;
  armedText?: string;
}) {
  const rows = ["列表项 1", "列表项 2", "列表项 3", "列表项 4", "列表项 5", "列表项 6"];
  return (
    <div className="h-56 w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
      <PullToRefresh
        onRefresh={onRefresh}
        threshold={threshold}
        pullingText={pullingText}
        armedText={armedText}
        className="h-full"
      >
        <div className="divide-y divide-border">
          {rows.map((r) => (
            <div key={r} className="px-4 py-3 text-sm text-foreground">
              {r}
            </div>
          ))}
        </div>
      </PullToRefresh>
    </div>
  );
}

export const pullToRefreshShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "滚动容器置顶时下拉触发刷新，onRefresh 返回的 Promise 结束前保持刷新态。",
      code: `<div className="h-56 overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
  <PullToRefresh
    onRefresh={async () => {
      await load();
    }}
    className="h-full"
  >
    <List />
  </PullToRefresh>
</div>`,
      render: () => <StaticList />,
    },
    {
      title: "自定义阈值",
      description: "threshold 调高需下拉更深才触发，适合避免误触。",
      code: `<PullToRefresh onRefresh={refresh} threshold={96} className="h-full">
  <List />
</PullToRefresh>`,
      render: () => <StaticList threshold={96} />,
    },
    {
      title: "自定义文案",
      description: "pullingText / armedText / refreshingText 可改为业务语义文案。",
      code: `<PullToRefresh
  onRefresh={refresh}
  pullingText="继续下拉"
  armedText="松手即可更新"
  className="h-full"
>
  <List />
</PullToRefresh>`,
      render: () => <StaticList pullingText="继续下拉" armedText="松手即可更新" />,
    },
  ],
  controls: [],
  states: [{ name: "下拉刷新（顶部下拉）", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () => `<PullToRefresh onRefresh={async () => { await load(); }}>\n  <List />\n</PullToRefresh>`,
};
