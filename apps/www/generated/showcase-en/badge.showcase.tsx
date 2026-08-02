"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Avatar } from "../../../../packages/ui/src/avatar";
import { Check } from "../../../../packages/ui/src/_icons";
import { Badge } from "../../../../packages/ui/src/badge/badge";
import type { BadgePlacement, BadgeTone } from "../../../../packages/ui/src/badge/badge.types";
function Host() {
    return <span className="block size-10 rounded-xl bg-surface-hover" aria-hidden/>;
}
export const badgeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Package Count",
            description: "When wrapping child elements, the sub-element overlaps to the upper right corner and displays 99+ when exceeding max.",
            code: `<>
  <Badge count={5}>
    <Icon />
  </Badge>
  <Badge count={1000} max={99}>
    <Icon />
  </Badge>
</>`,
            render: () => (<div className="flex items-center gap-6">
          <Badge count={5}>
            <Host />
          </Badge>
          <Badge count={1000} max={99}>
            <Host />
          </Badge>
        </div>),
        },
        {
            title: "Pure point",
            description: "dot only displays small dots and does not display numbers (commonly used for \"unread\" prompts).",
            code: `<Badge dot tone="danger">
  <Icon />
</Badge>`,
            render: () => (<Badge dot tone="danger">
          <Host />
        </Badge>),
        },
        {
            title: "Tone color",
            description: "tone provides danger (default)/brand/success/warning/neutral.",
            code: `<>
  <Badge count={3} tone="danger" />
  <Badge count={3} tone="brand" />
  <Badge count={3} tone="success" />
  <Badge count={3} tone="warning" />
</>`,
            render: () => (<div className="flex items-center gap-3">
          <Badge count={3} tone="danger"/>
          <Badge count={3} tone="brand"/>
          <Badge count={3} tone="success"/>
          <Badge count={3} tone="warning"/>
        </div>),
        },
        {
            title: "Avatar online status",
            description: "placement nails the corner mark to the specified corner; content puts custom content (such as green check) in the slot.",
            code: `<>
  <Badge dot tone="success" placement="bottom-right">
    <Avatar fallback="Hu" />
  </Badge>
  <Badge tone="success" placement="bottom-right" content={<Check className="size-2.5" />}>
    <Avatar fallback="EM" />
  </Badge>
</>`,
            render: () => (<div className="flex items-center gap-6">
          <Badge dot tone="success" placement="bottom-right">
            <Avatar fallback="Hu"/>
          </Badge>
          <Badge tone="success" placement="bottom-right" content={<Check className="size-2.5"/>}>
            <Avatar fallback="EM"/>
          </Badge>
        </div>),
        },
    ],
    controls: [
        { prop: "count", type: "number", defaultValue: 5, label: "Count" },
        { prop: "max", type: "number", defaultValue: 99, label: "Upper limit" },
        { prop: "dot", type: "boolean", defaultValue: false, label: "Pure point" },
        { prop: "showZero", type: "boolean", defaultValue: false, label: "Showing 0" },
        {
            prop: "tone",
            type: "select",
            options: ["danger", "brand", "success", "warning", "neutral"],
            defaultValue: "danger",
        },
        { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
        {
            prop: "placement",
            type: "select",
            options: ["top-right", "top-left", "bottom-right", "bottom-left"],
            defaultValue: "top-right",
        },
    ],
    states: [
        { name: "Independent counting", render: () => <Badge count={5}/> },
        { name: "Overflow 99+", render: () => <Badge count={1000} max={99}/> },
        { name: "Pure point", render: () => <Badge dot/> },
        {
            name: "Icon + Count",
            render: () => (<Badge count={1}>
          <Host />
        </Badge>),
        },
        {
            name: "Avatar + Green Check",
            render: () => (<Badge tone="success" placement="bottom-right" content={<Check className="size-2.5"/>}>
          <Avatar fallback="EM"/>
        </Badge>),
        },
        {
            name: "Avatar + Online Point",
            render: () => (<Badge dot tone="success" placement="bottom-right">
          <Avatar fallback="Hu"/>
        </Badge>),
        },
    ],
    renderWithProps: (p) => (<Badge count={p.count as number} max={p.max as number} dot={p.dot as boolean} showZero={p.showZero as boolean} tone={p.tone as BadgeTone} size={p.size as "sm" | "md"} placement={p.placement as BadgePlacement}>
      <Host />
    </Badge>),
    toCode: (p) => `<Badge count={${p.count}} max={${p.max}} tone="${p.tone}" placement="${p.placement}">
  <Icon />
</Badge>`,
};
