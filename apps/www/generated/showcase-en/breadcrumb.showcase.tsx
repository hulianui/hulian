"use client";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Breadcrumb } from "../../../../packages/ui/src/breadcrumb/breadcrumb";
import type { BreadcrumbItem } from "../../../../packages/ui/src/breadcrumb/breadcrumb.types";
const Chevron = (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
    <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>);
const sample: BreadcrumbItem[] = [
    { label: "Home", href: "#" },
    { label: "Components", href: "#" },
    { label: "Breadcrumbs" },
];
const longPath: BreadcrumbItem[] = [
    { label: "Home", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "Design System", href: "#" },
    { label: "Navigation Family", href: "#" },
    { label: "Breadcrumb component", href: "#" },
    { label: "Accessibility Semantics" },
];
const separatorByKey: Record<string, ReactNode> = {
    slash: "/",
    chevron: Chevron,
    dot: "\u00B7",
};
export const breadcrumbShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in the items array (from the root to the current page). The last item defaults to the current page and cannot be clicked.",
            code: `<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Component", href: "/components" },
    { label: "Breadcrumbs" },
  ]}
/>`,
            render: () => <Breadcrumb items={sample}/>,
        },
        {
            title: "Custom separator",
            description: "separator accepts any ReactNode (character or icon), the default is \"/\", and the separator is automatically added with aria-hidden.",
            code: `<Breadcrumb items={items} separator={<ChevronIcon />} />`,
            render: () => <Breadcrumb items={sample} separator={Chevron}/>,
        },
        {
            title: "Unclickable middle term",
            description: "href that omits an item is rendered as neutral plain text (non-navigable ancestor) and is still not the current page.",
            code: `<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Archive" },
    { label: "2026 Annual Report" },
  ]}
/>`,
            render: () => (<Breadcrumb items={[
                    { label: "Home", href: "#" },
                    { label: "Archive" },
                    { label: "2026 Annual Report" },
                ]}/>),
        },
        {
            title: "Long path automatic line wrapping",
            description: "Automatically wrap lines in a narrow container when there are a large number of items, and use the chevron separator to make it clearer.",
            code: `<div className="max-w-xs">
  <Breadcrumb items={longPath} separator={<ChevronIcon />} />
</div>`,
            render: () => (<div className="max-w-xs rounded-[var(--radius)] border border-border p-3">
          <Breadcrumb items={longPath} separator={Chevron}/>
        </div>),
        },
        {
            title: "Client-side routing (render slot)",
            description: "render turns the item into the element you pass (next/link, react-router Link), merging the skin and aria-current into it. It is not click hijacking, so Cmd+click to open a new tab, middle-click and the rest keep working.",
            code: `<Breadcrumb
  items={[
    { label: "Customers", render: <Link href="/customers" /> },
    { label: "Zhang San" }, // the current page omits render, so it stays non-clickable
  ]}
/>`,
            render: () => (<Breadcrumb items={[
                    { label: "Customers", render: <a href="#"/> },
                    { label: "Zhang San" },
                ]}/>),
        },
    ],
    controls: [
        {
            prop: "separator",
            type: "select",
            options: ["slash", "chevron", "dot"],
            defaultValue: "slash",
            label: "Separator",
        },
    ],
    states: [
        {
            name: "Default (/ separated, last item current page)",
            render: () => <Breadcrumb items={sample}/>,
        },
        {
            name: "chevron delimiter",
            render: () => <Breadcrumb items={sample} separator={Chevron}/>,
        },
        {
            name: "Contains unclickable intermediate items (no href)",
            render: () => (<Breadcrumb items={[
                    { label: "Home", href: "#" },
                    { label: "Archive" },
                    { label: "2026 Annual Report" },
                ]}/>),
        },
        {
            name: "render slot (rendered as a router Link)",
            render: () => (<Breadcrumb items={[
                    { label: "Customers", render: <a href="#"/> },
                    { label: "Zhang San" },
                ]}/>),
        },
        {
            name: "Long path (narrow container wraps automatically)",
            render: () => (<div className="max-w-xs rounded-[var(--radius)] border border-border p-3">
          <Breadcrumb items={longPath} separator={Chevron}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<Breadcrumb items={sample} separator={separatorByKey[p.separator as string] ?? "/"}/>),
    toCode: (p) => p.separator === "slash"
        ? `<Breadcrumb items={items} />` : `<Breadcrumb items={items} separator={${p.separator === "chevron" ? "<ChevronIcon />" : "\"\u00B7\""}} />`,
};
