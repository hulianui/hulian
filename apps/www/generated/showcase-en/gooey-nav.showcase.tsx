"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GooeyNav } from "../../../../packages/ui/src/gooey-nav/gooey-nav";
const items = [
    { label: "Home", href: "#" },
    { label: "Products", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "About", href: "#" },
];
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex h-40 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.16 0.02 265)" }}>
      {children}
    </div>);
}
export const gooeyNavShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Just pass in the navigation item array. When you click to switch, the pill will slide and emit colored particles.",
            code: `<div
  className="flex h-40 items-center justify-center rounded-xl"
  style={{ background: "oklch(0.16 0.02 265)" }}
>
  <GooeyNav
    items={[
      { label: "Home", href: "#" },
      { label: "Product", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "About", href: "#" },
    ]}
  />
</div>`,
            render: () => (<Stage>
          <GooeyNav items={items}/>
        </Stage>),
        },
        {
            title: "Specify initial selection",
            description: "Set the uncontrolled initial highlight position via initialActiveIndex.",
            code: `<GooeyNav items={items} initialActiveIndex={2} />`,
            render: () => (<Stage>
          <GooeyNav items={items} initialActiveIndex={2}/>
        </Stage>),
        },
        {
            title: "Dense particles",
            description: "Increase the particleCount and increase the explosion radius to make the explosion more brilliant.",
            code: `<GooeyNav
  items={items}
  particleCount={24}
  particleDistances={[110, 14]}
/>`,
            render: () => (<Stage>
          <GooeyNav items={items} particleCount={24} particleDistances={[110, 14]}/>
        </Stage>),
        },
        {
            title: "Warm color palette",
            description: "colors Get the Hulian chart token serial number and customize the particle color matching.",
            code: `<GooeyNav items={items} colors={[3, 4, 5, 3]} initialActiveIndex={1} />`,
            render: () => (<Stage>
          <GooeyNav items={items} colors={[3, 4, 5, 3]} initialActiveIndex={1}/>
        </Stage>),
        },
        {
            title: "Pill slide only (particles off)",
            description: "particleCount={0} Turns off the burst, leaving only the smooth sliding of the pill.",
            code: `<GooeyNav items={items} particleCount={0} />`,
            render: () => (<Stage>
          <GooeyNav items={items} particleCount={0}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "particleCount", type: "number", defaultValue: 14, label: "Number of particles" },
        { prop: "animationTime", type: "number", defaultValue: 600, label: "Animation ms" },
        { prop: "initialActiveIndex", type: "number", defaultValue: 0, label: "Initial selection" },
    ],
    states: [
        {
            name: "default (click to switch to see the shot)",
            render: () => (<Stage>
          <GooeyNav items={items}/>
        </Stage>),
        },
        {
            name: "Dense particles",
            render: () => (<Stage>
          <GooeyNav items={items} particleCount={24} particleDistances={[110, 14]}/>
        </Stage>),
        },
        {
            name: "Warm Particle Palette",
            render: () => (<Stage>
          <GooeyNav items={items} colors={[3, 4, 5, 3]} initialActiveIndex={1}/>
        </Stage>),
        },
        {
            name: "Turn off particles (pill sliding only)",
            render: () => (<Stage>
          <GooeyNav items={items} particleCount={0}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <GooeyNav items={items} particleCount={p.particleCount as number} animationTime={p.animationTime as number} initialActiveIndex={p.initialActiveIndex as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="flex h-40 items-center justify-center rounded-xl"`,
        `     style={{ background: "oklch(0.16 0.02 265)" }}>`,
        `  <GooeyNav`,
        `    items={[`,
        `      { label: "Home", href: "#" },`,
        `      { label: "Product", href: "#" },`,
        `      { label: "Documentation", href: "#" },`,
        `      { label: "About", href: "#" },`,
        `    ]}`,
        `    particleCount={${p.particleCount}}`,
        `    animationTime={${p.animationTime}}`,
        `    initialActiveIndex={${p.initialActiveIndex}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
