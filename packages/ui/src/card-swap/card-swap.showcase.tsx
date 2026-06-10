"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { CardSwap } from "./card-swap";

/** 深色舞台：placement="center" 让整摞卡片完整框进容器（原版右下锚定外溢只适合营销页贴边）。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-96 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.16 0.02 255)" }}
    >
      <div className="absolute left-6 top-6 max-w-[45%]">
        <p className="text-lg font-semibold text-white">瑚琏卡片洗牌</p>
        <p className="mt-1 text-xs text-white/55">3D 透视堆叠 · 自动轮换 · 零外部依赖</p>
      </div>
      {children}
    </div>
  );
}

/** 一张内容卡片（深色舞台上用半透明玻璃皮肤覆盖默认 bg-surface）。 */
function DemoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <CardSwap.Card className="border-white/15 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-white/55">{desc}</p>
    </CardSwap.Card>
  );
}

const cards = (
  <>
    <DemoCard title="实时同步" desc="毫秒级状态推送，跨端一致。" />
    <DemoCard title="可视编排" desc="拖拽即可搭建复杂业务流水线。" />
    <DemoCard title="权限内核" desc="字段级访问控制，开箱即用。" />
  </>
);

export const cardSwapShowcase: ShowcaseSpec = {
  controls: [
    { prop: "delay", type: "number", defaultValue: 3000, label: "轮换间隔 ms" },
    { prop: "cardDistance", type: "number", defaultValue: 56, label: "水平错位 px" },
    { prop: "verticalDistance", type: "number", defaultValue: 64, label: "垂直错位 px" },
    { prop: "skewAmount", type: "number", defaultValue: 5, label: "倾斜角 deg" },
    {
      prop: "easing",
      type: "select",
      options: ["elastic", "smooth"],
      defaultValue: "elastic",
      label: "缓动风格",
    },
    { prop: "pauseOnHover", type: "boolean", defaultValue: true, label: "悬停暂停" },
  ],

  states: [
    {
      name: "default（弹性 · 自动轮换）",
      render: () => (
        <Stage>
          <CardSwap width={300} height={200} delay={3000} placement="center" pauseOnHover>
            {cards}
          </CardSwap>
        </Stage>
      ),
    },
    {
      name: "顺滑缓动（smooth · 企业克制）",
      render: () => (
        <Stage>
          <CardSwap width={300} height={200} delay={2600} easing="smooth" skewAmount={4} placement="center" pauseOnHover>
            {cards}
          </CardSwap>
        </Stage>
      ),
    },
    {
      name: "紧凑贴合（小错位 + 无倾斜）",
      render: () => (
        <Stage>
          <CardSwap width={300} height={190} cardDistance={32} verticalDistance={40} skewAmount={0} delay={2800} placement="center">
            {cards}
          </CardSwap>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <CardSwap
        width={300}
        height={200}
        placement="center"
        delay={p.delay as number}
        cardDistance={p.cardDistance as number}
        verticalDistance={p.verticalDistance as number}
        skewAmount={p.skewAmount as number}
        easing={p.easing as "elastic" | "smooth"}
        pauseOnHover={p.pauseOnHover as boolean}
      >
        {cards}
      </CardSwap>
    </Stage>
  ),

  toCode: (p) =>
    [
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
      `    <CardSwap.Card>实时同步</CardSwap.Card>`,
      `    <CardSwap.Card>可视编排</CardSwap.Card>`,
      `    <CardSwap.Card>权限内核</CardSwap.Card>`,
      `  </CardSwap>`,
      `</div>`,
    ].join("\n"),
};
