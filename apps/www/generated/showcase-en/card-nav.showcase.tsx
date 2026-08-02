"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CardNav } from "../../../../packages/ui/src/card-nav/card-nav";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-72 w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-muted/20 p-6">
      {children}
    </div>);
}
const items = [
    {
        label: "Products",
        bgColor: "var(--color-chart-1)",
        textColor: "var(--color-primary-foreground)",
        links: [
            { label: "Overview", href: "https://example.com/#overview" },
            { label: "Pricing", href: "https://example.com/#pricing" },
            { label: "Update log", href: "https://example.com/#changelog" },
        ],
    },
    {
        label: "Company",
        bgColor: "var(--color-chart-2)",
        textColor: "var(--color-primary-foreground)",
        links: [
            { label: "About Us", href: "https://example.com/#about" },
            { label: "Recruitment", href: "https://example.com/#careers" },
        ],
    },
    {
        label: "Resources",
        bgColor: "var(--color-chart-4)",
        textColor: "var(--color-primary-foreground)",
        links: [
            { label: "Documentation", href: "https://example.com/#docs" },
            { label: "Community", href: "https://example.com/#community" },
        ],
    },
];
function ControlledCardNav({ defaultOpen, ...rest }: {
    defaultOpen?: boolean;
} & React.ComponentProps<typeof CardNav>) {
    const [open, setOpen] = useState(defaultOpen ?? false);
    return <CardNav {...rest} open={open} onOpenChange={setOpen}/>;
}
export const cardNavShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The top bar contains a menu button, brand, and CTA. Click the menu button to expand the capsule and reveal each card in sequence. In uncontrolled mode, the component manages its own open state.",
            code: `<CardNav
  brand="Hulian UI"
  ctaLabel="Get started"
  items={[
    { label: "Product", bgColor: "var(--color-chart-1)", links: [{ label: "Overview", href: "#" }] },
    { label: "Company", bgColor: "var(--color-chart-2)", links: [{ label: "About", href: "#" }] },
    { label: "Resources", bgColor: "var(--color-chart-4)", links: [{ label: "Documents", href: "#" }] },
  ]}
/>`,
            render: () => (<Stage>
          <CardNav brand="Hulian UI" items={items} ctaLabel="Get started"/>
        </Stage>),
        },
        {
            title: "Default expansion (controlled)",
            description: "Incoming open + onOpenChange is opened and closed externally; it is expanded by default to display the card's staggered display.",
            code: `const [open, setOpen] = useState(true);

<CardNav
  brand="Hulian UI"
  ctaLabel="Get started"
  items={items}
  open={open}
  onOpenChange={setOpen}
/>`,
            render: () => (<Stage>
          <ControlledCardNav brand="Hulian UI" items={items} ctaLabel="Get started" defaultOpen/>
        </Stage>),
        },
        {
            title: "None CTA",
            description: "ctaLabel Pass null Hide the CTA button on the right, pure text brand + card navigation.",
            code: `<CardNav brand="HanShip" items={items} ctaLabel={null} />`,
            render: () => (<Stage>
          <ControlledCardNav brand="HanShip" items={items} ctaLabel={null} defaultOpen/>
        </Stage>),
        },
        {
            title: "token Card (eating theme)",
            description: "Without bgColor or textColor, the card uses Hulian tokens and adapts to the active theme.",
            code: `<CardNav
  brand="Hulian"
  items={[
    { label: "Product", links: [{ label: "Overview", href: "#" }] },
    { label: "Company", links: [{ label: "About Us", href: "#" }] },
    { label: "Resources", links: [{ label: "Documents", href: "#" }] },
  ]}
/>`,
            render: () => (<Stage>
          <ControlledCardNav brand="Hulian" items={items.map(({ bgColor, textColor, ...rest }) => rest)} defaultOpen/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "ctaLabel", type: "text", defaultValue: "Get started", label: "CTA Copywriting" },
        { prop: "duration", type: "number", defaultValue: 0.4, label: "Animation seconds" },
        { prop: "open", type: "boolean", defaultValue: true, label: "Expanded state" },
    ],
    states: [
        {
            name: "default (collapsed \u00B7 click the menu button to expand)",
            render: () => (<Stage>
          <CardNav brand="Hulian UI" items={items} ctaLabel="Get started"/>
        </Stage>),
        },
        {
            name: "Expand by default (cards appear at staggered times)",
            render: () => (<Stage>
          <ControlledCardNav brand="Hulian UI" items={items} ctaLabel="Get started" defaultOpen/>
        </Stage>),
        },
        {
            name: "None CTA \u00B7 Pure text brand",
            render: () => (<Stage>
          <ControlledCardNav brand="HanShip" items={items} ctaLabel={null} defaultOpen/>
        </Stage>),
        },
        {
            name: "token card (no color specified \u00B7 Eat theme)",
            render: () => (<Stage>
          <ControlledCardNav brand="Hulian" items={items.map(({ bgColor, textColor, ...rest }) => rest)} defaultOpen/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <CardNav brand="Hulian UI" items={items} ctaLabel={(p.ctaLabel as string) || null} duration={p.duration as number} open={p.open as boolean} onOpenChange={() => { }}/>
    </Stage>),
    toCode: (p) => [
        `<CardNav`,
        `  brand="Hulian UI"`,
        `  ctaLabel=${p.ctaLabel ? `"${p.ctaLabel}"` : "{null}"}`,
        `  duration={${p.duration}}`,
        `  items={[`,
        `    { label: "Product", bgColor: "var(--color-chart-1)", links: [{ label: "Overview", href: "#" }] },`,
        `    { label: "Company", bgColor: "var(--color-chart-2)", links: [{ label: "About", href: "#" }] },`,
        `    { label: "Resources", bgColor: "var(--color-chart-4)", links: [{ label: "Documents", href: "#" }] },`,
        `  ]}`,
        `/>`,
    ].join("\n"),
};
