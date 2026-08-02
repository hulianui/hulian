"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Separator } from "../../../../packages/ui/src/separator/separator";
function Horizontal() {
    return (<div className="w-48">
      <p className="text-sm text-foreground">Hulian Design System</p>
      <Separator className="my-3"/>
      <p className="text-sm text-muted">Absorption aggregation component library</p>
    </div>);
}
function Vertical() {
    return (<div className="flex h-6 items-center gap-3 text-sm text-muted">
      <span>Documentation</span>
      <Separator orientation="vertical"/>
      <span>Components</span>
      <Separator orientation="vertical"/>
      <span>Theme</span>
    </div>);
}
export const separatorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Horizontal separation",
            description: "In the default direction, a horizontal line filling the width is rendered to separate the upper and lower content.",
            code: `<div className="w-48">
  <p>Hulian Design System</p>
  <Separator className="my-3" />
  <p>Suction-type aggregation component library</p>
</div>`,
            render: () => <Horizontal />,
        },
        {
            title: "Vertical separation",
            description: "Use orientation=\"vertical\" to draw vertical lines to the full height inside the flex container.",
            code: `<div className="flex h-6 items-center gap-3">
  <span>Documentation</span>
  <Separator orientation="vertical" />
  <span>Component</span>
  <Separator orientation="vertical" />
  <span>Theme</span>
</div>`,
            render: () => <Vertical />,
        },
    ],
    controls: [
        { prop: "orientation", type: "select", options: ["horizontal", "vertical"], defaultValue: "horizontal" },
    ],
    states: [
        { name: "horizontal", render: () => <Horizontal /> },
        { name: "vertical", render: () => <Vertical /> },
    ],
    renderWithProps: (p) => (p.orientation === "vertical" ? <Vertical /> : <Horizontal />),
    toCode: (p) => `<Separator${p.orientation === "vertical" ? " orientation=\"vertical\"" : ""} />`,
};
