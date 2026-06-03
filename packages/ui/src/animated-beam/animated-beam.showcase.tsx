"use client";
import { useRef } from "react";
import { Database, Cloud, Cpu } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { AnimatedBeam } from "./animated-beam";

function Node({ refEl, children }: { refEl: React.RefObject<HTMLDivElement | null>; children: React.ReactNode }) {
  return (
    <div
      ref={refEl}
      className="z-10 flex size-12 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm"
    >
      {children}
    </div>
  );
}

function Demo() {
  const container = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  return (
    <div ref={container} className="relative flex h-56 w-full max-w-md items-center justify-between px-10">
      <div className="flex flex-col gap-10">
        <Node refEl={a}><Database className="size-5" /></Node>
        <Node refEl={b}><Cloud className="size-5" /></Node>
      </div>
      <Node refEl={hub}><Cpu className="size-5" /></Node>
      <AnimatedBeam containerRef={container} fromRef={a} toRef={hub} curvature={30} />
      <AnimatedBeam containerRef={container} fromRef={b} toRef={hub} curvature={-30} />
    </div>
  );
}

export const animatedBeamShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<div ref={container} className="relative">\n  <div ref={from} /> <div ref={to} />\n  <AnimatedBeam containerRef={container} fromRef={from} toRef={to} />\n</div>`,
};
