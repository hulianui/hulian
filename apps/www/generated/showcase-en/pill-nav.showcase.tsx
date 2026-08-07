"use client";
import { useId } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PillNav } from "../../../../packages/ui/src/pill-nav/pill-nav";
const KEYS = ["home", "features", "pricing", "docs"] as const;
const LABEL: Record<(typeof KEYS)[number], string> = {
    home: "Home",
    features: "Features",
    pricing: "Pricing",
    docs: "Docs",
};
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative flex min-h-32 w-full max-w-xl items-center justify-center rounded-xl border border-border bg-subtle p-8">
      {children}
    </div>);
}
function PillNavDemo({ active = "home", ...props }: {
    active?: (typeof KEYS)[number];
} & Omit<Parameters<typeof PillNav>[0], "items" | "activeHref">) {
    const id = useId().replace(/:/g, "");
    const anchor = (key: string) => `#${id}-${key}`;
    return (<Stage>
      {KEYS.map((key) => (<span key={key} id={`${id}-${key}`} className="absolute size-0" aria-hidden/>))}
      <PillNav items={KEYS.map((key) => ({ href: anchor(key), label: LABEL[key] }))} activeHref={anchor(active)} {...props}/>
    </Stage>);
}
function Mark() {
    return (<span className="grid size-full place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      Hu
    </span>);
}
export const pillNavShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Input items and activeHref, activate the item to stay in the inverted state and light up the indicator dot.",
            code: `<PillNav
  items={[
    { href: "#home", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#docs", label: "Docs" },
  ]}
  activeHref="#home"
/>`,
            render: () => (<PillNavDemo active="home"/>),
        },
        {
            title: "With brand logo",
            description: "The logo slot renders the circular logo on the left side. When hovering, the entire logo rotates in one circle.",
            code: `<PillNav items={items} activeHref="#features" logo={<Mark />} />`,
            render: () => (<PillNavDemo active="features" logo={<Mark />}/>),
        },
        {
            title: "Close entrance animation",
            description: "initialLoadAnimation={false} Skip the pop-up/expand animation for the first load.",
            code: `<PillNav
  items={items}
  activeHref="#pricing"
  logo={<Mark />}
  initialLoadAnimation={false}
/>`,
            render: () => (<PillNavDemo active="pricing" logo={<Mark />} initialLoadAnimation={false}/>),
        },
    ],
    controls: [
        {
            prop: "activeHref",
            type: "select",
            options: ["#home", "#features", "#pricing", "#docs"],
            defaultValue: "#home",
            label: "Activation Item",
        },
        { prop: "withLogo", type: "boolean", defaultValue: true, label: "Show logo" },
        { prop: "initialLoadAnimation", type: "boolean", defaultValue: true, label: "Entrance animation" },
    ],
    states: [
        {
            name: "default (with logo \u00B7 First activation)",
            render: () => (<PillNavDemo active="home" logo={<Mark />}/>),
        },
        {
            name: "None logo (Pure navigation)",
            render: () => (<PillNavDemo active="features"/>),
        },
        {
            name: "Close entrance animation",
            render: () => (<PillNavDemo active="pricing" logo={<Mark />} initialLoadAnimation={false}/>),
        },
    ],
    renderWithProps: (p) => (<PillNavDemo active={(p.activeHref as string).replace("#", "") as "home"} logo={p.withLogo ? <Mark /> : undefined} initialLoadAnimation={p.initialLoadAnimation as boolean}/>),
    toCode: (p) => [
        `<PillNav`,
        `  items={[`,
        `    { href: "#home", label: "Home" },`,
        `    { href: "#features", label: "Features" },`,
        `    { href: "#pricing", label: "Pricing" },`,
        `    { href: "#docs", label: "Docs" },`,
        `  ]}`,
        `  activeHref="${p.activeHref}"`,
        p.withLogo ? `  logo={<Mark />}` : null,
        `  initialLoadAnimation={${p.initialLoadAnimation}}`,
        `/>`,
    ]
        .filter(Boolean)
        .join("\n"),
};
