"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../../../../packages/ui/src/hover-card/hover-card";
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
function Demo({ side = "bottom", align = "center" }: {
    side?: Side;
    align?: Align;
}) {
    return (<HoverCard>
      <HoverCardTrigger render={<button type="button" className="font-medium text-primary underline decoration-dotted underline-offset-4 outline-none">
            @Hulian design system
          </button>}/>
      <HoverCardContent side={side} align={align}>
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
            Hu
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Hulian Design System</p>
            <p className="text-xs text-muted">Absorb the best implementations from various companies and unify them into a set of Hulian API + light and dark token.</p>
            <p className="text-xs text-muted">Hover to expand · Remove delayed closing</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>);
}
export const hoverCardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The information card is delayed when hovering the link/entry, and is closed when moved out; it is non-modal, does not lock the scroll, and does not grab the focus.",
            code: `<HoverCard>
  <HoverCardTrigger render={<button type="button">@HulianDesignSystem</button>} />
  <HoverCardContent>
    <div className="flex gap-3">
      <div className="size-10 rounded-full bg-primary/12">hu</div>
      <div>
        <p>Hulian Design System</p>
        <p> Absorb the best implementations from various companies and unify them into a set of Hulian API + light and dark token. </p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>`,
            render: () => <Demo />,
        },
        {
            title: "Pop-up direction",
            description: "side controls the orientation of the card relative to the trigger, and the arrow automatically continues on the corresponding edge.",
            code: `<>
  <HoverCard>
    <HoverCardTrigger render={<button type="button">Expand upward</button>} />
    <HoverCardContent side="top">{/* Avatar + Introduction */}</HoverCardContent>
  </HoverCard>
  <HoverCard>
    <HoverCardTrigger render={<button type="button">Expand right</button>} />
    <HoverCardContent side="right">{/* Avatar + Introduction */}</HoverCardContent>
  </HoverCard>
</>`,
            render: () => (<div className="flex flex-wrap gap-8">
          <Demo side="top"/>
          <Demo side="right"/>
        </div>),
        },
    ],
    controls: [
        { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "bottom" },
        { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "center" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "top", render: () => <Demo side="top"/> },
        { name: "right", render: () => <Demo side="right"/> },
    ],
    renderWithProps: (p) => <Demo side={p.side as Side} align={p.align as Align}/>,
    toCode: (p) => `<HoverCard>
  <HoverCardTrigger render={<a>@Hulian</a>} />
  <HoverCardContent side="${p.side}" align="${p.align}">
    {/* Avatar + Introduction */}
  </HoverCardContent>
</HoverCard>`,
};
