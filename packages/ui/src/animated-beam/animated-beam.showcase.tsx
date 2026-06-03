"use client";
import { useRef } from "react";
import { Database, Cloud, Cpu, Smartphone, Globe } from "lucide-react";
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

// mode 决定四条光束的流向（光束总是从 fromRef 流向 toRef）：
//  - "ltr"  左到右：左两点 → 中枢，中枢 → 右两点（一条贯穿管线）
//  - "hub"  四周汇聚：四个外点全部 → 中枢（中心为汇聚点）
//  - "rtl"  右到左：右两点 → 中枢，中枢 → 左两点（管线反向）
type Mode = "ltr" | "hub" | "rtl";

function Demo({ mode = "ltr" }: { mode?: Mode }) {
  const container = useRef<HTMLDivElement>(null);
  const l1 = useRef<HTMLDivElement>(null);
  const l2 = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);

  // 左侧两点是否流入中枢（否则中枢流向它们）
  const leftIn = mode === "ltr" || mode === "hub";
  // 右侧两点是否流入中枢（否则中枢流向它们）
  const rightIn = mode === "rtl" || mode === "hub";

  return (
    <div ref={container} className="relative mx-auto flex h-56 w-full max-w-md items-center justify-between px-10">
      <div className="flex flex-col gap-10">
        <Node refEl={l1}><Database className="size-5" /></Node>
        <Node refEl={l2}><Cloud className="size-5" /></Node>
      </div>
      <Node refEl={hub}><Cpu className="size-5" /></Node>
      <div className="flex flex-col gap-10">
        <Node refEl={r1}><Smartphone className="size-5" /></Node>
        <Node refEl={r2}><Globe className="size-5" /></Node>
      </div>
      {/* 曲率按几何走向固定（上点正、下点负），方向只由 from/to 顺序决定 */}
      <AnimatedBeam containerRef={container} fromRef={leftIn ? l1 : hub} toRef={leftIn ? hub : l1} curvature={30} />
      <AnimatedBeam containerRef={container} fromRef={leftIn ? l2 : hub} toRef={leftIn ? hub : l2} curvature={-30} />
      <AnimatedBeam containerRef={container} fromRef={rightIn ? r1 : hub} toRef={rightIn ? hub : r1} curvature={-30} />
      <AnimatedBeam containerRef={container} fromRef={rightIn ? r2 : hub} toRef={rightIn ? hub : r2} curvature={30} />
    </div>
  );
}

export const animatedBeamShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "左到右", render: () => <Demo mode="ltr" /> },
    { name: "四周汇聚", render: () => <Demo mode="hub" /> },
    { name: "右到左", render: () => <Demo mode="rtl" /> },
  ],
  renderWithProps: () => <Demo mode="hub" />,
  toCode: () =>
    `<div ref={container} className="relative">\n  <div ref={from} /> <div ref={to} />\n  {/* 光束从 fromRef 流向 toRef；多点汇聚把各外点的 toRef 都指向中枢 */}\n  <AnimatedBeam containerRef={container} fromRef={from} toRef={to} />\n</div>`,
};
