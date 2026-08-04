"use client";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Avatar } from "../../../../packages/ui/src/avatar";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Chip } from "../../../../packages/ui/src/chip/chip";
type Variant = "solid" | "soft" | "outline";
type Tone = "brand" | "danger" | "neutral";
function Removable() {
    const [items, setItems] = useState(["React", "Vue", "Svelte", "Solid"]);
    return (<div className="flex flex-wrap items-center gap-2">
      {items.map((t) => (<Chip key={t} onClose={() => setItems((s) => s.filter((x) => x !== t))}>
          {t}
        </Chip>))}
      {items.length === 0 && <span className="text-sm text-muted">Remove all</span>}
    </div>);
}
export const chipShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Variation and Tone",
            description: "variant (soft / solid / outline) \u00D7 tone (brand / danger / neutral) combined vision.",
            code: `<>
  <Chip tone="brand">Brand</Chip>
  <Chip variant="solid" tone="brand">Brand</Chip>
  <Chip variant="outline" tone="brand">Brand</Chip>
  <Chip tone="danger">Danger</Chip>
  <Chip tone="neutral">Neutral</Chip>
</>`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Chip tone="brand">Brand</Chip>
          <Chip variant="solid" tone="brand">Brand</Chip>
          <Chip variant="outline" tone="brand">Brand</Chip>
          <Chip tone="danger">Danger</Chip>
          <Chip tone="neutral">Neutral</Chip>
        </div>),
        },
        {
            title: "Preamble content",
            description: "Choose one visual indicator: a dot, a startContent icon, or an avatar (priority: avatar > startContent > dot).",
            code: `<>
  <Chip dot tone="brand">Online</Chip>
  <Chip tone="brand" startContent={<Sparkles className="size-3.5" />}>New</Chip>
  <Chip tone="brand" avatar={<Avatar fallback="Ann" />}>Anna</Chip>
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-2">
          <Chip dot tone="brand">Online</Chip>
          <Chip tone="brand" startContent={<Sparkles className="size-3.5"/>}>New</Chip>
          <Chip tone="brand" avatar={<Avatar fallback="Ann"/>}>Anna</Chip>
        </div>),
        },
        {
            title: "Removable",
            description: "Pass onClose to render the close (\u00D7) button. Click to trigger the callback to be removed by the caller.",
            code: `<Chip tone="brand" onClose={() => remove(item)}>
  React
</Chip>`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Chip tone="brand" onClose={() => { }}>React</Chip>
          <Chip tone="neutral" onClose={() => { }}>Vue</Chip>
        </div>),
        },
        {
            title: "Disabled",
            description: "isDisabled Reduce transparency, shield pointer, and close button cannot be clicked.",
            code: `<>
  <Chip isDisabled>Disabled</Chip>
  <Chip isDisabled onClose={() => {}}>Disable to close</Chip>
</>`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Chip isDisabled>Disabled</Chip>
          <Chip isDisabled onClose={() => { }}>Disable to turn off</Chip>
        </div>),
        },
    ],
    controls: [
        { prop: "variant", type: "select", options: ["soft", "solid", "outline"], defaultValue: "soft" },
        { prop: "tone", type: "select", options: ["brand", "danger", "neutral"], defaultValue: "brand" },
    ],
    states: [
        {
            name: "soft",
            render: () => (<div className="flex gap-2">
          <Chip tone="brand">Brand</Chip>
          <Chip tone="danger">Danger</Chip>
          <Chip tone="neutral">Neutral</Chip>
        </div>),
        },
        {
            name: "solid",
            render: () => (<div className="flex gap-2">
          <Chip variant="solid" tone="brand">Brand</Chip>
          <Chip variant="solid" tone="danger">Danger</Chip>
        </div>),
        },
        {
            name: "outline",
            render: () => (<div className="flex gap-2">
          <Chip variant="outline" tone="brand">Brand</Chip>
          <Chip variant="outline" tone="neutral">Neutral</Chip>
        </div>),
        },
        {
            name: "dot",
            render: () => (<div className="flex gap-2">
          <Chip dot tone="brand">Online</Chip>
          <Chip dot tone="danger">Offline</Chip>
        </div>),
        },
        {
            name: "avatar",
            render: () => (<div className="flex gap-2">
          <Chip tone="brand" avatar={<Avatar fallback="Ann"/>}>
            Anna
          </Chip>
          <Chip variant="outline" tone="neutral" avatar={<Avatar fallback="B"/>} onClose={() => { }}>
            Bob
          </Chip>
        </div>),
        },
        {
            name: "startContent",
            render: () => (<div className="flex gap-2">
          <Chip tone="brand" startContent={<Sparkles className="size-3.5"/>}>
            New
          </Chip>
          <Chip variant="solid" tone="brand" startContent={<Check className="size-3.5"/>}>
            Completed
          </Chip>
        </div>),
        },
        {
            name: "disabled",
            render: () => (<div className="flex gap-2">
          <Chip isDisabled>Disabled</Chip>
          <Chip isDisabled onClose={() => { }}>
            Disable to turn off
          </Chip>
        </div>),
        },
        { name: "removable", render: () => <Removable /> },
    ],
    renderWithProps: (p) => (<Chip variant={(p.variant as Variant) ?? "soft"} tone={(p.tone as Tone) ?? "brand"} onClose={() => { }}>
      Dismissible
    </Chip>),
    toCode: (p) => `<Chip${p.variant && p.variant !== "soft" ? ` variant="${p.variant}"` : ""}${p.tone && p.tone !== "brand" ? ` tone="${p.tone}"` : ""} onClose={() => {}}>Tag</Chip>`,
};
