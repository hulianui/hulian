"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PullToRefresh } from "../../../../packages/ui/src/pull-to-refresh/pull-to-refresh";
function Demo() {
    const [rows, setRows] = useState(() => Array.from({ length: 8 }, (_, i) => `List items ${i + 1}`));
    const refresh = () => new Promise<void>((resolve) => setTimeout(() => {
        setRows((prev) => [`New content ${prev.length + 1}`, ...prev]);
        resolve();
    }, 800));
    return (<div className="h-56 w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="divide-y divide-border">
          {rows.map((r) => (<div key={r} className="px-4 py-3 text-sm text-foreground">
              {r}
            </div>))}
        </div>
      </PullToRefresh>
    </div>);
}
function StaticList({ onRefresh = () => new Promise<void>((r) => setTimeout(r, 600)), threshold, pullingText, armedText, }: {
    onRefresh?: () => Promise<void>;
    threshold?: number;
    pullingText?: string;
    armedText?: string;
}) {
    const rows = ["List item 1", "List item 2", "List item 3", "List item 4", "List item 5", "List item 6"];
    return (<div className="h-56 w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
      <PullToRefresh onRefresh={onRefresh} threshold={threshold} pullingText={pullingText} armedText={armedText} className="h-full">
        <div className="divide-y divide-border">
          {rows.map((r) => (<div key={r} className="px-4 py-3 text-sm text-foreground">
              {r}
            </div>))}
        </div>
      </PullToRefresh>
    </div>);
}
export const pullToRefreshShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "When the scroll container is on top, the pull-down triggers refresh, and the Promise returned by onRefresh remains refreshed until the end.",
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
            title: "Custom threshold",
            description: "threshold To increase the value, you need to pull it down deeper to trigger, which is suitable to avoid accidental touches.",
            code: `<PullToRefresh onRefresh={refresh} threshold={96} className="h-full">
  <List />
</PullToRefresh>`,
            render: () => <StaticList threshold={96}/>,
        },
        {
            title: "Custom copywriting",
            description: "pullingText / armedText / refreshingText can be changed to business semantic copywriting.",
            code: `<PullToRefresh
  onRefresh={refresh}
  pullingText="Continue to pull down"
  armedText="Release to update"
  className="h-full"
>
  <List />
</PullToRefresh>`,
            render: () => <StaticList pullingText="Continue to scroll down" armedText="Release to update"/>,
        },
    ],
    controls: [],
    states: [{ name: "Pull down to refresh (top pull down)", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<PullToRefresh onRefresh={async () => { await load(); }}>
  <List />
</PullToRefresh>`,
};
