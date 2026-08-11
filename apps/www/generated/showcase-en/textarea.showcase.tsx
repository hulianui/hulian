"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Textarea } from "../../../../packages/ui/src/textarea/textarea";
export const textareaShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "For multi-line input, rows controls the initial number of visible lines (default 3).",
            code: `<Textarea placeholder="Write something..." className="w-64" />`,
            render: () => <Textarea placeholder="Write something…" className="w-64"/>,
        },
        {
            title: "Size",
            description: "size provides three levels of sm / md (default) / lg.",
            code: `<>
  <Textarea size="sm" placeholder="sm" className="w-64" />
  <Textarea size="md" placeholder="md" className="w-64" />
  <Textarea size="lg" placeholder="lg" className="w-64" />
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <Textarea size="sm" placeholder="sm" className="w-64"/>
          <Textarea size="md" placeholder="md" className="w-64"/>
          <Textarea size="lg" placeholder="lg" className="w-64"/>
        </div>),
        },
        {
            title: "Adaptive height",
            description: "autoResize automatically grows in height according to the content, and rows is used as the lower limit.",
            code: `<Textarea autoResize defaultValue={"Grow taller with the content\\n second line\\n third line"} className="w-64" />`,
            render: () => (<Textarea autoResize defaultValue={"Grow taller with content\nSecond line\nThird line"} className="w-64"/>),
        },
        {
            title: "Inline cell editing",
            description: "variant=\"cell\" strips the shell and hands height to CSS field-sizing: content (the rows lower bound already defaults to 1, so no per-cell value is needed). Focus shows a tinted background plus an inset underline instead of a ring, so nothing spills into the neighbouring cell.",
            code: `<Textarea variant="cell" defaultValue="Edit in place; a new line grows the box" aria-label="Note" />`,
            render: () => (<div className="w-64 rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
          <Textarea variant="cell" defaultValue={"Edit in place; a new line grows the box"} aria-label="Remarks"/>
        </div>),
        },
        {
            title: "Invalid state",
            description: "invalid marked with red border and focus ring (manual transmission when used independently).",
            code: `<Textarea invalid defaultValue="Wrong content" className="w-64" />`,
            render: () => <Textarea invalid defaultValue="Wrong content" className="w-64"/>,
        },
        {
            title: "Disabled",
            description: "disabled Reduce transparency and block interaction.",
            code: `<Textarea disabled defaultValue="Disabled" className="w-64" />`,
            render: () => <Textarea disabled defaultValue="Disabled" className="w-64"/>,
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["xs", "sm", "md", "lg"], defaultValue: "md" },
        { prop: "placeholder", type: "text", defaultValue: "Write something\u2026", label: "Placeholder" },
        { prop: "rows", type: "number", defaultValue: 3, label: "rows" },
        { prop: "autoResize", type: "boolean", defaultValue: false, label: "Adaptive height" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
    ],
    states: [
        { name: "default", render: () => <Textarea placeholder="Write something…" className="w-64"/> },
        {
            name: "autoResize",
            render: () => (<Textarea autoResize defaultValue={"Grow taller with content\nSecond line\nThird line\nFourth line"} className="w-64"/>),
        },
        {
            name: "cell",
            render: () => (<div className="w-64 rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
          <Textarea variant="cell" defaultValue="Edit in place" aria-label="Remarks"/>
        </div>),
        },
        { name: "invalid", render: () => <Textarea invalid defaultValue="Wrong content" className="w-64"/> },
        { name: "disabled", render: () => <Textarea disabled defaultValue="Disabled" className="w-64"/> },
    ],
    renderWithProps: (p) => (<Textarea size={p.size as "sm" | "md" | "lg"} placeholder={p.placeholder as string} rows={p.rows as number} autoResize={p.autoResize as boolean} invalid={p.invalid as boolean} disabled={p.disabled as boolean} className="w-64"/>),
    toCode: (p) => `<Textarea size="${p.size}" placeholder="${p.placeholder}" rows={${p.rows}}${p.autoResize ? " autoResize" : ""}${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""} />`,
};
