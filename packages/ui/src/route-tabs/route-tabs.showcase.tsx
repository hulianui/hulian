"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { RouteTabs } from "./route-tabs";
import { nextActiveKey } from "./route-tabs-core";
import type { RouteTabItem } from "./route-tabs.types";

const INITIAL: RouteTabItem[] = [
  { key: "home", label: "工作台", pinned: true },
  { key: "orders", label: "订单管理" },
  { key: "goods", label: "商品列表" },
  { key: "members", label: "会员中心" },
  { key: "settings", label: "系统设置" },
];

/** 完整受控示例：items 归消费方，组件只把「这次该关哪些」算好交出来。 */
function Demo({ sortable }: { sortable?: boolean }) {
  const [items, setItems] = useState<RouteTabItem[]>(INITIAL);
  const [active, setActive] = useState("orders");

  const closeKeys = (keys: string[]) => {
    setActive((cur) => nextActiveKey(items, keys, cur) ?? cur);
    setItems((prev) => prev.filter((t) => !keys.includes(t.key)));
  };

  return (
    <div className="w-full rounded-[var(--radius)] border border-border">
      <RouteTabs
        items={items}
        activeKey={active}
        onChange={setActive}
        onClose={(k) => closeKeys([k])}
        onAction={(action, _key, affected) => {
          if (action === "refresh") return;
          closeKeys(affected);
        }}
        sortable={sortable}
        onReorder={
          sortable
            ? (keys) => setItems((prev) => keys.map((k) => prev.find((t) => t.key === k)!).filter(Boolean))
            : undefined
        }
      />
      <div className="p-4 text-sm text-muted">
        当前页：{items.find((t) => t.key === active)?.label ?? "（无）"} · 右键页签试试批量关闭
      </div>
    </div>
  );
}

export const routeTabsShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法（完全受控）",
      description:
        "items 不归组件。批量动作在 onAction 里给出「这次实际会关掉哪些 key」，照它过滤即可，不必自己再算 pinned/不可关。",
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
      title: "固定页签",
      description: "pinned 的页签恒不可关、排在最前，且不受「关闭其他/全部」影响（工作台、首页这类）。",
      code: `const items = [
  { key: "home", label: "工作台", pinned: true },
  { key: "orders", label: "订单管理" },
]`,
      render: () => <Demo />,
    },
    {
      title: "拖拽调序",
      description: "sortable + onReorder。固定段与普通段各自独立，不会把 pinned 拖到中间去。",
      code: `<RouteTabs
  items={items}
  activeKey={active}
  sortable
  onReorder={(keys) => setItems(keys.map((k) => byKey[k]))}
/>`,
      render: () => <Demo sortable />,
    },
  ],
  controls: [{ prop: "sortable", type: "boolean", defaultValue: false, label: "可拖拽调序" }],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "可拖拽调序", render: () => <Demo sortable /> },
  ],
  renderWithProps: (p) => <Demo sortable={p.sortable === true} />,
  toCode: (p) =>
    `<RouteTabs\n  items={items}\n  activeKey={active}\n  onChange={setActive}\n  onClose={(k) => closeKeys([k])}\n  onAction={(a, k, affected) => closeKeys(affected)}${
      p.sortable ? "\n  sortable\n  onReorder={setOrder}" : ""
    }\n/>`,
};
