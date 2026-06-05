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

export const pullToRefreshShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "下拉刷新（顶部下拉）", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () => `<PullToRefresh onRefresh={async () => { await load(); }}>\n  <List />\n</PullToRefresh>`,
};
