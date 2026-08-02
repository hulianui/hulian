"use client";
import { Plus, Search, Copy, ExternalLink, GripVertical } from "../../../../packages/ui/src/_icons";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Fab } from "../../../../packages/ui/src/fab/fab";
function FabBox({ withActions, label, draggable, }: {
    withActions?: boolean;
    label?: string;
    draggable?: boolean;
}) {
    return (<div className={`relative ${withActions ? "h-72" : "h-56"} w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border bg-surface-hover`}>
      <div className="p-4 text-sm text-muted">
        {draggable
            ? "Press and hold the floating button to drag it away (let go and stop in place)." : `Floating button in the lower right corner${withActions ? "(Click to expand sub-action)" : label ? "(extended capsule form)" : ""}.`}
      </div>
      <Fab className="absolute bottom-4 right-4" label={label} draggable={draggable} actions={withActions
            ? [
                { key: "search", icon: <Search className="size-5" aria-hidden/>, label: "Search" },
                { key: "copy", icon: <Copy className="size-5" aria-hidden/>, label: "Copy" },
                { key: "link", icon: <ExternalLink className="size-5" aria-hidden/>, label: "Share" },
            ]
            : undefined} icon={draggable ? (<GripVertical className="size-5" aria-hidden/>) : label ? (<ExternalLink className="size-5" aria-hidden/>) : (<Plus className="size-6" aria-hidden/>)}/>
    </div>);
}
export const fabShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "By default, fixed is attached to the lower right side of the viewport; without actions, the main button directly triggers onClick.",
            code: `<Fab icon={<Plus />} onClick={() => alert("New")} />`,
            render: () => <FabBox />,
        },
        {
            title: "Extended Capsules",
            description: "According to label, the rear main button changes from a circle to an \"icon + text\" adaptive width capsule.",
            code: `<Fab label="Return to sample library" icon={<ExternalLink />} />`,
            render: () => <FabBox label="Return to sample library"/>,
        },
        {
            title: "Speed-dial Sub-Action",
            description: "If actions is provided, click the main button to expand/collapse a group of sub-actions, and the main button icon will rotate 45\u00B0.",
            code: `<Fab
  actions={[
    { key: "search", icon: <Search />, label: "Search" },
    { key: "copy", icon: <Copy />, label: "Copy" },
    { key: "link", icon: <ExternalLink />, label: "Share" },
  ]}
/>`,
            render: () => <FabBox withActions/>,
        },
        {
            title: "Can be dragged",
            description: "draggable is closed by default (press and hold if not open). After turning it on, press and hold the main button to drag to any position; the displacement exceeds 3px as dragging, and raising your hand this time will not trigger onClick.",
            code: `<Fab draggable label="Hold and drag me" icon={<GripVertical />} onClick={() => alert("New")} />`,
            render: () => <FabBox draggable label="Hold and drag me"/>,
        },
    ],
    controls: [],
    states: [
        { name: "Single button", render: () => <FabBox /> },
        { name: "Extended capsule (with text)", render: () => <FabBox label="Return to sample library"/> },
        { name: "Speed-dial Sub-Action", render: () => <FabBox withActions/> },
        { name: "Draggable (draggable)", render: () => <FabBox draggable label="Hold and drag me"/> },
    ],
    renderWithProps: () => <FabBox withActions/>,
    toCode: () => `<Fab
  actions={[
    { key: "search", icon: <Search />, label: "Search" },
    { key: "share", icon: <Share />, label: "Share" },
  ]}
/>`,
};
