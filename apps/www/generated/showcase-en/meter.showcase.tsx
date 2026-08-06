"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Meter } from "../../../../packages/ui/src/meter/meter";
export const meterShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in value to render the measurement bar (default 0\u2013100), and role=meter to express the static quantity ratio.",
            code: `<Meter value={64} />`,
            render: () => (<div className="w-64">
          <Meter value={64}/>
        </div>),
        },
        {
            title: "Labels and values",
            description: "label and showValue display descriptions and formatted values \u200B\u200Babove the track.",
            code: `<Meter value={72} label="Disk usage" showValue />`,
            render: () => (<div className="w-64">
          <Meter value={72} label="Disk usage" showValue/>
        </div>),
        },
        {
            title: "Customized range",
            description: "min/max Customize the upper and lower limits, and the values \u200B\u200Bare converted into proportions according to the interval.",
            code: `<Meter value={3.6} min={0} max={5} label="Rating" showValue />`,
            render: () => (<div className="w-64">
          <Meter value={3.6} min={0} max={5} label="Rating" showValue/>
        </div>),
        },
        {
            title: "Absolute wording",
            description: "formatValue takes over the value text, so the visible string and the aria-valuetext a screen reader announces are one and the same sentence.",
            code: `<Meter
  value={1041}
  max={1324}
  label="Linked to textbook"
  showValue
  formatValue={({ value, max }) => \`\${value} / \${max} questions\`}
/>`,
            render: () => (<div className="w-64">
          <Meter value={1041} max={1324} label="Linked to textbook" showValue formatValue={({ value, max }) => `${value} / ${max} questions`}/>
        </div>),
        },
        {
            title: "Different proportions",
            description: "The proportion is determined by value, and the width is calculated internally by Base UI.",
            code: `<>
  <Meter value={18} label="Power" showValue />
  <Meter value={100} label="Completion" showValue />
</>`,
            render: () => (<div className="flex w-64 flex-col gap-4">
          <Meter value={18} label="Battery" showValue/>
          <Meter value={100} label="Completion" showValue/>
        </div>),
        },
    ],
    controls: [
        { prop: "value", type: "number", defaultValue: 64 },
        { prop: "showValue", type: "boolean", defaultValue: true },
    ],
    states: [
        { name: "default", render: () => <div className="w-64"><Meter value={64}/></div> },
        { name: "with-label", render: () => <div className="w-64"><Meter value={72} label="Disk usage" showValue/></div> },
        { name: "low", render: () => <div className="w-64"><Meter value={18} label="Battery" showValue/></div> },
        { name: "full", render: () => <div className="w-64"><Meter value={100} label="Completion" showValue/></div> },
    ],
    renderWithProps: (p) => (<div className="w-64">
      <Meter value={(p.value as number) ?? 64} label="Dosage" showValue={p.showValue as boolean}/>
    </div>),
    toCode: (p) => `<Meter value={${(p.value as number) ?? 64}} label="Dosage"${p.showValue ? " showValue" : ""} />`,
};
