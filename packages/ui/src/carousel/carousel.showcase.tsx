"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Carousel } from "./carousel";

// 真实「首页营销 Banner」场景：5 张视觉差异明显的促销位。
// 张数足够让圆点/箭头/自动播放/循环回绕都看得出效果（autoplay 4s 自动翻、loop 末张接首张）。
const SLIDES = [
  {
    eyebrow: "限时 3 天",
    title: "618 年中大促",
    desc: "全场满 300 减 50，叠加平台券再省 20。",
    cta: "立即抢购",
    bg: "bg-primary text-bg",
  },
  {
    eyebrow: "新品首发",
    title: "夏季轻薄系列",
    desc: "透气速干面料，3 色可选，预售享 8 折。",
    cta: "查看新品",
    bg: "bg-surface-hover text-foreground",
  },
  {
    eyebrow: "会员专享",
    title: "黑卡会员日",
    desc: "每月 8 号，会员价低至 5 折，积分翻倍。",
    cta: "开通黑卡",
    bg: "bg-foreground text-bg",
  },
  {
    eyebrow: "包邮到家",
    title: "生鲜次日达",
    desc: "产地直采，下单满 99 元全国包邮冷链配送。",
    cta: "逛生鲜",
    bg: "bg-primary/15 text-foreground",
  },
  {
    eyebrow: "以旧换新",
    title: "数码回收补贴",
    desc: "旧机最高估 1200 元，换新再补 300 元。",
    cta: "估价回收",
    bg: "bg-surface text-foreground",
  },
];

function Slide({ eyebrow, title, desc, cta, bg }: (typeof SLIDES)[number]) {
  return (
    <div className={`flex h-48 flex-col items-start justify-center gap-2 px-10 ${bg}`}>
      <span className="rounded-full bg-current/15 px-2 py-0.5 text-xs font-medium">{eyebrow}</span>
      <p className="text-2xl font-bold">{title}</p>
      <p className="max-w-sm text-sm opacity-80">{desc}</p>
      <span className="mt-1 rounded-[var(--radius)] border border-current/40 px-3 py-1 text-sm font-medium">
        {cta} →
      </span>
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
    <Carousel className="w-96 max-w-full border border-border" aria-label="首页促销 Banner" {...props}>
      {SLIDES.map((s) => (
        <Slide key={s.title} {...s} />
      ))}
    </Carousel>
  );
}

export const carouselShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "每个顶层 child 是一张幻灯片；默认带箭头 + 圆点，可拖拽、支持 ←→ 键盘。",
      code: `<Carousel className="w-96" aria-label="首页促销 Banner">
  <Slide title="618 年中大促" />
  <Slide title="夏季轻薄系列" />
  {/* …更多促销位 */}
</Carousel>`,
      render: () => <Demo />,
    },
    {
      title: "自动播放 + 循环",
      description: "autoplay 每 4s 自动翻页，loop 让末张接回首张；悬停 / 聚焦时自动暂停。",
      code: `<Carousel autoplay loop className="w-96">
  <Slide title="618 年中大促" />
  <Slide title="夏季轻薄系列" />
</Carousel>`,
      render: () => <Demo autoplay loop />,
    },
    {
      title: "仅圆点",
      description: "showArrows={false} 隐藏左右箭头，只保留底部圆点指示。",
      code: `<Carousel showArrows={false} className="w-96">
  <Slide title="618 年中大促" />
  <Slide title="夏季轻薄系列" />
</Carousel>`,
      render: () => <Demo showArrows={false} />,
    },
    {
      title: "仅箭头",
      description: "showDots={false} 隐藏圆点，只保留左右切换箭头。",
      code: `<Carousel showDots={false} className="w-96">
  <Slide title="618 年中大促" />
  <Slide title="夏季轻薄系列" />
</Carousel>`,
      render: () => <Demo showDots={false} />,
    },
  ],
  controls: [
    { prop: "autoplay", type: "boolean", defaultValue: false, label: "自动播放" },
    { prop: "loop", type: "boolean", defaultValue: false, label: "循环" },
    { prop: "showArrows", type: "boolean", defaultValue: true, label: "箭头" },
    { prop: "showDots", type: "boolean", defaultValue: true, label: "圆点" },
  ],
  states: [
    { name: "营销 Banner（箭头 + 圆点 / 可拖拽 / ←→ 键盘）", render: () => <Demo /> },
    { name: "自动播放 + 循环（4s 自动翻，末张接回首张；悬停暂停）", render: () => <Demo autoplay loop /> },
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
    }${p.showDots === false ? " showDots={false}" : ""}>\n  <Slide title="618 年中大促" />\n  <Slide title="夏季轻薄系列" />\n  {/* …更多促销位 */}\n</Carousel>`,
};
