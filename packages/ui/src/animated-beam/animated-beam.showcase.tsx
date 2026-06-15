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

// 流光扫描方向由 reverse 控制（沿容器水平方向，与 path 端点顺序无关）：
//  reverse=false → 光束从左向右扫；reverse=true → 从右向左扫。
//  - "ltr"  左到右：四条全部左→右扫
//  - "hub"  四周汇聚：左两点左→右(流入中枢)，右两点右→左(流入中枢)，中心为汇聚点
//  - "rtl"  右到左：四条全部右→左扫
type Mode = "ltr" | "hub" | "rtl";

function Demo({ mode = "ltr" }: { mode?: Mode }) {
  const container = useRef<HTMLDivElement>(null);
  const l1 = useRef<HTMLDivElement>(null);
  const l2 = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);

  // 左侧两条光束是否右→左扫（rtl 时整体反向）
  const leftReverse = mode === "rtl";
  // 右侧两条光束是否右→左扫（汇聚 / rtl 时反向，使其流入/流出中枢方向正确）
  const rightReverse = mode === "hub" || mode === "rtl";

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
      <AnimatedBeam containerRef={container} fromRef={l1} toRef={hub} curvature={30} reverse={leftReverse} />
      <AnimatedBeam containerRef={container} fromRef={l2} toRef={hub} curvature={-30} reverse={leftReverse} />
      <AnimatedBeam containerRef={container} fromRef={hub} toRef={r1} curvature={-30} reverse={rightReverse} />
      <AnimatedBeam containerRef={container} fromRef={hub} toRef={r2} curvature={30} reverse={rightReverse} />
    </div>
  );
}

export const animatedBeamShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "左到右流动",
      description: "在容器内连接两组节点，光束沿曲线自左向右扫过（reverse=false）。",
      code: `<div ref={container} className="relative flex items-center justify-between">
  <div ref={l1}>...</div>
  <div ref={hub}>...</div>
  <AnimatedBeam containerRef={container} fromRef={l1} toRef={hub} curvature={30} reverse={false} />
</div>`,
      render: () => <Demo mode="ltr" />,
    },
    {
      title: "四周汇聚",
      description: "左侧光束流入中枢、右侧反向流入，营造数据汇聚到中心的观感。",
      code: `{/* 左两条 reverse=false 流入中枢，右两条 reverse=true 流入中枢 */}
<AnimatedBeam containerRef={container} fromRef={l1} toRef={hub} curvature={30} reverse={false} />
<AnimatedBeam containerRef={container} fromRef={hub} toRef={r1} curvature={-30} reverse={true} />`,
      render: () => <Demo mode="hub" />,
    },
    {
      title: "右到左流动",
      description: "整体反向，光束自右向左扫，表达回流/响应方向。",
      code: `<AnimatedBeam containerRef={container} fromRef={l1} toRef={hub} curvature={30} reverse={true} />`,
      render: () => <Demo mode="rtl" />,
    },
  ],
  controls: [],
  states: [
    { name: "左到右", render: () => <Demo mode="ltr" /> },
    { name: "四周汇聚", render: () => <Demo mode="hub" /> },
    { name: "右到左", render: () => <Demo mode="rtl" /> },
  ],
  renderWithProps: () => <Demo mode="hub" />,
  toCode: () =>
    `<div ref={container} className="relative">\n  <div ref={from} /> <div ref={to} />\n  {/* 流向用 reverse 控制：false=左→右、true=右→左；汇聚时让右侧光束 reverse */}\n  <AnimatedBeam containerRef={container} fromRef={from} toRef={to} reverse={false} />\n</div>`,
};
