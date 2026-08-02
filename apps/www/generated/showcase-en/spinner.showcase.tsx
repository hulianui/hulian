"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Spinner } from "../../../../packages/ui/src/spinner/spinner";
type Size = "sm" | "md" | "lg";
type Tone = "primary" | "current" | "muted";
export const spinnerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Default md size, primary color rotation indicator, pure CSS animation, can be RSC.",
            code: `<Spinner />`,
            render: () => <Spinner />,
        },
        {
            title: "Three sizes",
            description: "size Control size: sm / md / lg.",
            code: `<>
  <Spinner size="sm" />
  <Spinner size="md" />
  <Spinner size="lg" />
</>`,
            render: () => (<div className="flex items-center gap-6">
          <Spinner size="sm"/>
          <Spinner size="md"/>
          <Spinner size="lg"/>
        </div>),
        },
        {
            title: "Hue",
            description: "tone switches the semantic color, current follows the parent text color, and can be placed in dark buttons.",
            code: `<>
  <Spinner tone="primary" />
  <Spinner tone="muted" />
  <span className="text-danger"><Spinner tone="current" /></span>
</>`,
            render: () => (<div className="flex items-center gap-6">
          <Spinner tone="primary"/>
          <Spinner tone="muted"/>
          <span className="text-danger">
            <Spinner tone="current"/>
          </span>
        </div>),
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "tone", type: "select", options: ["primary", "current", "muted"], defaultValue: "primary" },
    ],
    states: [
        { name: "sm", render: () => <Spinner size="sm"/> },
        { name: "md", render: () => <Spinner size="md"/> },
        { name: "lg", render: () => <Spinner size="lg"/> },
        { name: "muted", render: () => <Spinner tone="muted"/> },
    ],
    renderWithProps: (p) => <Spinner size={(p.size as Size) ?? "md"} tone={(p.tone as Tone) ?? "primary"}/>,
    toCode: (p) => `<Spinner${p.size && p.size !== "md" ? ` size="${p.size}"` : ""}${p.tone && p.tone !== "primary" ? ` tone="${p.tone}"` : ""} />`,
};
