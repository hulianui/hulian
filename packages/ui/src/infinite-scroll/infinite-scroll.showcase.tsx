"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { InfiniteScroll } from "./infinite-scroll";

function Demo() {
  const [items, setItems] = useState(() => Array.from({ length: 15 }, (_, i) => i + 1));
  const hasMore = items.length < 45;
  const loadMore = () =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        setItems((prev) => [...prev, ...Array.from({ length: 15 }, (_, i) => prev.length + i + 1)]);
        resolve();
      }, 700),
    );
  return (
    <div className="h-72 w-full max-w-md overflow-y-auto rounded-[var(--radius)] border border-border bg-surface">
      <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
        <div className="divide-y divide-border">
          {items.map((n) => (
            <div key={n} className="px-4 py-3 text-sm text-foreground">
              列表项 {n}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

export const infiniteScrollShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "滚动到底自动加载（共 45 条）", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>\n  {items.map((it) => <Row key={it.id} data={it} />)}\n</InfiniteScroll>`,
};
