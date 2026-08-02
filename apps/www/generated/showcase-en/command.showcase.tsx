"use client";
import { useState } from "react";
import { Calendar, FilePlus, LayoutDashboard, LogOut, Moon, Package, Plus, Search, Settings, ShoppingCart, Sun, Upload, User, Users, } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button/button";
import { Command } from "../../../../packages/ui/src/command/command";
import type { CommandGroupData } from "../../../../packages/ui/src/command/command.types";
const groups: CommandGroupData[] = [
    {
        heading: "Quick jump",
        items: [
            { value: "go-dashboard", label: "Dashboard", description: "Overview of today's data", keywords: "dashboard Home Overview db", icon: <LayoutDashboard /> },
            { value: "go-orders", label: "Order Management", description: "View and process orders", keywords: "order dd Transaction", icon: <ShoppingCart /> },
            { value: "go-products", label: "Product Library", description: "SKU with stock", keywords: "product sku Product Stock", icon: <Package /> },
            { value: "go-customers", label: "Customer List", description: "Members and portraits", keywords: "customer Member user", icon: <Users /> },
        ],
    },
    {
        heading: "Actions",
        items: [
            { value: "new-order", label: "Create new order", keywords: "create order New Order", icon: <Plus />, shortcut: "\u2318N" },
            { value: "new-doc", label: "New document", keywords: "create doc Documentation new", icon: <FilePlus /> },
            { value: "import", label: "Import data", description: "Upload CSV / Excel", keywords: "import upload Import Upload", icon: <Upload /> },
            { value: "search-all", label: "Global search", keywords: "search Find", icon: <Search />, shortcut: "\u2318F" },
            { value: "schedule", label: "Scheduling Calendar", keywords: "calendar Schedule", icon: <Calendar /> },
        ],
    },
    {
        heading: "Accounts and Topics",
        items: [
            { value: "theme-light", label: "Switch to light theme", keywords: "theme light bright", icon: <Sun /> },
            { value: "theme-dark", label: "Switch dark theme", keywords: "theme dark Theme Dark", icon: <Moon /> },
            { value: "profile", label: "Profile", keywords: "profile account Personal", icon: <User /> },
            { value: "settings", label: "Preferences", keywords: "settings preferences Settings Preferences", icon: <Settings />, shortcut: "\u2318," },
            { value: "logout", label: "Log out", description: "End current session", keywords: "logout Exit Log out signout", icon: <LogOut /> },
        ],
    },
];
function Demo({ placeholder, shortcut, closeOnSelect, }: {
    placeholder?: string;
    shortcut?: boolean;
    closeOnSelect?: boolean;
}) {
    const [open, setOpen] = useState(false);
    return (<>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open the command panel{shortcut ? "(or \u2318K)" : ""}
      </Button>
      <Command open={open} onOpenChange={setOpen} groups={groups} placeholder={placeholder} shortcut={shortcut} closeOnSelect={closeOnSelect}/>
    </>);
}
export const commandShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Command is in controlled mode: hold open with useState, and the button triggers to open. groups provides grouping commands, and the input box is filtered across groups in real time (try entering \"Order\", \"dd\" and \"Topic\").",
            code: `const [open, setOpen] = useState(false);

const groups = [
  {
    heading: "Quick jump",
    items: [
      { value: "go-dashboard", label: "Dashboard", description: "Overview of today's data",
        keywords: "dashboard Home", icon: <LayoutDashboard /> },
      { value: "go-orders", label: "Order Management", keywords: "order Order dd",
        icon: <ShoppingCart /> },
    ],
  },
  {
    heading: "Operation",
    items: [
      { value: "new-order", label: "New Order", icon: <Plus />, shortcut: "\u2318N" },
      { value: "import", label: "Import data", description: "Upload CSV / Excel",
        icon: <Upload /> },
    ],
  },
];

<Button variant="outline" onClick={() => setOpen(true)}>Open the command panel</Button>
<Command open={open} onOpenChange={setOpen} groups={groups} />`,
            render: () => <Demo />,
        },
        {
            title: "Built-in \u2318K shortcut keys",
            description: "After shortcut is turned on, the component has built-in \u2318K / Ctrl+K global monitoring switch, no need to bind it yourself.",
            code: `<Button variant="outline" onClick={() => setOpen(true)}>
  Open the command panel (or \u2318K)
</Button>
<Command open={open} onOpenChange={setOpen} groups={groups} shortcut />`,
            render: () => <Demo shortcut/>,
        },
        {
            title: "Keep open after selection",
            description: "closeOnSelect={false} The panel does not close after executing the command, which is suitable for scenarios with multiple consecutive operations.",
            code: `<Command
  open={open}
  onOpenChange={setOpen}
  groups={groups}
  closeOnSelect={false}
/>`,
            render: () => <Demo closeOnSelect={false}/>,
        },
    ],
    controls: [
        { prop: "placeholder", type: "text", defaultValue: "Enter command or search..." },
        { prop: "shortcut", type: "boolean", defaultValue: false, label: "Built-in \u2318K" },
        { prop: "closeOnSelect", type: "boolean", defaultValue: true, label: "Close after selection" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "Built-in \u2318K shortcut keys", render: () => <Demo shortcut/> },
    ],
    renderWithProps: (p) => (<Demo placeholder={(p.placeholder as string) || undefined} shortcut={p.shortcut as boolean} closeOnSelect={p.closeOnSelect as boolean}/>),
    toCode: (p) => `const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open the command panel</Button>
<Command
  open={open}
  onOpenChange={setOpen}
  placeholder="${(p.placeholder as string) ?? "Enter command or search..."}"
  shortcut={${Boolean(p.shortcut)}}
  groups={[
    { heading: "Commonly used", items: [{ value: "new", label: "New file", onSelect: (v) => {} }] },
  ]}
/>`,
};
