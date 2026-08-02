"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ScrollStack, ScrollStackItem } from "../../../../packages/ui/src/scroll-stack/scroll-stack";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="h-[28rem] w-full max-w-xl overflow-hidden rounded-xl border border-border bg-muted/10">
      {children}
    </div>);
}
const CARDS = [
    { title: "Collection", desc: "Multi-source data access and cleaning, unified into the metadata layer." },
    { title: "Modeling", desc: "Low-code visual modeling, precipitating business semantics." },
    { title: "Arrangement", desc: "The node canvas arranges task links and executes them in topological order." },
    { title: "Insights", desc: "Real-time large screen and indicator board drive decision-making closed loop." },
];
function Deck(props: Parameters<typeof ScrollStack>[0]) {
    return (<Stage>
      <ScrollStack {...props}>
        {CARDS.map((c, i) => (<ScrollStackItem key={c.title}>
            <div className="flex h-full flex-col justify-between">
              <span className="text-xs font-medium text-muted">0{i + 1}</span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{c.title}</h3>
                <p className="mt-1 text-sm text-muted">{c.desc}</p>
              </div>
            </div>
          </ScrollStackItem>))}
      </ScrollStack>
    </Stage>);
}
export const scrollStackShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Wrap each card in ScrollStackItem, each card being pinned to the top, stacked one on top of another, and scaled as you scroll down. A fixed-height container with a rollable interior is required.",
            code: `<div className="h-[28rem] overflow-hidden rounded-xl border border-border">
  <ScrollStack>
    <ScrollStackItem>Card 1</ScrollStackItem>
    <ScrollStackItem>Card 2</ScrollStackItem>
    <ScrollStackItem>Card 3</ScrollStackItem>
  </ScrollStack>
</div>`,
            render: () => <Deck />,
        },
        {
            title: "Sector rotation",
            description: "rotationAmount Superimpose rotation increments on each layer of cards to form a poker-like fan-shaped dislocation.",
            code: `<ScrollStack rotationAmount={3}>
  <ScrollStackItem>Card 1</ScrollStackItem>
  <ScrollStackItem>Card 2</ScrollStackItem>
</ScrollStack>`,
            render: () => <Deck rotationAmount={3}/>,
        },
        {
            title: "Blurred depth of field",
            description: "When blurAmount > 0, the cards further down are blurred to enhance depth; when reduced-motion, it is automatically turned off.",
            code: `<ScrollStack blurAmount={2}>
  <ScrollStackItem>Card 1</ScrollStackItem>
  <ScrollStackItem>Card 2</ScrollStackItem>
</ScrollStack>`,
            render: () => <Deck blurAmount={2}/>,
        },
        {
            title: "Compact stacking",
            description: "Make itemDistance smaller, baseScale larger, and itemStackDistance shorter to make the card more tightly packed.",
            code: `<ScrollStack itemDistance={60} baseScale={0.92} itemStackDistance={20}>
  <ScrollStackItem>Card 1</ScrollStackItem>
  <ScrollStackItem>Card 2</ScrollStackItem>
</ScrollStack>`,
            render: () => (<Deck itemDistance={60} baseScale={0.92} itemStackDistance={20}/>),
        },
    ],
    controls: [
        { prop: "itemDistance", type: "number", defaultValue: 100, label: "Card spacing px" },
        { prop: "itemScale", type: "number", defaultValue: 0.03, label: "Zoom increment" },
        { prop: "baseScale", type: "number", defaultValue: 0.85, label: "Basic scaling" },
        { prop: "rotationAmount", type: "number", defaultValue: 0, label: "Rotation increment deg" },
        { prop: "blurAmount", type: "number", defaultValue: 0, label: "Depth of field blur px" },
    ],
    states: [
        {
            name: "default (Scroll down to see card stack)",
            render: () => <Deck />,
        },
        {
            name: "Sector rotation (rotationAmount=3)",
            render: () => <Deck rotationAmount={3}/>,
        },
        {
            name: "Depth of field blur (blurAmount=2)",
            render: () => <Deck blurAmount={2}/>,
        },
        {
            name: "Compact stacking (small spacing + high base scaling)",
            render: () => <Deck itemDistance={60} baseScale={0.92} itemStackDistance={20}/>,
        },
    ],
    renderWithProps: (p) => (<Deck itemDistance={p.itemDistance as number} itemScale={p.itemScale as number} baseScale={p.baseScale as number} rotationAmount={p.rotationAmount as number} blurAmount={p.blurAmount as number}/>),
    toCode: (p) => [
        `<div className="h-[28rem] overflow-hidden rounded-xl border border-border">`,
        `  <ScrollStack`,
        `    itemDistance={${p.itemDistance}}`,
        `    itemScale={${p.itemScale}}`,
        `    baseScale={${p.baseScale}}`,
        `    rotationAmount={${p.rotationAmount}}`,
        `    blurAmount={${p.blurAmount}}`,
        `  >`,
        `    <ScrollStackItem>Card 1</ScrollStackItem>`,
        `    <ScrollStackItem>Card 2</ScrollStackItem>`,
        `    <ScrollStackItem>Card 3</ScrollStackItem>`,
        `  </ScrollStack>`,
        `</div>`,
    ].join("\n"),
};
