import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PillNav } from "../../../../packages/ui/src/pill-nav/pill-nav";
const items = [
    { href: "https://example.com/#home", label: "Home" },
    { href: "https://example.com/#features", label: "Features" },
    { href: "https://example.com/#pricing", label: "Pricing" },
    { href: "https://example.com/#docs", label: "Docs" },
];
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex min-h-32 w-full max-w-xl items-center justify-center rounded-xl border border-border bg-muted/30 p-8">
      {children}
    </div>);
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
            render: () => (<Stage>
          <PillNav items={items} activeHref="https://example.com/#home"/>
        </Stage>),
        },
        {
            title: "With brand logo",
            description: "The logo slot renders the circular logo on the left side. When hovering, the entire logo rotates in one circle.",
            code: `<PillNav items={items} activeHref="#features" logo={<Mark />} />`,
            render: () => (<Stage>
          <PillNav items={items} activeHref="#features" logo={<Mark />}/>
        </Stage>),
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
            render: () => (<Stage>
          <PillNav items={items} activeHref="#pricing" logo={<Mark />} initialLoadAnimation={false}/>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "activeHref",
            type: "select",
            options: ["#home", "#features", "#pricing", "#docs"],
            defaultValue: "#home",
            label: "Activation",
        },
        { prop: "withLogo", type: "boolean", defaultValue: true, label: "Show logo" },
        { prop: "initialLoadAnimation", type: "boolean", defaultValue: true, label: "Entrance animation" },
    ],
    states: [
        {
            name: "default (with logo \u00B7 First activation)",
            render: () => (<Stage>
          <PillNav items={items} activeHref="#home" logo={<Mark />}/>
        </Stage>),
        },
        {
            name: "None logo (Pure navigation)",
            render: () => (<Stage>
          <PillNav items={items} activeHref="#features"/>
        </Stage>),
        },
        {
            name: "Close entrance animation",
            render: () => (<Stage>
          <PillNav items={items} activeHref="#pricing" logo={<Mark />} initialLoadAnimation={false}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <PillNav items={items} activeHref={p.activeHref as string} logo={p.withLogo ? <Mark /> : undefined} initialLoadAnimation={p.initialLoadAnimation as boolean}/>
    </Stage>),
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
