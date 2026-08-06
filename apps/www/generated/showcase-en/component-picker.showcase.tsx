"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { Tag } from "../../../../packages/ui/src/tag";
import { ComponentPicker, ComponentPickerCommand } from "../../../../packages/ui/src/component-picker/component-picker";
import { parseComponentCatalog } from "../../../../packages/ui/src/component-picker/component-picker-catalog";
import type { ComponentPickerItem } from "../../../../packages/ui/src/component-picker/component-picker.types";
const DEMO_ITEMS: ComponentPickerItem[] = [
    {
        slug: "button",
        name: "Button",
        description: "Button \u00B7 variants and sizes",
        category: "forms",
        group: "basic",
        props: [
            { name: "variant", type: "\"solid\" | \"ghost\"", default: "\"solid\"", description: "Visual variant" },
            { name: "loading", type: "boolean", default: "false", description: "Loading state" },
        ],
        examples: [{ title: "Basic usage", lang: "tsx", code: "<Button>OK</Button>" }],
    },
    {
        slug: "input",
        name: "Input",
        description: "Input \u00B7 prefix and suffix slots",
        category: "forms",
        group: "basic",
        props: [{ name: "prefix", type: "ReactNode", description: "Prefix slot" }],
    },
    {
        slug: "table",
        name: "Table",
        description: "Table \u00B7 sorting and pinned columns",
        category: "data-display",
        group: "collection",
        props: [{ name: "enableSorting", type: "boolean", default: "true", description: "Whether sorting is enabled" }],
        examples: [{ title: "Basic usage", lang: "tsx", code: "<Table columns={columns} data={rows} />" }],
    },
    {
        slug: "tree",
        name: "Tree",
        description: "Recursive tree \u00B7 keyboard accessible",
        category: "data-display",
        group: "collection",
    },
    {
        slug: "empty",
        name: "Empty",
        description: "Empty state \u00B7 icon and description",
        category: "data-display",
        group: "placeholder",
        props: [{ name: "title", type: "ReactNode", description: "Title" }],
    },
    {
        slug: "command",
        name: "Command",
        description: "Command palette \u00B7 fuzzy search",
        category: "navigation",
        group: "action",
        tags: ["overlay"],
    },
];
const CATALOG_TEXT = [
    "<!-- \u2550\u2550\u2550\u2550 -->",
    "# Spinner",
    "",
    "> Loading indicator \u00B7 three sizes \u00B7 feedback/status",
    "",
    "## Props",
    "",
    "| Name | Type | Default | Description |",
    "|------|------|------|------|",
    "| size | `\"sm\" \\| \"md\"` | `\"md\"` | Size |",
    "",
    "<!-- \u2550\u2550\u2550\u2550 -->",
    "# Skeleton",
    "",
    "> Skeleton \u00B7 placeholder animation \u00B7 feedback/status",
    "",
    "## Props",
    "",
    "| Name | Type | Default | Description |",
    "|------|------|------|------|",
    "| lines | `number` | `3` | Line count |",
].join("\n");
const PARSED = parseComponentCatalog(CATALOG_TEXT);
const Basic = () => <ComponentPicker items={DEMO_ITEMS} className="h-[420px]"/>;
const WithPreview = () => (<ComponentPicker items={DEMO_ITEMS} className="h-[420px]" defaultActiveSlug="button" showPreview showExamples={false} renderPreview={(item) => item.slug === "button" ? <Button size="sm">OK</Button> : <Tag>{item.name}</Tag>}/>);
const CommandDemo = () => {
    const [open, setOpen] = useState(false);
    const [picked, setPicked] = useState<string | null>(null);
    return (<div className="flex flex-col items-start gap-3">
      <Button size="sm" onClick={() => setOpen(true)}>
        Open the command panel
      </Button>
      {picked && <Tag tone="brand">{picked}</Tag>}
      <ComponentPickerCommand items={DEMO_ITEMS} open={open} onOpenChange={setOpen} onSelect={(slug) => setPicked(slug)}/>
    </div>);
};
const FromCatalog = () => (<ComponentPicker items={PARSED} className="h-[320px]" showTree={false} defaultActiveSlug="spinner"/>);
export const componentPickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Category tree on the left, search on top, result grid on the right. The catalog is fed in by the consumer; the component never fetches it.",
            code: `<ComponentPicker items={items} className="h-[420px]" />`,
            render: () => <Basic />,
        },
        {
            title: "Inject a live preview",
            description: "The library cannot render an instance for an arbitrary slug, so the preview is injected through renderPreview; a placeholder is shown when it is omitted.",
            code: `<ComponentPicker
  items={items}
  className="h-[420px]"
  defaultActiveSlug="button"
  showPreview
  showExamples={false}
  renderPreview={(item) => (item.slug === "button" ? <Button size="sm">OK</Button> : <Tag>{item.name}</Tag>)}
/>`,
            render: () => <WithPreview />,
        },
        {
            title: "Parse the catalog from llms-full.txt",
            description: "Parsing is a pure function called on the consumer side; the component sends no network request and assumes no file exists.",
            code: `import { ComponentPicker, parseComponentCatalog } from "@hulianui/ui";

const items = parseComponentCatalog(await fetch("/llms-full.txt").then((r) => r.text()));

<ComponentPicker items={items} className="h-[320px]" showTree={false} />`,
            render: () => <FromCatalog />,
        },
        {
            title: "Command palette form",
            description: "Use it when you already know which component you want; a category tree and a props table do not fit into a single command line, so this is only a thin wrapper.",
            code: `const [open, setOpen] = useState(false);

<ComponentPickerCommand items={items} open={open} onOpenChange={setOpen} onSelect={(slug) => insert(slug)} />`,
            render: () => <CommandDemo />,
        },
    ],
    controls: [
        { prop: "showTree", type: "boolean", defaultValue: true, label: "Category tree" },
        { prop: "showPreview", type: "boolean", defaultValue: false, label: "Preview" },
        { prop: "showProps", type: "boolean", defaultValue: true, label: "Props table" },
        { prop: "showExamples", type: "boolean", defaultValue: true, label: "Examples" },
    ],
    states: [
        { name: "Browsing the catalog", render: () => <Basic /> },
        {
            name: "Component selected",
            render: () => (<ComponentPicker items={DEMO_ITEMS} className="h-[420px]" defaultActiveSlug="table"/>),
        },
        {
            name: "No results",
            render: () => (<ComponentPicker items={DEMO_ITEMS} className="h-[320px]" defaultFilter={{ search: "zzzz" }}/>),
        },
    ],
    renderWithProps: (props) => (<ComponentPicker items={DEMO_ITEMS} className="h-[420px]" defaultActiveSlug="button" {...props}/>),
    toCode: (props) => `<ComponentPicker items={items} className="h-[420px]"${props.showTree === false ? " showTree={false}" : ""}${props.showPreview ? " showPreview" : ""}${props.showProps === false ? " showProps={false}" : ""}${props.showExamples === false ? " showExamples={false}" : ""} />`,
};
