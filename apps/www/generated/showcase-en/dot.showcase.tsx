"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Dot } from "../../../../packages/ui/src/dot/dot";
export const dotShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Tone color",
            description: "tone provides neutral / brand / success / warning / danger five-level status colors.",
            code: `<>
  <Dot tone="neutral" />
  <Dot tone="brand" />
  <Dot tone="success" />
  <Dot tone="warning" />
  <Dot tone="danger" />
</>`,
            render: () => (<div className="flex items-center gap-3">
          <Dot tone="neutral"/>
          <Dot tone="brand"/>
          <Dot tone="success"/>
          <Dot tone="warning"/>
          <Dot tone="danger"/>
        </div>),
        },
        {
            title: "Dimensions",
            description: "size provides three gears sm / md / lg.",
            code: `<>
  <Dot size="sm" tone="brand" />
  <Dot size="md" tone="brand" />
  <Dot size="lg" tone="brand" />
</>`,
            render: () => (<div className="flex items-center gap-3">
          <Dot size="sm" tone="brand"/>
          <Dot size="md" tone="brand"/>
          <Dot size="lg" tone="brand"/>
        </div>),
        },
        {
            title: "Breathe (Online)",
            description: "pulse Add animate-ping diffusion animation to indicate the active state; pass label to let the screen reader broadcast the semantics.",
            code: `<Dot tone="success" pulse label="Online" />`,
            render: () => <Dot tone="success" pulse label="Online"/>,
        },
        {
            title: "Any color (chart legend)",
            description: "color connects to the semantic color name / any CSS color, the same resolveTone path as ChartSeries.color and Brand.color - the fifth gear tone cannot be connected chart-1..6. Note that style={{ color }} cannot change the dots (that is the text color and is silently disabled).",
            code: `<>
  <Dot color="chart-1" />
  <Dot color="chart-2" />
  <Dot color="chart-3" />
  <Dot color="#ff8800" />
</>`,
            render: () => (<div className="flex items-center gap-3">
          <Dot color="chart-1"/>
          <Dot color="chart-2"/>
          <Dot color="chart-3"/>
          <Dot color="#ff8800"/>
        </div>),
        },
        {
            title: "List leader tag",
            description: "Dot As an inline primitive, it is often used as the status leader point of list items.",
            code: `<span className="inline-flex items-center gap-2">
  <Dot tone="success" />
  The service is running
</span>`,
            render: () => (<span className="inline-flex items-center gap-2 text-sm text-foreground">
          <Dot tone="success"/>
          The service is running
        </span>),
        },
    ],
    controls: [
        {
            prop: "tone",
            type: "select",
            options: ["neutral", "brand", "success", "warning", "danger"],
            defaultValue: "success",
        },
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "pulse", type: "boolean", defaultValue: false, label: "Breathe" },
    ],
    states: [
        { name: "neutral", render: () => <Dot tone="neutral"/> },
        { name: "brand", render: () => <Dot tone="brand"/> },
        { name: "success", render: () => <Dot tone="success"/> },
        { name: "warning", render: () => <Dot tone="warning"/> },
        { name: "danger", render: () => <Dot tone="danger"/> },
        { name: "pulse (Online)", render: () => <Dot tone="success" pulse label="Online"/> },
        { name: "lg", render: () => <Dot size="lg" tone="brand"/> },
    ],
    renderWithProps: (p) => (<Dot tone={p.tone as "neutral" | "brand" | "success" | "warning" | "danger"} size={p.size as "sm" | "md" | "lg"} pulse={p.pulse as boolean}/>),
    toCode: (p) => `<Dot tone="${p.tone}" size="${p.size}"${p.pulse ? " pulse" : ""} />`,
};
