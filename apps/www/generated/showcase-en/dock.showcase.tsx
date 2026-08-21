"use client";
import { useState } from "react";
import { Home, Search, Bell, Settings, User } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Dock, DockIcon } from "../../../../packages/ui/src/dock/dock";
function Demo() {
    return (<Dock>
      <DockIcon><Home className="size-5"/></DockIcon>
      <DockIcon><Search className="size-5"/></DockIcon>
      <DockIcon><Bell className="size-5"/></DockIcon>
      <DockIcon><Settings className="size-5"/></DockIcon>
      <DockIcon><User className="size-5"/></DockIcon>
    </Dock>);
}
const NAV = [
    { key: "home", label: "Home", icon: <Home className="size-5"/> },
    { key: "search", label: "Search", icon: <Search className="size-5"/> },
    { key: "alerts", label: "Notice", icon: <Bell className="size-5"/> },
    { key: "settings", label: "Settings", icon: <Settings className="size-5"/> },
];
function NavDemo() {
    const [active, setActive] = useState("home");
    return (<div className="flex w-full flex-col items-center gap-3">
      <p className="text-xs text-muted-foreground">
        Current: <span className="text-foreground">{NAV.find((i) => i.key === active)?.label}</span>
      </p>
      <Dock aria-label="Main navigation" activeKey={active} onSelect={setActive}>
        {NAV.map((item) => (<DockIcon key={item.key} itemKey={item.key} label={item.label}>
            {item.icon}
          </DockIcon>))}
      </Dock>
    </div>);
}
export const dockShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Persistent bottom navigation (with a current item)",
            description: "activeKey plus onSelect is the same controlled pattern as NavMenu and RouteTabs. The current item gets aria-current=\"page\" and an indicator dot under the icon, a shape cue rather than colour alone. Once onSelect is provided, DockIcon renders as a real <button> (focusable, activated by Enter) and the container becomes a nav landmark.",
            code: `const [active, setActive] = useState("home")

<Dock aria-label="Main navigation" activeKey={active} onSelect={setActive}>
  <DockIcon itemKey="home" label="Home"><Home className="size-5" /></DockIcon>
  <DockIcon itemKey="search" label="Search"><Search className="size-5" /></DockIcon>
  <DockIcon itemKey="alerts" label="Notifications"><Bell className="size-5" /></DockIcon>
  <DockIcon itemKey="settings" label="Settings"><Settings className="size-5" /></DockIcon>
</Dock>`,
            render: () => <NavDemo />,
        },
        {
            title: "Basic usage",
            description: "DockIcon package icon, when the mouse is close to it, the icon will be enlarged according to the horizontal distance (macOS magnification dock effect).",
            code: `<Dock>
  <DockIcon><Home className="size-5" /></DockIcon>
  <DockIcon><Search className="size-5" /></DockIcon>
  <DockIcon><Bell className="size-5" /></DockIcon>
  <DockIcon><Settings className="size-5" /></DockIcon>
  <DockIcon><User className="size-5" /></DockIcon>
</Dock>`,
            render: () => <Demo />,
        },
        {
            title: "Stronger amplification",
            description: "magnification increases the peak size and distance increases the range of influence to obtain a more exaggerated amplification effect.",
            code: `<Dock magnification={84} distance={160}>
  <DockIcon><Home className="size-5" /></DockIcon>
  <DockIcon><Search className="size-5" /></DockIcon>
  <DockIcon><Bell className="size-5" /></DockIcon>
</Dock>`,
            render: () => (<Dock magnification={84} distance={160}>
          <DockIcon><Home className="size-5"/></DockIcon>
          <DockIcon><Search className="size-5"/></DockIcon>
          <DockIcon><Bell className="size-5"/></DockIcon>
        </Dock>),
        },
        {
            title: "Custom resting size",
            description: "iconSize Sets the base size when not hovering, adapting to more compact or looser docks.",
            code: `<Dock iconSize={32}>
  <DockIcon><Home className="size-4" /></DockIcon>
  <DockIcon><Search className="size-4" /></DockIcon>
  <DockIcon><Settings className="size-4" /></DockIcon>
</Dock>`,
            render: () => (<Dock iconSize={32}>
          <DockIcon><Home className="size-4"/></DockIcon>
          <DockIcon><Search className="size-4"/></DockIcon>
          <DockIcon><Settings className="size-4"/></DockIcon>
        </Dock>),
        },
    ],
    controls: [],
    states: [{ name: "default", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<Dock>
  <DockIcon><Home /></DockIcon>
  <DockIcon><Search /></DockIcon>
</Dock>`,
};
