"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { InfiniteScroll } from "../../../../packages/ui/src/infinite-scroll/infinite-scroll";
function Demo() {
    const [items, setItems] = useState(() => Array.from({ length: 15 }, (_, i) => i + 1));
    const hasMore = items.length < 45;
    const loadMore = () => new Promise<void>((resolve) => setTimeout(() => {
        setItems((prev) => [...prev, ...Array.from({ length: 15 }, (_, i) => prev.length + i + 1)]);
        resolve();
    }, 700));
    return (<div className="h-72 w-full max-w-md overflow-y-auto rounded-[var(--radius)] border border-border bg-surface">
      <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
        <div className="divide-y divide-border">
          {items.map((n) => (<div key={n} className="px-4 py-3 text-sm text-foreground">
              List items {n}
            </div>))}
        </div>
      </InfiniteScroll>
    </div>);
}
export const infiniteScrollShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Scroll to the end and load automatically",
            description: "When the bottom sentry enters the viewport, it is adjusted to onLoadMore; the returned Promise will not be triggered repeatedly.",
            code: `<InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
  {items.map((it) => (
    <Row key={it.id} data={it} />
  ))}
</InfiniteScroll>`,
            render: () => <Demo />,
        },
        {
            title: "Reached the end",
            description: "When hasMore={false}, stop observing and display the completed copy (can be customized with finishedText).",
            code: `<InfiniteScroll onLoadMore={loadMore} hasMore={false} finishedText="\u2014\u2014The end\u2014\u2014">
  {items.map((it) => (
    <Row key={it.id} data={it} />
  ))}
</InfiniteScroll>`,
            render: () => (<div className="h-72 w-full max-w-md overflow-y-auto rounded-[var(--radius)] border border-border bg-surface">
          <InfiniteScroll onLoadMore={() => { }} hasMore={false} finishedText="——The end——">
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (<div key={n} className="px-4 py-3 text-sm text-foreground">
                  List items {n}
                </div>))}
            </div>
          </InfiniteScroll>
        </div>),
        },
    ],
    controls: [],
    states: [{ name: "Scroll to the end to load automatically (45 items in total)", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
  {items.map((it) => <Row key={it.id} data={it} />)}
</InfiniteScroll>`,
};
