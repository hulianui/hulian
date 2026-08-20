"use client";
import { useId, useRef } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Anchor } from "./anchor";
import type { AnchorItem } from "./anchor.types";

// 章节 id 逐实例派生，不写死。两条理由都实测过：
//  1. 组件文档页会同时渲染本 demo 好几份（示例区 ×2、全状态区、Playground），而 Anchor 点击走的是
//     document.getElementById —— 写死 id 时只有 DOM 里第一份会被命中，后面几份点目录滚的是别人的盒子；
//  2. 这批 id 曾与文档页自己的分节重名（同页实测 sec-usage 出现 4 次），点页面目录的「用法」会跳错地方。
// useId 的 :r0: 形态含冒号，去掉后再当 id 前缀，免得写进 href 还要考虑选择器转义。
function useSectionId() {
  const uid = useId().replace(/:/g, "");
  return (key: string) => `${uid}-${key}`;
}

function docItems(id: (key: string) => string): AnchorItem[] {
  return [
    { href: `#${id("overview")}`, title: "概述" },
    {
      href: `#${id("guide")}`,
      title: "快速上手",
      children: [
        { href: `#${id("install")}`, title: "安装" },
        { href: `#${id("usage")}`, title: "基础用法" },
        { href: `#${id("nested")}`, title: "二级锚点" },
      ],
    },
    {
      href: `#${id("api")}`,
      title: "API",
      children: [
        { href: `#${id("api-items")}`, title: "items" },
        { href: `#${id("api-offset")}`, title: "offsetTop" },
        { href: `#${id("api-container")}`, title: "getContainer" },
      ],
    },
    { href: `#${id("faq")}`, title: "常见问题" },
  ];
}

// 真实长文章 —— 每节多段，足够撑高滚动容器，scrollspy 才能在滚动中真正切换高亮。
const sections: { key: string; title: string; level: 2 | 3; paras: string[] }[] = [
  {
    key: "overview",
    title: "概述",
    level: 2,
    paras: [
      "Anchor 锚点导航跟随阅读进度高亮当前章节，并在点击时平滑滚动到目标位置。它适用于任何「左侧目录 + 右侧长文」的阅读型页面：API 文档、隐私协议、产品说明、设置页的分节表单。",
      "它的核心是一个零依赖的 scrollspy：内部用 IntersectionObserver 观测每个 section，取「文档顺序中最靠前的可见项」作为当前锚点；左侧那条会滑动的指示条，复用了 Tabs 同款「把激活几何写进 CSS 变量、由纯 CSS transition 平滑过渡」的技法，运行时不依赖任何动画库。",
      "向下滚动这段文字，你会看到左侧目录的高亮和指示条跟着当前所读章节移动；点击目录里的任意一项，右侧会平滑滚动到对应小节。",
    ],
  },
  {
    key: "guide",
    title: "快速上手",
    level: 2,
    paras: ["分三步：安装、给内容区的每个章节加 id、把同样的结构喂给 Anchor 的 items。"],
  },
  {
    key: "install",
    title: "安装",
    level: 3,
    paras: [
      "通过包管理器安装组件库后即可按需引入：import { Anchor } from \"@hulianui/ui\"。组件自带 \"use client\" 标记，可直接在 React Server Component 的页面里作为客户端孤岛使用。",
      "无需引入额外的样式文件或动画运行时——指示条与高亮全部走语义 token，自动适配明暗主题。",
    ],
  },
  {
    key: "usage",
    title: "基础用法",
    level: 3,
    paras: [
      "给每个章节元素一个唯一 id，再把对应的 { href, title } 列表传给 items。href 形如 \"#section-id\"，与页面里元素的 id 一一对应。",
      "当章节较多、内容较长时，建议让目录 sticky 固定在视口一侧，这样滚动正文时目录始终可见——本示例左侧就是这么做的。",
    ],
  },
  {
    key: "nested",
    title: "二级锚点",
    level: 3,
    paras: [
      "在某一项上提供 children，即可形成一层二级目录，渲染时自动缩进。scrollspy 会把父子项一起扁平化参与计算，因此滚到任意子节，对应的二级项会高亮，指示条也会滑到它身上。",
      "二级以内是刻意的约束：超过两层的目录在窄侧栏里会迅速失去可读性，不如改用可折叠的树形导航。",
    ],
  },
  {
    key: "api",
    title: "API",
    level: 2,
    paras: ["三个核心属性覆盖了绝大多数场景。"],
  },
  {
    key: "api-items",
    title: "items",
    level: 3,
    paras: [
      "AnchorItem[] —— 必填。每项含 href、title，可选 children 形成二级。title 接受 ReactNode，所以你可以塞图标或徽标。",
    ],
  },
  {
    key: "api-offset",
    title: "offsetTop",
    level: 3,
    paras: [
      "number，默认 0。页面有固定页头时设置它：既会在点击滚动时为目标顶部预留这段距离避开遮挡，也会同步收缩 scrollspy 的观测上沿，让高亮判定与视觉对齐。",
    ],
  },
  {
    key: "api-container",
    title: "getContainer",
    level: 3,
    paras: [
      "() => HTMLElement | null，可选。默认以视口/window 为滚动根。当页面真正的滚动体不是 window（比如内层 overflow-y-auto 的容器），传入返回该容器的函数——scrollspy 的观测根与点击滚动都会落到它身上。",
      "本示例右侧就是一个独立的滚动容器：Anchor 通过 getContainer 指向它，所以高亮跟随与点击跳转都在这个盒子内部成立，而不会去滚整个页面。",
    ],
  },
  {
    key: "faq",
    title: "常见问题",
    level: 2,
    paras: [
      "点击目录跳不动？多半是页面真正的滚动体不是 window——用 getContainer 指向那个 overflow 容器即可。",
      "高亮总比视觉慢半拍或对不齐？检查 offsetTop 是否等于固定页头的高度。",
      "想用浏览器原生的 hash 滚动？把 onChange 接到路由，让锚点变化写回 URL，即可在不破坏 scrollspy 的前提下获得可分享的深链。",
    ],
  },
];

