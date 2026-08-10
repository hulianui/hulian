"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { VirtualList } from "../../../../packages/ui/src/virtual-list/virtual-list";
const rows = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Data row ${i + 1}` }));
function Demo() {
    return (<div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border">
      <VirtualList items={rows} itemHeight={44} height={320} getKey={(r) => r.id} renderItem={(r) => (<div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 text-sm text-foreground">
            <span>{r.name}</span>
            <span className="text-xs text-muted-foreground">#{r.id}</span>
          </div>)}/>
    </div>);
}
export const virtualListShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Set the height to 10,000 lines",
            description: "itemHeight passes the number (fixed height), and only renders the + overscan line in the viewport to support the total height.",
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
            title: "Increased estimate",
            description: "itemHeight passes (index) => px to make estimates and automatically correct the actual measurements.",
            code: `<VirtualList
  items={rows}
  itemHeight={(i) => (i % 3 === 0 ? 72 : 44)}
  height={320}
  getKey={(r) => r.id}
  renderItem={(r) => <Row data={r} />}
/>`,
            render: () => (<div className="w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border">
          <VirtualList items={rows} itemHeight={(i) => (i % 3 === 0 ? 72 : 44)} height={320} getKey={(r) => r.id} renderItem={(r, i) => (<div className="flex items-center justify-between border-b border-border bg-surface px-4 text-sm text-foreground" style={{ height: i % 3 === 0 ? 72 : 44 }}>
                <span>{r.name}</span>
                <span className="text-xs text-muted-foreground">#{r.id}</span>
              </div>)}/>
        </div>),
        },
    ],
    controls: [],
    states: [{ name: "10,000 lines (only rendering visible area)", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<VirtualList
  items={rows}
  itemHeight={44}
  height={320}
  renderItem={(r) => <Row data={r} />}
/>`,
};
