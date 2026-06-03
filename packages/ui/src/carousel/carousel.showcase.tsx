"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Carousel } from "./carousel";

const SLIDES = [
  { title: "聚合最佳实现", desc: "从各家 React 库吸取，统一成一套瑚琏 API。", bg: "bg-primary/15 text-foreground" },
  { title: "明暗双 token", desc: "OKLCH 双层语义 token，换肤零重写。", bg: "bg-surface-hover text-foreground" },
  { title: "零运行时特效", desc: "纯 CSS scroll-snap + 指针拖拽 + 键盘左右。", bg: "bg-foreground text-bg" },
];

function Slide({ title, desc, bg }: (typeof SLIDES)[number]) {
  return (
    <div className={`flex h-48 flex-col items-center justify-center gap-2 px-8 text-center ${bg}`}>
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm opacity-80">{desc}</p>
    </div>
  );
}

function Demo(props: {
  autoplay?: boolean;
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
}) {
  return (
    <Carousel className="w-80 border border-border" {...props}>
      {SLIDES.map((s) => (
        <Slide key={s.title} {...s} />
      ))}
    </Carousel>
  );
}

export const carouselShowcase: ShowcaseSpec = {
  controls: [
    { prop: "autoplay", type: "boolean", defaultValue: false, label: "自动播放" },
    { prop: "loop", type: "boolean", defaultValue: false, label: "循环" },
    { prop: "showArrows", type: "boolean", defaultValue: true, label: "箭头" },
    { prop: "showDots", type: "boolean", defaultValue: true, label: "圆点" },
  ],
  states: [
    { name: "基础（箭头+圆点）", render: () => <Demo /> },
    { name: "自动播放 + 循环", render: () => <Demo autoplay loop /> },
    { name: "仅圆点（无箭头）", render: () => <Demo showArrows={false} /> },
    { name: "仅箭头（无圆点）", render: () => <Demo showDots={false} /> },
  ],
  renderWithProps: (p) => (
    <Demo
      autoplay={Boolean(p.autoplay)}
      loop={Boolean(p.loop)}
      showArrows={p.showArrows !== false}
      showDots={p.showDots !== false}
    />
  ),
  toCode: (p) =>
    `<Carousel${p.autoplay ? " autoplay" : ""}${p.loop ? " loop" : ""}${
      p.showArrows === false ? " showArrows={false}" : ""
    }${p.showDots === false ? " showDots={false}" : ""}>\n  <div>幻灯片 1</div>\n  <div>幻灯片 2</div>\n  <div>幻灯片 3</div>\n</Carousel>`,
};
