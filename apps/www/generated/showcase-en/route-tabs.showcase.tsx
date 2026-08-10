"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RouteTabs } from "../../../../packages/ui/src/route-tabs/route-tabs";
import { nextActiveKey } from "../../../../packages/ui/src/route-tabs/route-tabs-core";
import type { RouteTabItem } from "../../../../packages/ui/src/route-tabs/route-tabs.types";
const INITIAL: RouteTabItem[] = [
    { key: "home", label: "Workbench", pinned: true },
    { key: "orders", label: "Order Management" },
    { key: "goods", label: "Product List" },
    { key: "members", label: "Member Center" },
    { key: "settings", label: "System Settings" },
];
function Demo({ sortable }: {
    sortable?: boolean;
}) {
    const [items, setItems] = useState<RouteTabItem[]>(INITIAL);
    const [active, setActive] = useState("orders");
    const closeKeys = (keys: string[]) => {
        setActive((cur) => nextActiveKey(items, keys, cur) ?? cur);
        setItems((prev) => prev.filter((t) => !keys.includes(t.key)));
    };
    return (<div className="w-full rounded-[var(--radius)] border border-border">
      <RouteTabs items={items} activeKey={active} onChange={setActive} onClose={(k) => closeKeys([k])} onAction={(action, _key, affected) => {
            if (action === "refresh")
                return;
            closeKeys(affected);
        }} sortable={sortable} onReorder={sortable
            ? (keys) => setItems((prev) => keys.map((k) => prev.find((t) => t.key === k)!).filter(Boolean))
            : undefined}/>
      <div className="p-4 text-sm text-muted-foreground">
        Current page:{items.find((t) => t.key === active)?.label ?? "(none)"} · Right-click the tab and try to close it in batches
      </div>
    </div>);
}
export const routeTabsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage (fully controlled)",
            description: "items is not a component. The batch action gives \"Which key will actually be turned off this time\" in onAction. You can filter according to it. You don't have to calculate pinned/cannot be turned off by yourself.",
            code: `const [items, setItems] = useState(INITIAL)
const [active, setActive] = useState("orders")

const closeKeys = (keys: string[]) => {
  setActive((cur) => nextActiveKey(items, keys, cur) ?? cur)
  setItems((prev) => prev.filter((t) => !keys.includes(t.key)))
}

<RouteTabs
  items={items}
  activeKey={active}
  onChange={setActive}
  onClose={(k) => closeKeys([k])}
  onAction={(action, key, affected) => {
    if (action === "refresh") return remountPage(key)
    closeKeys(affected)
  }}
/>`,
            render: () => <Demo />,
        },
        {
            title: "Fixed tab",
            description: "The tab of pinned can never be closed, is ranked first, and is not affected by \"Close Others/All\" (workbench, homepage, etc.).",
            code: `const items = [
  { key: "home", label: "Workbench", pinned: true },
  { key: "orders", label: "Order Management" },
]`,
            render: () => <Demo />,
        },
        {
            title: "Drag and drop to sequence",
            description: "sortable + onReorder. The fixed segment and the ordinary segment are independent, and pinned will not be dragged into the middle.",
            code: `<RouteTabs
  items={items}
  activeKey={active}
  sortable
  onReorder={(keys) => setItems(keys.map((k) => byKey[k]))}
/>`,
            render: () => <Demo sortable/>,
        },
    ],
    controls: [{ prop: "sortable", type: "boolean", defaultValue: false, label: "Drag-and-drop sequencer" }],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "Drag-and-drop sequencer", render: () => <Demo sortable/> },
    ],
    renderWithProps: (p) => <Demo sortable={p.sortable === true}/>,
    toCode: (p) => `<RouteTabs
  items={items}
  activeKey={active}
  onChange={setActive}
  onClose={(k) => closeKeys([k])}
  onAction={(a, k, affected) => closeKeys(affected)}${p.sortable ? "\n  sortable\n  onReorder={setOrder}" : ""}
/>`,
};
