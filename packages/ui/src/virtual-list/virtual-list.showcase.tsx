"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { VirtualList } from "./virtual-list";

const rows = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `数据行 ${i + 1}` }));

function Demo() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border">
      <VirtualList
        items={rows}
        itemHeight={44}
        height={320}
        getKey={(r) => r.id}
        renderItem={(r) => (
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 text-sm text-foreground">
            <span>{r.name}</span>
            <span className="text-xs text-muted">#{r.id}</span>
          </div>
        )}
      />
    </div>
  );
}

export const virtualListShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "定高一万行",
      description: "itemHeight 传数字（定高），仅渲染视口内 + overscan 行，撑起总高占位。",
      code: `<VirtualList
  items={rows}
  itemHeight={44}
  height={320}
  getKey={(r) => r.id}
  renderItem={(r) => <Row data={r} />}
/>`,
      render: () => <Demo />,
    },
    {
      title: "变高估算",
      description: "itemHeight 传 (index) => px 做估算，对实测行自动校正。",
      code: `<VirtualList
  items={rows}
  itemHeight={(i) => (i % 3 === 0 ? 72 : 44)}
  height={320}
  getKey={(r) => r.id}
  renderItem={(r) => <Row data={r} />}
/>`,
      render: () => (
        <div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border">
          <VirtualList
            items={rows}
            itemHeight={(i) => (i % 3 === 0 ? 72 : 44)}
            height={320}
            getKey={(r) => r.id}
            renderItem={(r, i) => (
              <div
                className="flex items-center justify-between border-b border-border bg-surface px-4 text-sm text-foreground"
                style={{ height: i % 3 === 0 ? 72 : 44 }}
              >
                <span>{r.name}</span>
                <span className="text-xs text-muted">#{r.id}</span>
              </div>
            )}
          />
        </div>
      ),
    },
  ],
  controls: [],
  states: [{ name: "1 万行（仅渲染可见区）", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<VirtualList\n  items={rows}\n  itemHeight={44}\n  height={320}\n  renderItem={(r) => <Row data={r} />}\n/>`,
};
