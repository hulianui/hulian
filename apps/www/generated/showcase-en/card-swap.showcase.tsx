"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CardSwap } from "../../../../packages/ui/src/card-swap/card-swap";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-96 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.16 0.02 255)" }}>
      <div className="absolute left-6 top-6 max-w-[45%]">
        <p className="text-lg font-semibold text-white">Hulian Card Shuffling</p>
        <p className="mt-1 text-xs text-white/55">3D Pivot stacking · Automatic rotation · Zero external dependencies</p>
      </div>
      {children}
    </div>);
}
function DemoCard({ title, desc }: {
    title: string;
    desc: string;
}) {
    return (<CardSwap.Card className="border-white/15 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-white/55">{desc}</p>
    </CardSwap.Card>);
}
const cards = (<>
    <DemoCard title="Real-time synchronization" desc="Millisecond-level status push, consistent across terminals."/>
    <DemoCard title="Visual Orchestration" desc="Drag and drop to build complex business pipelines."/>
    <DemoCard title="Permission Kernel" desc="Field-level access control, out of the box."/>
  </>);
export const cardSwapShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Wrap each card with CardSwap.Card, at least 2 cards will be automatically rotated; placement=\"center\" allows the entire stack to be framed into the container.",
            code: `<div
  className="relative h-96 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.16 0.02 255)" }}
>
  <CardSwap width={300} height={200} placement="center">
    <CardSwap.Card>Real-time synchronization</CardSwap.Card>
    <CardSwap.Card>Visual Arrangement</CardSwap.Card>
    <CardSwap.Card>Permission Kernel</CardSwap.Card>
  </CardSwap>
</div>`,
            render: () => (<Stage>
          <CardSwap width={300} height={200} delay={3000} placement="center" pauseOnHover>
            {cards}
          </CardSwap>
        </Stage>),
        },
        {
            title: "Smooth and easing motion",
            description: "easing=\"smooth\" removes the elastic rebound and makes the rhythm more restrained, suitable for enterprise scenarios.",
            code: `<CardSwap
  width={300}
  height={200}
  placement="center"
  easing="smooth"
  skewAmount={4}
  delay={2600}
>
  {cards}
</CardSwap>`,
            render: () => (<Stage>
          <CardSwap width={300} height={200} delay={2600} easing="smooth" skewAmount={4} placement="center" pauseOnHover>
            {cards}
          </CardSwap>
        </Stage>),
        },
        {
            title: "Compact fit (no tilt)",
            description: "Adjust cardDistance / verticalDistance to make the stack more compact, skewAmount={0} has no tilt when viewed from the front.",
            code: `<CardSwap
  width={300}
  height={190}
  placement="center"
  cardDistance={32}
  verticalDistance={40}
  skewAmount={0}
  delay={2800}
>
  {cards}
</CardSwap>`,
            render: () => (<Stage>
          <CardSwap width={300} height={190} cardDistance={32} verticalDistance={40} skewAmount={0} delay={2800} placement="center">
            {cards}
          </CardSwap>
        </Stage>),
        },
    ],
    controls: [
        { prop: "delay", type: "number", defaultValue: 3000, label: "Rotation interval ms" },
        { prop: "cardDistance", type: "number", defaultValue: 56, label: "Horizontal misalignment px" },
        { prop: "verticalDistance", type: "number", defaultValue: 64, label: "Vertical misalignment px" },
        { prop: "skewAmount", type: "number", defaultValue: 5, label: "Tilt angle deg" },
        {
            prop: "easing",
            type: "select",
            options: ["elastic", "smooth"],
            defaultValue: "elastic",
            label: "Easing style",
        },
        { prop: "pauseOnHover", type: "boolean", defaultValue: true, label: "Hover Pause" },
    ],
    states: [
        {
            name: "default (flexible \u00B7 automatic rotation)",
            render: () => (<Stage>
          <CardSwap width={300} height={200} delay={3000} placement="center" pauseOnHover>
            {cards}
          </CardSwap>
        </Stage>),
        },
        {
            name: "Smooth easing (smooth \u00B7 Corporate restraint)",
            render: () => (<Stage>
          <CardSwap width={300} height={200} delay={2600} easing="smooth" skewAmount={4} placement="center" pauseOnHover>
            {cards}
          </CardSwap>
        </Stage>),
        },
        {
            name: "Compact fit (minimal misalignment + no tilt)",
            render: () => (<Stage>
          <CardSwap width={300} height={190} cardDistance={32} verticalDistance={40} skewAmount={0} delay={2800} placement="center">
            {cards}
          </CardSwap>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <CardSwap width={300} height={200} placement="center" delay={p.delay as number} cardDistance={p.cardDistance as number} verticalDistance={p.verticalDistance as number} skewAmount={p.skewAmount as number} easing={p.easing as "elastic" | "smooth"} pauseOnHover={p.pauseOnHover as boolean}>
        {cards}
      </CardSwap>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-96 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
        `  <CardSwap`,
        `    width={300}`,
        `    height={200}`,
        `    placement="center"`,
        `    delay={${p.delay}}`,
        `    cardDistance={${p.cardDistance}}`,
        `    verticalDistance={${p.verticalDistance}}`,
        `    skewAmount={${p.skewAmount}}`,
        `    easing="${p.easing}"`,
        `    pauseOnHover={${p.pauseOnHover}}`,
        `  >`,
        `    <CardSwap.Card>Real-time synchronization</CardSwap.Card>`,
        `    <CardSwap.Card>Visual Arrangement</CardSwap.Card>`,
        `    <CardSwap.Card>Permission Kernel</CardSwap.Card>`,
        `  </CardSwap>`,
        `</div>`,
    ].join("\n"),
};