// 自包含联动 demo：左侧 sticky 锚点 + 右侧独立滚动容器（Anchor 经 getContainer 挂到它）。
function AnchorDemo({ offsetTop = 8 }: { offsetTop?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const id = useSectionId();
  return (
    <div className="flex w-full max-w-2xl gap-6 rounded-[var(--radius)] border border-border p-4">
      <Anchor
        items={docItems(id)}
        offsetTop={offsetTop}
        getContainer={() => scrollRef.current}
        className="sticky top-0 w-40 shrink-0 self-start"
      />
      <div
        ref={scrollRef}
        className="h-80 min-w-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-2"
      >
        {sections.map((s) => (
          <section key={s.key} id={id(s.key)} className="scroll-mt-2">
            {s.level === 2 ? (
              <h3 className="mb-2 text-base font-semibold text-foreground">{s.title}</h3>
            ) : (
              <h4 className="mb-1.5 font-medium text-foreground">{s.title}</h4>
            )}
            {s.paras.map((p, i) => (
              <p key={i} className="mb-2 text-sm leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

// 只展示结构、不配正文：hrefs 同样逐实例派生，因此不会去命中另一份 demo 的章节
// （点击落不到目标时 Anchor 交回默认行为，不会滚错盒子）。
function AnchorStructure() {
  const id = useSectionId();
  return (
    <div className="rounded-[var(--radius)] border border-border p-4">
      <Anchor items={docItems(id)} className="w-48" />
    </div>
  );
}

export const anchorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "目录与长文联动",
      description:
        "左侧 sticky 目录 + 右侧独立滚动容器。滚动正文时高亮与指示条跟随当前章节，点击目录平滑跳转。",
      code: `const ref = useRef<HTMLDivElement>(null);

<div className="flex gap-6">
  <Anchor items={items} getContainer={() => ref.current} className="sticky top-0 w-40" />
  <div ref={ref} className="h-80 overflow-y-auto">
    {/* 每个章节带与 href 对应的 id */}
  </div>
</div>`,
      render: () => <AnchorDemo />,
    },
    {
      title: "二级锚点",
      description: "在某项上提供 children 即形成一层二级目录，渲染时自动缩进，scrollspy 扁平参与计算。",
      code: `<Anchor
  items={[
    { href: "#sec-overview", title: "概述" },
    {
      href: "#sec-guide",
      title: "快速上手",
      children: [
        { href: "#sec-install", title: "安装" },
        { href: "#sec-usage", title: "基础用法" },
      ],
    },
  ]}
  className="w-48"
/>`,
      render: () => <AnchorStructure />,
    },
    {
      title: "避开固定页头",
      description: "页面有固定页头时设置 offsetTop=页头高度，点击滚动预留这段距离，高亮判定同步对齐。",
      code: `const ref = useRef<HTMLDivElement>(null);

<Anchor items={items} offsetTop={64} getContainer={() => ref.current} />`,
      render: () => <AnchorDemo offsetTop={32} />,
    },
  ],
  controls: [
    {
      prop: "offsetTop",
      type: "number",
      defaultValue: 8,
      label: "offsetTop（容器内偏移 px）",
    },
  ],
  states: [
    {
      name: "目录 + 长文联动（滚动右侧容器，高亮与指示条跟随；点击平滑跳转）",
      render: () => <AnchorDemo />,
    },
    {
      name: "结构总览（二级缩进 + 静态）",
      render: () => <AnchorStructure />,
    },
  ],
  renderWithProps: (p) => <AnchorDemo offsetTop={Number(p.offsetTop) || 0} />,
  toCode: (p) => {
    const off = Number(p.offsetTop) || 0;
    return [
      "// 内层滚动容器场景：getContainer 指向真正的滚动体",
      "const ref = useRef<HTMLDivElement>(null);",
      "",
      "<div className=\"flex gap-6\">",
      `  <Anchor items={items}${off ? ` offsetTop={${off}}` : ""} getContainer={() => ref.current} className=\"sticky top-0\" />`,
      "  <div ref={ref} className=\"h-80 overflow-y-auto\">{/* 带 id 的各章节 */}</div>",
      "</div>",
    ].join("\n");
  },
};
