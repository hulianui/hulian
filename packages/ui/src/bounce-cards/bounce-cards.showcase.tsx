"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { BounceCards } from "./bounce-cards";

/** 展示用浅灰底容器，凸显卡片层叠与阴影 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-72 w-full max-w-2xl items-center justify-center overflow-hidden rounded-xl border border-border bg-subtle">
      {children}
    </div>
  );
}

/** 用纯色渐变块代替图片，避免 showcase 依赖外链资源 */
function Swatch({ from, to, label }: { from: string; to: string; label: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center text-sm font-semibold text-white"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {label}
    </div>
  );
}

const SWATCHES = [
  <Swatch key="1" from="var(--color-chart-1)" to="var(--color-chart-2)" label="01" />,
  <Swatch key="2" from="var(--color-chart-2)" to="var(--color-chart-3)" label="02" />,
  <Swatch key="3" from="var(--color-chart-3)" to="var(--color-chart-4)" label="03" />,
  <Swatch key="4" from="var(--color-chart-4)" to="var(--color-chart-5)" label="04" />,
  <Swatch key="5" from="var(--color-chart-5)" to="var(--color-primary)" label="05" />,
];

export const bounceCardsShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法（图片）",
      description: "传 images 数组，每张图渲染为一张卡片，入场逐张弹入、悬停推挤让位。",
      code: `<BounceCards
  images={["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"]}
  containerWidth={460}
  containerHeight={240}
/>`,
      render: () => (
        <Stage>
          <BounceCards containerWidth={460} containerHeight={240}>
            {SWATCHES}
          </BounceCards>
        </Stage>
      ),
    },
    {
      title: "自定义卡片内容",
      description: "用 children 替代 images，每个子节点渲染进一张卡片（数量决定张数）。",
      code: `<BounceCards containerWidth={460} containerHeight={240}>
  <Swatch label="01" />
  <Swatch label="02" />
  <Swatch label="03" />
  <Swatch label="04" />
  <Swatch label="05" />
</BounceCards>`,
      render: () => (
        <Stage>
          <BounceCards containerWidth={460} containerHeight={240}>
            {SWATCHES}
          </BounceCards>
        </Stage>
      ),
    },
    {
      title: "自定义扇形 + 关闭 hover",
      description: "transformStyles 自定义每张卡片的旋转/位移，enableHover={false} 关闭推挤交互。",
      code: `<BounceCards
  containerWidth={420}
  containerHeight={220}
  enableHover={false}
  transformStyles={[
    "rotate(8deg) translate(-110px)",
    "rotate(-2deg)",
    "rotate(-8deg) translate(110px)",
  ]}
>
  {cards.slice(0, 3)}
</BounceCards>`,
      render: () => (
        <Stage>
          <BounceCards
            containerWidth={420}
            containerHeight={220}
            enableHover={false}
            transformStyles={[
              "rotate(8deg) translate(-110px)",
              "rotate(-2deg)",
              "rotate(-8deg) translate(110px)",
            ]}
          >
            {SWATCHES.slice(0, 3)}
          </BounceCards>
        </Stage>
      ),
    },
    {
      title: "更夸张的推挤距离",
      description: "pushDistance 调大让悬停时两侧卡片让位更明显。",
      code: `<BounceCards
  containerWidth={460}
  containerHeight={240}
  pushDistance={220}
>
  {cards}
</BounceCards>`,
      render: () => (
        <Stage>
          <BounceCards containerWidth={460} containerHeight={240} pushDistance={220}>
            {SWATCHES}
          </BounceCards>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "animationDelay", type: "number", defaultValue: 0.5, label: "入场延迟 s" },
    { prop: "animationStagger", type: "number", defaultValue: 0.06, label: "错峰间隔 s" },
    { prop: "pushDistance", type: "number", defaultValue: 160, label: "hover 推挤 px" },
    { prop: "enableHover", type: "boolean", defaultValue: true, label: "hover 推挤" },
  ],

  states: [
    {
      name: "default（五张扇形铺开 · hover 推挤）",
      render: () => (
        <Stage>
          <BounceCards containerWidth={460} containerHeight={240}>
            {SWATCHES}
          </BounceCards>
        </Stage>
      ),
    },
    {
      name: "三张 · 关闭 hover",
      render: () => (
        <Stage>
          <BounceCards
            containerWidth={420}
            containerHeight={220}
            enableHover={false}
            transformStyles={[
              "rotate(8deg) translate(-110px)",
              "rotate(-2deg)",
              "rotate(-8deg) translate(110px)",
            ]}
          >
            {SWATCHES.slice(0, 3)}
          </BounceCards>
        </Stage>
      ),
    },
    {
      name: "大推挤距离（hover 让位更夸张）",
      render: () => (
        <Stage>
          <BounceCards containerWidth={460} containerHeight={240} pushDistance={220}>
            {SWATCHES}
          </BounceCards>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <BounceCards
        containerWidth={460}
        containerHeight={240}
        animationDelay={p.animationDelay as number}
        animationStagger={p.animationStagger as number}
        pushDistance={p.pushDistance as number}
        enableHover={p.enableHover as boolean}
      >
        {SWATCHES}
      </BounceCards>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<BounceCards`,
      `  images={["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"]}`,
      `  containerWidth={460}`,
      `  containerHeight={240}`,
      `  animationDelay={${p.animationDelay}}`,
      `  animationStagger={${p.animationStagger}}`,
      `  pushDistance={${p.pushDistance}}`,
      `  enableHover={${p.enableHover}}`,
      `/>`,
    ].join("\n"),
};
