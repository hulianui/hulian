"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Glimpse } from "./glimpse";

// 用纯 token SVG data-uri 作占位封面，避免 showcase 依赖远程图片（文档站门禁禁外链）。
const cover = (hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='160'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue} 70% 55%)'/><stop offset='1' stop-color='hsl(${hue + 40} 70% 45%)'/></linearGradient></defs><rect width='320' height='160' fill='url(%23g)'/></svg>`,
  )}`;

export const glimpseShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "链接预览",
      description: "悬停行内链接弹出预览卡：封面图 + 标题 + 描述 + 域名，传入 href 时触发器渲染为外链。",
      code: `<p>
  我们的设计系统基于{" "}
  <Glimpse
    href="https://hulian.example.com/tokens"
    image={coverUrl}
    title="瑚琏设计 Token"
    description="一套语义化的颜色 / 间距 / 圆角变量，明暗模式开箱即用。"
  >
    语义 token
  </Glimpse>{" "}
  构建，悬停链接即可预览。
</p>`,
      render: () => (
        <p className="max-w-md leading-7 text-foreground">
          我们的设计系统基于{" "}
          <Glimpse
            href="https://hulian.example.com/tokens"
            image={cover(210)}
            title="瑚琏设计 Token"
            description="一套语义化的颜色 / 间距 / 圆角变量，明暗模式开箱即用，是全部组件的单一真源。"
          >
            语义 token
          </Glimpse>{" "}
          构建，悬停链接即可预览。
        </p>
      ),
    },
    {
      title: "纯文字术语",
      description: "不传 image / href 时退化为纯术语解释卡（无封面、无域名），触发器为行内 span。",
      code: `<p>
  这是一个{" "}
  <Glimpse title="Dogfood" description="自己用自己的产品。文档站全部用 @hulianui/ui 自身组件搭建。">
    dogfood
  </Glimpse>{" "}
  的例子。
</p>`,
      render: () => (
        <p className="max-w-md leading-7 text-foreground">
          这是一个{" "}
          <Glimpse title="Dogfood" description="自己用自己的产品。文档站全部用 @hulianui/ui 自身组件搭建。">
            dogfood
          </Glimpse>{" "}
          的例子。
        </p>
      ),
    },
    {
      title: "多个并排",
      description: "同段落多处行内链接各自独立预览，互不干扰。",
      code: `<p>
  推荐阅读{" "}
  <Glimpse href="https://example.com/a" image={coverA} title="组件总览" description="160+ 组件分类索引。">
    组件总览
  </Glimpse>
  、
  <Glimpse href="https://example.com/b" image={coverB} title="主题定制" description="改一处 token 全站换肤。">
    主题定制
  </Glimpse>{" "}
  两篇。
</p>`,
      render: () => (
        <p className="max-w-lg leading-7 text-foreground">
          推荐阅读{" "}
          <Glimpse href="https://example.com/a" image={cover(140)} title="组件总览" description="160+ 组件分类索引。">
            组件总览
          </Glimpse>
          、
          <Glimpse href="https://example.com/b" image={cover(280)} title="主题定制" description="改一处 token 全站换肤。">
            主题定制
          </Glimpse>{" "}
          两篇。
        </p>
      ),
    },
  ],
  controls: [
    { prop: "side", type: "select", options: ["top", "bottom", "left", "right"], defaultValue: "bottom" },
  ],
  states: [
    {
      name: "链接预览（图 + 标题 + 描述 + 域名）",
      render: () => (
        <p className="max-w-md leading-7 text-foreground">
          我们的设计系统基于{" "}
          <Glimpse
            href="https://hulian.example.com/tokens"
            image={cover(210)}
            title="瑚琏设计 Token"
            description="一套语义化的颜色 / 间距 / 圆角变量，明暗模式开箱即用，是全部组件的单一真源。"
          >
            语义 token
          </Glimpse>{" "}
          构建，悬停链接即可预览。
        </p>
      ),
    },
    {
      name: "纯文字术语（无图无链接）",
      render: () => (
        <p className="max-w-md leading-7 text-foreground">
          这是一个{" "}
          <Glimpse title="Dogfood" description="自己用自己的产品。文档站全部用 @hulianui/ui 自身组件搭建。">
            dogfood
          </Glimpse>{" "}
          的例子。
        </p>
      ),
    },
    {
      name: "多个并排",
      render: () => (
        <p className="max-w-lg leading-7 text-foreground">
          推荐阅读{" "}
          <Glimpse href="https://example.com/a" image={cover(140)} title="组件总览" description="160+ 组件分类索引。">
            组件总览
          </Glimpse>
          、
          <Glimpse href="https://example.com/b" image={cover(280)} title="主题定制" description="改一处 token 全站换肤。">
            主题定制
          </Glimpse>{" "}
          两篇。
        </p>
      ),
    },
  ],
  renderWithProps: (p) => (
    <p className="leading-7 text-foreground">
      悬停查看{" "}
      <Glimpse
        side={(p.side as "top" | "bottom" | "left" | "right") ?? "bottom"}
        href="https://example.com"
        image={cover(210)}
        title="预览标题"
        description="这是链接预览卡片的描述文本。"
      >
        这个链接
      </Glimpse>
    </p>
  ),
  toCode: (p) =>
    `<Glimpse${p.side && p.side !== "bottom" ? ` side="${p.side}"` : ""} href="https://example.com" image={cover} title="标题" description="描述">\n  链接文字\n</Glimpse>`,
};
