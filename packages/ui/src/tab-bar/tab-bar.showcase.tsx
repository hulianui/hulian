"use client";
import { useState } from "react";
import { Calendar, Gauge, Menu, Search } from "../_icons";
import type { ShowcaseSpec } from "../showcase/types";
import { TabBar } from "./tab-bar";
import type { TabBarItem } from "./tab-bar.types";

const items: TabBarItem[] = [
  { key: "home", label: "首页", icon: <Menu className="size-5" aria-hidden /> },
  { key: "find", label: "发现", icon: <Search className="size-5" aria-hidden />, dot: true },
  { key: "plan", label: "日程", icon: <Calendar className="size-5" aria-hidden />, badge: 5 },
  { key: "me", label: "我的", icon: <Gauge className="size-5" aria-hidden /> },
];

// TabBar 默认 fixed 贴视口底；demo 用 relative 手机框 + fixed={false} 收进框内随流。
function TabBarDemo() {
  const [tab, setTab] = useState("home");
  return (
    <div className="w-72 overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
      <div className="flex h-44 items-center justify-center text-sm text-muted">
        当前页：{items.find((i) => i.key === tab)?.label}
      </div>
      <TabBar items={items} value={tab} onChange={setTab} fixed={false} safeArea={false} />
    </div>
  );
}

export const tabBarShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "items 驱动；非受控用 defaultValue 设初始项，激活项高亮 text-primary。",
      code: `<TabBar
  defaultValue="home"
  items={[
    { key: "home", label: "首页", icon: <Home /> },
    { key: "find", label: "发现", icon: <Search /> },
    { key: "me", label: "我的", icon: <User /> },
  ]}
/>`,
      render: () => (
        <div className="w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <TabBar items={items.slice(0, 4)} defaultValue="home" fixed={false} safeArea={false} />
        </div>
      ),
    },
    {
      title: "角标与红点",
      description: "item.badge 显示数字角标（优先于 dot），item.dot 显示红点。",
      code: `<TabBar
  defaultValue="home"
  items={[
    { key: "home", label: "首页", icon: <Home /> },
    { key: "find", label: "发现", icon: <Search />, dot: true },
    { key: "plan", label: "日程", icon: <Calendar />, badge: 5 },
    { key: "me", label: "我的", icon: <User /> },
  ]}
/>`,
      render: () => (
        <div className="w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <TabBar items={items} defaultValue="find" fixed={false} safeArea={false} />
        </div>
      ),
    },
    {
      title: "禁用项",
      description: "item.disabled 置灰且不可点击。",
      code: `<TabBar
  defaultValue="home"
  items={[
    { key: "home", label: "首页", icon: <Home /> },
    { key: "plan", label: "日程", icon: <Calendar />, disabled: true },
    { key: "me", label: "我的", icon: <User /> },
  ]}
/>`,
      render: () => (
        <div className="w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <TabBar
            items={[
              items[0],
              { ...items[2], disabled: true },
              items[3],
            ]}
            defaultValue="home"
            fixed={false}
            safeArea={false}
          />
        </div>
      ),
    },
  ],
  controls: [],
  states: [{ name: "受控 + 角标/红点", render: () => <TabBarDemo /> }],
  renderWithProps: () => <TabBarDemo />,
  toCode: () =>
    `<TabBar\n  value={tab}\n  onChange={setTab}\n  items={[\n    { key: "home", label: "首页", icon: <Home /> },\n    { key: "me", label: "我的", icon: <User />, badge: 5 },\n  ]}\n/>`,
};
