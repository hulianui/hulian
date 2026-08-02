"use client";
import { useRef } from "react";
import { Database, Cloud, Cpu, Smartphone, Globe } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AnimatedBeam } from "../../../../packages/ui/src/animated-beam/animated-beam";
function Node({ refEl, children }: {
    refEl: React.RefObject<HTMLDivElement | null>;
    children: React.ReactNode;
}) {
    return (<div ref={refEl} className="z-10 flex size-12 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm">
      {children}
    </div>);
}
type Mode = "ltr" | "hub" | "rtl";
function Demo({ mode = "ltr" }: {
    mode?: Mode;
}) {
    const container = useRef<HTMLDivElement>(null);
    const l1 = useRef<HTMLDivElement>(null);
    const l2 = useRef<HTMLDivElement>(null);
    const r1 = useRef<HTMLDivElement>(null);
    const r2 = useRef<HTMLDivElement>(null);
    const hub = useRef<HTMLDivElement>(null);
    const leftReverse = mode === "rtl";
    const rightReverse = mode === "hub" || mode === "rtl";
    return (<div ref={container} className="relative mx-auto flex h-56 w-full max-w-md items-center justify-between px-10">
      <div className="flex flex-col gap-10">
        <Node refEl={l1}><Database className="size-5"/></Node>
        <Node refEl={l2}><Cloud className="size-5"/></Node>
      </div>
      <Node refEl={hub}><Cpu className="size-5"/></Node>
      <div className="flex flex-col gap-10">
        <Node refEl={r1}><Smartphone className="size-5"/></Node>
        <Node refEl={r2}><Globe className="size-5"/></Node>
      </div>
      <AnimatedBeam containerRef={container} fromRef={l1} toRef={hub} curvature={30} reverse={leftReverse}/>
      <AnimatedBeam containerRef={container} fromRef={l2} toRef={hub} curvature={-30} reverse={leftReverse}/>
      <AnimatedBeam containerRef={container} fromRef={hub} toRef={r1} curvature={-30} reverse={rightReverse}/>
      <AnimatedBeam containerRef={container} fromRef={hub} toRef={r2} curvature={30} reverse={rightReverse}/>
    </div>);
}
export const animatedBeamShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Flow left to right",
            description: "Connect two sets of nodes in the container, and the beam sweeps from left to right along the curve (reverse=false).",
            code: `<div ref={container} className="relative flex items-center justify-between">
  <div ref={l1}>...</div>
  <div ref={hub}>...</div>
  <AnimatedBeam containerRef={container} fromRef={l1} toRef={hub} curvature={30} reverse={false} />
</div>`,
            render: () => <Demo mode="ltr"/>,
        },
        {
            title: "Gathering around",
            description: "The light beam flows into the center on the left side and in the opposite direction on the right side, creating the impression that data is gathered into the center.",
            code: `{/* The left two lines reverse=false flow into the center, the right two lines reverse=true flow into the center */}
<AnimatedBeam containerRef={container} fromRef={l1} toRef={hub} curvature={30} reverse={false} />
<AnimatedBeam containerRef={container} fromRef={hub} toRef={r1} curvature={-30} reverse={true} />`,
            render: () => <Demo mode="hub"/>,
        },
        {
            title: "Right to left flow",
            description: "The overall reverse direction, the beam sweeps from right to left, expressing the reflow/response direction.",
            code: `<AnimatedBeam containerRef={container} fromRef={l1} toRef={hub} curvature={30} reverse={true} />`,
            render: () => <Demo mode="rtl"/>,
        },
    ],
    controls: [],
    states: [
        { name: "Left to right", render: () => <Demo mode="ltr"/> },
        { name: "Gathering around", render: () => <Demo mode="hub"/> },
        { name: "Right to left", render: () => <Demo mode="rtl"/> },
    ],
    renderWithProps: () => <Demo mode="hub"/>,
    toCode: () => `<div ref={container} className="relative">
  <div ref={from} /> <div ref={to} />
  {/* Use reverse to control the flow direction: false=left\u2192right, true=right\u2192left; when converging, let the right beam reverse */}
  <AnimatedBeam containerRef={container} fromRef={from} toRef={to} reverse={false} />
</div>`,
};
