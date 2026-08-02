"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Ballpit } from "../../../../packages/ui/src/ballpit/ballpit";
function Stage({ children, dark = true, }: {
    children: React.ReactNode;
    dark?: boolean;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: dark ? "oklch(0.14 0.02 255)" : "oklch(0.97 0.005 255)" }}>
      {children}
    </div>);
}
export const ballpitShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default parameters are sufficient. Moving the cursor will push away the surrounding balls.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Ballpit />
</div>`,
            render: () => (<Stage>
          <Ballpit />
          <div className="pointer-events-none relative z-10 flex h-full items-end justify-center pb-4 text-sm font-medium text-white/70">
            Move the cursor to push the ball away
          </div>
        </Stage>),
        },
        {
            title: "Weightless floating",
            description: "gravity=0 keeps the ball from sinking, bounce=1 is completely elastic and never stops.",
            code: `<Ballpit gravity={0} bounce={1} count={60} />`,
            render: () => (<Stage>
          <Ballpit gravity={0} bounce={1} count={60}/>
        </Stage>),
        },
        {
            title: "Big ball small amount",
            description: "Increase sizeRange and reduce count to create a wallpaper-level sparse ball.",
            code: `<Ballpit count={14} sizeRange={[20, 36]} gravity={700} />`,
            render: () => (<Stage>
          <Ballpit count={14} sizeRange={[20, 36]} gravity={700}/>
        </Stage>),
        },
        {
            title: "Pure background (without cursor)",
            description: "followCursor=false Turn off interaction, pure decorative background; light color background is also available.",
            code: `<Ballpit followCursor={false} count={100} sizeRange={[8, 18]} />`,
            render: () => (<Stage dark={false}>
          <Ballpit followCursor={false} count={100} sizeRange={[8, 18]}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "count", type: "number", defaultValue: 80, label: "Number of balls" },
        { prop: "gravity", type: "number", defaultValue: 900, label: "Gravity" },
        { prop: "bounce", type: "number", defaultValue: 0.86, label: "Flexibility 0\u20131" },
        { prop: "followCursor", type: "boolean", defaultValue: true, label: "Follow cursor" },
    ],
    states: [
        {
            name: "default (Dark background\u00B7Default parameters\u00B7Try moving the cursor)",
            render: () => (<Stage>
          <Ballpit />
          <div className="pointer-events-none relative z-10 flex h-full items-end justify-center pb-4 text-sm font-medium text-white/70">
            Move the cursor to push the ball away
          </div>
        </Stage>),
        },
        {
            name: "Weightless floating (gravity=0)",
            render: () => (<Stage>
          <Ballpit gravity={0} bounce={1} count={60}/>
        </Stage>),
        },
        {
            name: "Small amount of big balls (wallpaper level)",
            render: () => (<Stage>

          <Ballpit count={14} sizeRange={[20, 36]} gravity={700}/>
        </Stage>),
        },
        {
            name: "Pure background (no cursor, light background)",
            render: () => (<Stage dark={false}>
          <Ballpit followCursor={false} count={100} sizeRange={[8, 18]}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Ballpit count={p.count as number} gravity={p.gravity as number} bounce={p.bounce as number} followCursor={p.followCursor as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <Ballpit`,
        `    count={${p.count}}`,
        `    gravity={${p.gravity}}`,
        `    bounce={${p.bounce}}`,
        `    followCursor={${p.followCursor}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
