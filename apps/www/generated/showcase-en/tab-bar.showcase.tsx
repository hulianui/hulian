"use client";
import { useState } from "react";
import { Calendar, Gauge, Menu, Search } from "../../../../packages/ui/src/_icons";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TabBar } from "../../../../packages/ui/src/tab-bar/tab-bar";
import type { TabBarItem } from "../../../../packages/ui/src/tab-bar/tab-bar.types";
const items: TabBarItem[] = [
    { key: "home", label: "Home", icon: <Menu className="size-5" aria-hidden/> },
    { key: "find", label: "Discovered", icon: <Search className="size-5" aria-hidden/>, dot: true },
    { key: "plan", label: "Schedule", icon: <Calendar className="size-5" aria-hidden/>, badge: 5 },
    { key: "me", label: "Mine", icon: <Gauge className="size-5" aria-hidden/> },
];
function TabBarDemo() {
    const [tab, setTab] = useState("home");
    return (<div className="w-72 overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
      <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
        Current page:{items.find((i) => i.key === tab)?.label}
      </div>
      <TabBar items={items} value={tab} onChange={setTab} fixed={false} safeArea={false}/>
    </div>);
}
export const tabBarShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "items driver; for uncontrolled use defaultValue Set the initial item, and the active item is highlighted text-primary.",
            code: `<TabBar
  defaultValue="home"
  items={[
    { key: "home", label: "Home", icon: <Home /> },
    { key: "find", label: "Discover", icon: <Search /> },
    { key: "me", label: "My", icon: <User /> },
  ]}
/>`,
            render: () => (<div className="w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <TabBar items={items.slice(0, 4)} defaultValue="home" fixed={false} safeArea={false}/>
        </div>),
        },
        {
            title: "Corner mark and red dot",
            description: "item.badge displays a digital corner mark (priority to dot), item.dot displays a red dot.",
            code: `<TabBar
  defaultValue="home"
  items={[
    { key: "home", label: "Home", icon: <Home /> },
    { key: "find", label: "Discover", icon: <Search />, dot: true },
    { key: "plan", label: "Schedule", icon: <Calendar />, badge: 5 },
    { key: "me", label: "My", icon: <User /> },
  ]}
/>`,
            render: () => (<div className="w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <TabBar items={items} defaultValue="find" fixed={false} safeArea={false}/>
        </div>),
        },
        {
            title: "Disabled item",
            description: "item.disabled is grayed out and unclickable.",
            code: `<TabBar
  defaultValue="home"
  items={[
    { key: "home", label: "Home", icon: <Home /> },
    { key: "plan", label: "Schedule", icon: <Calendar />, disabled: true },
    { key: "me", label: "My", icon: <User /> },
  ]}
/>`,
            render: () => (<div className="w-72 overflow-hidden rounded-[var(--radius)] border border-border">
          <TabBar items={[
                    items[0],
                    { ...items[2], disabled: true },
                    items[3],
                ]} defaultValue="home" fixed={false} safeArea={false}/>
        </div>),
        },
    ],
    controls: [],
    states: [{ name: "Controlled + corner mark/red dot", render: () => <TabBarDemo /> }],
    renderWithProps: () => <TabBarDemo />,
    toCode: () => `<TabBar
  value={tab}
  onChange={setTab}
  items={[
    { key: "home", label: "Home", icon: <Home /> },
    { key: "me", label: "My", icon: <User />, badge: 5 },
  ]}
/>`,
};
