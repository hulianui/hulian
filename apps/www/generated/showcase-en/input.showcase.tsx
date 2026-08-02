"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Input } from "../../../../packages/ui/src/input/input";
export const inputShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "A minimal input; use placeholder for empty-state guidance.",
            code: `<Input placeholder="Please enter..." className="w-64" />`,
            render: () => <Input placeholder="Please enter..." className="w-64"/>,
        },
        {
            title: "Prefix and suffix",
            description: "prefix / suffix slots embed units, currency symbols, etc.",
            code: `<Input prefix="\u00A5" suffix=".00" placeholder="0" className="w-64" />`,
            render: () => <Input prefix="¥" suffix=".00" placeholder="0" className="w-64"/>,
        },
        {
            title: "Dimensions",
            description: "size provides three gears: sm / md (default) / lg.",
            code: `<>
  <Input size="sm" placeholder="sm" className="w-64" />
  <Input size="md" placeholder="md" className="w-64" />
  <Input size="lg" placeholder="lg" className="w-64" />
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <Input size="sm" placeholder="sm" className="w-64"/>
          <Input size="md" placeholder="md" className="w-64"/>
          <Input size="lg" placeholder="lg" className="w-64"/>
        </div>),
        },
        {
            title: "Invalid state",
            description: "invalid marked with red border and focus ring (manual transmission when used independently).",
            code: `<Input invalid defaultValue="Wrong value" className="w-64" />`,
            render: () => <Input invalid defaultValue="Wrong value" className="w-64"/>,
        },
        {
            title: "Disabled",
            description: "disabled Reduce transparency and block interaction.",
            code: `<Input disabled defaultValue="Disabled" className="w-64" />`,
            render: () => <Input disabled defaultValue="Disabled" className="w-64"/>,
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "placeholder", type: "text", defaultValue: "Please enter...", label: "Placeholder" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
    ],
    states: [
        { name: "default", render: () => <Input placeholder="Please enter..." className="w-64"/> },
        { name: "Prefix and suffix", render: () => <Input prefix="¥" suffix=".00" placeholder="0" className="w-64"/> },
        { name: "invalid", render: () => <Input invalid defaultValue="Wrong value" className="w-64"/> },
        { name: "disabled", render: () => <Input disabled defaultValue="Disabled" className="w-64"/> },
        { name: "sm", render: () => <Input size="sm" placeholder="sm" className="w-64"/> },
        { name: "lg", render: () => <Input size="lg" placeholder="lg" className="w-64"/> },
    ],
    renderWithProps: (p) => (<Input size={p.size as "sm" | "md" | "lg"} placeholder={p.placeholder as string} invalid={p.invalid as boolean} disabled={p.disabled as boolean} className="w-64"/>),
    toCode: (p) => `<Input size="${p.size}" placeholder="${p.placeholder}"${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""} />`,
};
