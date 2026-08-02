"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { BubbleMenu } from "../../../../packages/ui/src/bubble-menu/bubble-menu";
import type { BubbleMenuItem } from "../../../../packages/ui/src/bubble-menu/bubble-menu.types";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-96 w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
const LOGO = <span className="text-sm font-semibold text-foreground">Hulian</span>;
const FEW: BubbleMenuItem[] = [
    { label: "Home", href: "#", rotation: -6, hoverStyles: { bgColor: "var(--color-chart-1)", textColor: "var(--color-primary-foreground)" } },
    { label: "Documentation", href: "#", rotation: 6, hoverStyles: { bgColor: "var(--color-chart-2)", textColor: "var(--color-primary-foreground)" } },
    { label: "Contact", href: "#", rotation: -4, hoverStyles: { bgColor: "var(--color-chart-3)", textColor: "var(--color-primary-foreground)" } },
];
export const bubbleMenuShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "logo Bubble + hamburger switch button, click the switch button to expand the full-screen capsule navigation. The built-in 5 examples are used by default; relative + height-fixing container anchor absolute is required for positioning.",
            code: `<div className="relative h-96 overflow-hidden rounded-xl border">
  <BubbleMenu logo={<span>Hulian</span>} />
</div>`,
            render: () => (<Stage>
          <BubbleMenu logo={LOGO}/>
        </Stage>),
        },
        {
            title: "Custom menu items",
            description: "items Customized capsules: label / href, rotation creates a sense of hand-made staggering, hoverStyles is set to hover to reverse color (it is recommended to eat chart token).",
            code: `const items = [
  { label: "Home", href: "#", rotation: -6,
    hoverStyles: { bgColor: "var(--color-chart-1)", textColor: "var(--color-primary-foreground)" } },
  { label: "Document", href: "#", rotation: 6,
    hoverStyles: { bgColor: "var(--color-chart-2)", textColor: "var(--color-primary-foreground)" } },
  { label: "Contact", href: "#", rotation: -4,
    hoverStyles: { bgColor: "var(--color-chart-3)", textColor: "var(--color-primary-foreground)" } },
];

<BubbleMenu logo={<span>Hulian</span>} items={items} />`,
            render: () => (<Stage>
          <BubbleMenu logo={LOGO} items={FEW}/>
        </Stage>),
        },
        {
            title: "Entry rhythm",
            description: "animationDuration adjusts the ejection time of a single capsule, staggerDelay adjusts the peak stagger delay of adjacent capsules, the smaller the more compact it is.",
            code: `<BubbleMenu
  logo={<span>Hulian</span>}
  items={items}
  animationDuration={0.3}
  staggerDelay={0.05}
/>`,
            render: () => (<Stage>
          <BubbleMenu logo={LOGO} items={FEW} animationDuration={0.3} staggerDelay={0.05}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "animationDuration", type: "number", defaultValue: 0.5, label: "Admission duration seconds" },
        { prop: "staggerDelay", type: "number", defaultValue: 0.12, label: "Peak shifting delay seconds" },
        { prop: "useFixedPosition", type: "boolean", defaultValue: false, label: "fixed Positioning" },
    ],
    states: [
        {
            name: "default (default 5 items\u00B7click the toggle button to expand)",
            render: () => (<Stage>
          <BubbleMenu logo={LOGO}/>
        </Stage>),
        },
        {
            name: "Customize three items (chart token reverse color)",
            render: () => (<Stage>
          <BubbleMenu logo={LOGO} items={FEW}/>
        </Stage>),
        },
        {
            name: "Enter quickly\u00B7Small peak shift",
            render: () => (<Stage>
          <BubbleMenu logo={LOGO} items={FEW} animationDuration={0.3} staggerDelay={0.05}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <BubbleMenu logo={LOGO} animationDuration={p.animationDuration as number} staggerDelay={p.staggerDelay as number} useFixedPosition={p.useFixedPosition as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-96 overflow-hidden rounded-xl">`,
        `  <BubbleMenu`,
        `    logo={<span>Hulian</span>}`,
        `    animationDuration={${p.animationDuration}}`,
        `    staggerDelay={${p.staggerDelay}}`,
        `    useFixedPosition={${p.useFixedPosition}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
