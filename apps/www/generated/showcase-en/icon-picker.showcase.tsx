"use client";
import { useState } from "react";
import { Calendar, Check, Clock, Copy, Eye, File, Folder, Gauge, Info, Link, List, Menu, Play, Plus, RefreshCw, Search, Wrench, X, } from "../../../../packages/ui/src/_icons";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { IconPicker } from "../../../../packages/ui/src/icon-picker/icon-picker";
import type { IconPickerSource } from "../../../../packages/ui/src/icon-picker/icon-picker.types";
const REGISTRY: Record<string, React.ReactNode> = {
    gauge: <Gauge />,
    menu: <Menu />,
    wrench: <Wrench />,
    eye: <Eye />,
    search: <Search />,
    link: <Link />,
    list: <List />,
    info: <Info />,
    plus: <Plus />,
    copy: <Copy />,
    refresh: <RefreshCw />,
    check: <Check />,
    close: <X />,
    play: <Play />,
    calendar: <Calendar />,
    clock: <Clock />,
    file: <File />,
    folder: <Folder />,
};
const renderIcon = (name: string) => REGISTRY[name] ?? null;
const SOURCES: IconPickerSource[] = [
    {
        key: "common",
        label: "Commonly used",
        icons: [
            { name: "gauge", keywords: ["Dashboard", "Home"] },
            { name: "menu", keywords: ["Menu", "Navigation"] },
            { name: "wrench", keywords: ["Settings", "Configuration", "Tools"] },
            { name: "eye", keywords: ["View", "Preview"] },
            { name: "search", keywords: ["Search", "Find"] },
            { name: "link", keywords: ["Link"] },
            { name: "list", keywords: ["List"] },
            { name: "info", keywords: ["Information", "Description"] },
        ],
        renderIcon,
    },
    {
        key: "action",
        label: "Actions",
        icons: [
            { name: "plus", keywords: ["New", "Add"] },
            { name: "copy", keywords: ["Copy"] },
            { name: "refresh", keywords: ["Refresh", "Reload"] },
            { name: "check", keywords: ["Confirm", "Complete"] },
            { name: "close", keywords: ["Close", "Cancel"] },
            { name: "play", keywords: ["Run", "Execute"] },
            { name: "calendar", keywords: ["Date", "Calendar"] },
            { name: "clock", keywords: ["Time"] },
        ],
        renderIcon,
    },
];
function Demo({ columns = 8, searchable = true, clearable = true }: {
    columns?: number;
    searchable?: boolean;
    clearable?: boolean;
}) {
    const [v, setV] = useState<string | null>("gauge");
    return (<IconPicker sources={SOURCES} value={v} onValueChange={setV} columns={columns} searchable={searchable} clearable={clearable}/>);
}
export const iconPickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "sources is given by you: each category has a set of icon names + one renderIcon. After selection, the external value is the icon name (the backend usually also stores the name).",
            code: `const SOURCES = [
  {
    key: "common",
    label: "Commonly used",
    icons: [{ name: "gauge", keywords: ["Dashboard"] }, { name: "menu" }],
    renderIcon: (name) => REGISTRY[name],
  },
]

<IconPicker sources={SOURCES} defaultValue="gauge" onValueChange={setIcon} />`,
            render: () => <IconPicker sources={SOURCES} defaultValue="gauge"/>,
        },
        {
            title: "Search across all categories",
            description: "Search by name or keywords alias. Category tabs are hidden when searching - users don't have the concept of \"which category it belongs to\" when looking for an icon.",
            code: `<IconPicker sources={SOURCES} searchPlaceholder="Search icon (supports Chinese aliases)" />`,
            render: () => <IconPicker sources={SOURCES} searchPlaceholder="Search icon (supports Chinese aliases)"/>,
        },
        {
            title: "Number of columns",
            description: "columns controls the number of grid columns and adjusts the width with className.",
            code: `<IconPicker sources={SOURCES} columns={6} className="w-60" />`,
            render: () => <IconPicker sources={SOURCES} columns={6} className="w-60"/>,
        },
        {
            title: "Not clearable",
            description: "clearable={false} Remove the current value and clear button at the top (scenario where value is required).",
            code: `<IconPicker sources={SOURCES} defaultValue="play" clearable={false} />`,
            render: () => <IconPicker sources={SOURCES} defaultValue="play" clearable={false}/>,
        },
    ],
    controls: [
        { prop: "columns", type: "select", options: ["6", "8", "10"], defaultValue: "8", label: "Number of columns" },
        { prop: "searchable", type: "boolean", defaultValue: true, label: "Searchable" },
        { prop: "clearable", type: "boolean", defaultValue: true, label: "Clearable" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "6 columns", render: () => <Demo columns={6}/> },
        { name: "No search", render: () => <Demo searchable={false}/> },
        { name: "Not clearable", render: () => <Demo clearable={false}/> },
    ],
    renderWithProps: (p) => (<Demo columns={Number(p.columns ?? 8) || 8} searchable={p.searchable !== false} clearable={p.clearable !== false}/>),
    toCode: (p) => `<IconPicker
  sources={SOURCES}
  value={icon}
  onValueChange={setIcon}${p.columns && Number(p.columns) !== 8 ? `
  columns={${p.columns}}` : ""}${p.searchable === false ? "\n  searchable={false}" : ""}${p.clearable === false ? "\n  clearable={false}" : ""}
/>`,
};
