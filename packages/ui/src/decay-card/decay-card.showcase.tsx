"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { DecayCard } from "./decay-card";

/** 深色底容器，让溶解卡片的边缘与文字对比清晰 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-[26rem] w-full items-center justify-center overflow-hidden rounded-xl border border-border p-8"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

const DEMO_IMG = "https://picsum.photos/seed/hulian-decay/300/400?grayscale";

export const decayCardShowcase: ShowcaseSpec = {
  controls: [
    { prop: "width", type: "number", defaultValue: 300, label: "宽度 px" },
    { prop: "height", type: "number", defaultValue: 400, label: "高度 px" },
    { prop: "baseFrequency", type: "number", defaultValue: 0.015, label: "湍流频率" },
    { prop: "numOctaves", type: "number", defaultValue: 5, label: "倍频层数" },
    { prop: "maxDisplacement", type: "number", defaultValue: 400, label: "位移上限" },
    { prop: "movementBound", type: "number", defaultValue: 50, label: "平移软边界" },
  ],

  states: [
    {
      name: "default（默认参数 · 鼠标快速划过即溶解）",
      render: () => (
        <Stage>
          <DecayCard image={DEMO_IMG}>
            瑚琏
            <br />
            溶解卡片
          </DecayCard>
        </Stage>
      ),
    },
    {
      name: "细颗粒溶解（高频 + 多倍频）",
      render: () => (
        <Stage>
          <DecayCard
            image={DEMO_IMG}
            baseFrequency={0.04}
            numOctaves={6}
            seed={11}
          >
            细噪
          </DecayCard>
        </Stage>
      ),
    },
    {
      name: "粗粝大块（低频 + 大位移）",
      render: () => (
        <Stage>
          <DecayCard
            image={DEMO_IMG}
            baseFrequency={0.008}
            maxDisplacement={600}
            seed={2}
          >
            粗块
          </DecayCard>
        </Stage>
      ),
    },
    {
      name: "小尺寸 · 强平移边界",
      render: () => (
        <Stage>
          <DecayCard image={DEMO_IMG} width={220} height={300} movementBound={90}>
            Mini
          </DecayCard>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <DecayCard
        image={DEMO_IMG}
        width={p.width as number}
        height={p.height as number}
        baseFrequency={p.baseFrequency as number}
        numOctaves={p.numOctaves as number}
        maxDisplacement={p.maxDisplacement as number}
        movementBound={p.movementBound as number}
      >
        瑚琏
      </DecayCard>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<DecayCard`,
      `  image="/cover.jpg"`,
      `  width={${p.width}}`,
      `  height={${p.height}}`,
      `  baseFrequency={${p.baseFrequency}}`,
      `  numOctaves={${p.numOctaves}}`,
      `  maxDisplacement={${p.maxDisplacement}}`,
      `  movementBound={${p.movementBound}}`,
      `>`,
      `  瑚琏`,
      `</DecayCard>`,
    ].join("\n"),
};
