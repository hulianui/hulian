"use client";
import { useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Listbox } from "../../../../packages/ui/src/listbox/listbox";
import type { ListboxItemData } from "../../../../packages/ui/src/listbox/listbox.types";
const items: ListboxItemData[] = [
    { key: "profile", label: "Profile", description: "View and edit accounts", startContent: <User className="size-4"/> },
    { key: "settings", label: "Settings", description: "Preferences and Notifications", startContent: <Settings className="size-4"/> },
    { key: "shortcut", label: "Shortcut keys", endContent: <kbd className="font-mono text-xs">⌘K</kbd> },
    { key: "disabled", label: "Disabled", disabled: true },
    { key: "logout", label: "Log out", startContent: <LogOut className="size-4"/> },
];
function Demo({ mode }: {
    mode: "single" | "multiple";
}) {
    const [keys, setKeys] = useState<string[]>(mode === "single" ? ["profile"] : ["profile", "settings"]);
    return <Listbox items={items} selectionMode={mode} selectedKeys={keys} onSelectionChange={setKeys}/>;
}
export const listboxShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Single choice",
            description: "selectionMode=\"single\", click/arrow keys to roam, and check the selected item.",
            code: `<Listbox
  items={items}
  selectionMode="single"
  defaultSelectedKeys={["profile"]}
  onSelectionChange={setKeys}
/>`,
            render: () => (<Listbox items={items} selectionMode="single" defaultSelectedKeys={["profile"]}/>),
        },
        {
            title: "Multiple choice",
            description: "selectionMode=\"multiple\", multiple selections are allowed, aria-multiselectable is automatically turned on.",
            code: `<Listbox
  items={items}
  selectionMode="multiple"
  defaultSelectedKeys={["profile", "settings"]}
  onSelectionChange={setKeys}
/>`,
            render: () => (<Listbox items={items} selectionMode="multiple" defaultSelectedKeys={["profile", "settings"]}/>),
        },
        {
            title: "Pure action list",
            description: "selectionMode=\"none\" does not hold the selected state, and only relies on onAction to trigger the command.",
            code: `<Listbox
  items={items}
  selectionMode="none"
  onAction={(key) => console.log(key)}
  aria-label="Action List"
/>`,
            render: () => (<Listbox items={items} selectionMode="none" onAction={() => { }} aria-label="Action List"/>),
        },
        {
            title: "Slot and description",
            description: "startContent icon, description secondary copy, endContent shortcut key, disabled deactivated.",
            code: `const items = [
  { key: "profile", label: "Personal Information", description: "View and Edit Account", startContent: <User className="size-4" /> },
  { key: "shortcut", label: "Shortcut key", endContent: <kbd className="font-mono text-xs">\u2318K</kbd> },
  { key: "disabled", label: "Disabled Item", disabled: true },
];

<Listbox items={items} selectionMode="single" />`,
            render: () => <Listbox items={items} selectionMode="single"/>,
        },
    ],
    controls: [
        { prop: "selectionMode", type: "select", options: ["single", "multiple", "none"], defaultValue: "single" },
    ],
    states: [
        { name: "single", render: () => <Demo mode="single"/> },
        { name: "multiple", render: () => <Demo mode="multiple"/> },
        {
            name: "action-only",
            render: () => <Listbox items={items} selectionMode="none" onAction={() => { }} aria-label="Action List"/>,
        },
    ],
    renderWithProps: (p) => {
        const mode = (p.selectionMode as "single" | "multiple" | "none") ?? "single";
        return mode === "none" ? (<Listbox items={items} selectionMode="none" aria-label="Action List"/>) : (<Demo mode={mode}/>);
    },
    toCode: (p) => `<Listbox
  items={items}
  selectionMode="${(p.selectionMode as string) ?? "single"}"
  selectedKeys={keys}
  onSelectionChange={setKeys}
/>`,
};
