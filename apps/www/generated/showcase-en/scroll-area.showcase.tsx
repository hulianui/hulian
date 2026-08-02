"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ScrollArea } from "../../../../packages/ui/src/scroll-area/scroll-area";
const paragraphs = Array.from({ length: 12 }, (_, i) => i + 1);
function Vertical() {
    return (<ScrollArea className="h-48 w-72 border border-border bg-surface p-4">
      <h4 className="mb-2 font-medium text-foreground">Update log</h4>
      <div className="space-y-2 text-sm text-muted">
        {paragraphs.map((n) => (<p key={n}>No. {n} Article: Hulian's abstract aggregation component library absorbs the best implementations from various React libraries and unifies them into a set of API and light and dark token.</p>))}
      </div>
    </ScrollArea>);
}
function Horizontal() {
    return (<ScrollArea orientation="horizontal" className="w-72 border border-border bg-surface p-4">
      <div className="flex gap-3">
        {paragraphs.map((n) => (<div key={n} className="flex h-20 w-28 shrink-0 items-center justify-center rounded-[var(--radius)] bg-surface-hover text-sm text-muted">
            Card {n}
          </div>))}
      </div>
    </ScrollArea>);
}
function Both() {
    return (<ScrollArea orientation="both" className="h-48 w-72 border border-border bg-surface p-4">
      <div className="space-y-3">
        {paragraphs.map((n) => (<p key={n} className="whitespace-nowrap text-sm text-muted">
            No. {n} Line: This is a long text that does not wrap into new lines. It is used to simultaneously support the horizontal and vertical scroll bars and the lower right corner corner.
          </p>))}
      </div>
    </ScrollArea>);
}
export const scrollAreaShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Vertical scroll",
            description: "Default orientation=vertical, a thin scroll bar is displayed when the content exceeds the height of the container.",
            code: `<ScrollArea className="h-48 w-72 border border-border p-4">
  {/* Content exceeding the height of the container */}
</ScrollArea>`,
            render: () => <Vertical />,
        },
        {
            title: "Horizontal scrolling",
            description: "orientation=horizontal, with a row of flex cards for horizontal browsing.",
            code: `<ScrollArea orientation="horizontal" className="w-72 border border-border p-4">
  <div className="flex gap-3">{/* Cards */}</div>
</ScrollArea>`,
            render: () => <Horizontal />,
        },
        {
            title: "Bidirectional scrolling",
            description: "orientation=both, horizontal and vertical scroll bars appear at the same time and corner is added in the lower right corner.",
            code: `<ScrollArea orientation="both" className="h-48 w-72 border border-border p-4">
  {/* wide and tall content */}
</ScrollArea>`,
            render: () => <Both />,
        },
    ],
    controls: [{ prop: "orientation", type: "select", options: ["vertical", "horizontal"], defaultValue: "vertical" }],
    states: [
        { name: "vertical", render: () => <Vertical /> },
        { name: "horizontal", render: () => <Horizontal /> },
    ],
    renderWithProps: (p) => (p.orientation === "horizontal" ? <Horizontal /> : <Vertical />),
    toCode: (p) => `<ScrollArea${p.orientation === "horizontal" ? " orientation=\"horizontal\"" : ""} className="h-48 w-72">
  {/* Content */}
</ScrollArea>`,
};
