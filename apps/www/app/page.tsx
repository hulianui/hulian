import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getIntlayer } from "next-intlayer";
import { JsonLd } from "../components/json-ld";
import {
  Button,
  DotPattern,
  Heading,
  Marquee,
  Separator,
  Snippet,
  Stack,
  Tag,
  Text,
} from "@hulianui/ui";
import { manifest, CATEGORIES } from "../lib/manifest";
import { TierBrowser } from "../components/tier-browser";
import { SiteNavbar } from "../components/site-navbar";
import { DOCS_LOCALE, ROOT_LOCALE, canonicalPathForLocale } from "../lib/docs-locale";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "../lib/site";

const english = DOCS_LOCALE === "en";
const content = getIntlayer("home", DOCS_LOCALE);
const homePath = canonicalPathForLocale("/", DOCS_LOCALE);
const homeUrl = `${SITE_URL}${homePath}`;
const homeName = english ? "Hulian UI" : SITE_NAME;
const homeDescription = english
  ? "Hulian UI is a production-ready React component library and design system with 349+ components, OKLCH color, Tailwind CSS v4, dark mode, and source-first distribution."
  : SITE_DESCRIPTION;

export const metadata: Metadata = {
  alternates: {
    canonical: homePath,
    languages: {
      "zh-CN": canonicalPathForLocale("/", "zh-CN"),
      en: canonicalPathForLocale("/", "en"),
      "x-default": canonicalPathForLocale("/", ROOT_LOCALE),
    },
  },
};

// 站在巨人肩上 —— 吸取式聚合的底座（dogfood Marquee 滚动呈现）
const STACK_TAGS = [
  "Base UI",
  "TanStack Table",
  "Recharts",
  "Tailwind v4",
  "Motion",
  "MagicUI",
  content.muiBridge,
  "OKLCH Token",
];

const total = manifest.length;
const liveCategories = CATEGORIES.filter((cat) => manifest.some((m) => m.category === cat.key));

// 入场逐级揭示的延迟（prefers-reduced-motion 下由 globals.css 整体禁用）
const rise = (i: number): CSSProperties => ({ animationDelay: `${i * 70}ms` });

// 品牌级结构化数据：把首页标记为「一个软件产品 + 网站」，帮搜索引擎/AI 在
// 「hulianui」「瑚琏 组件库」这类导航词上正确认领本站为官方来源。
const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: homeName,
      alternateName: english
        ? ["Hulian", "hulianui", "hulian ui"]
        : ["hulianui", "hulian ui", "Hulian UI"],
      url: homeUrl,
      description: homeDescription,
      inLanguage: DOCS_LOCALE,
    },
    {
      "@type": "SoftwareApplication",
      name: homeName,
      alternateName: "hulianui",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: homeDescription,
      url: homeUrl,
      inLanguage: DOCS_LOCALE,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@type": "Person", name: english ? "Abel" : "瑚琏 Abel" },
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={homeJsonLd} />
      <SiteNavbar />
      <main className="mx-auto max-w-4xl px-6 pb-12 pt-8 sm:pb-16">
        {/* Hero —— 左对齐、非对称，靠层级与留白说话；isolate 让背景层锁在本段内 */}
        <section className="relative isolate pt-20 sm:pt-28">
          {/* 纹理层：dogfood 自家 DotPattern，径向遮罩向四周淡出（库无「辉光」件，渐变仍走 CSS） */}
          <DotPattern className="-z-10 text-border/70 [mask-image:radial-gradient(40%_50%_at_30%_10%,black,transparent)]" />
          {/* 品牌辉光：径向渐变叠在纹理上做层次（纯 CSS，无库对应件） */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-64 blur-2xl"
            style={{
              background:
                "radial-gradient(50% 60% at 30% 0%, color-mix(in oklch, var(--color-primary) 18%, transparent), transparent 70%)",
            }}
          />

          <Heading
            level={1}
            size="4xl"
            className="hl-rise mt-3 text-6xl tracking-tight sm:text-7xl"
            style={rise(2)}
          >
            {content.brand}
          </Heading>

          <Heading
            as="p"
            level={2}
            size="2xl"
            weight="semibold"
            balance
            className="hl-rise mt-8 max-w-xl"
            style={rise(3)}
          >
            {content.tagline}
          </Heading>
          <Text tone="muted" className="hl-rise mt-3 max-w-xl leading-relaxed" style={rise(4)}>
            {content.origin}
          </Text>

          {/* CTA：dogfood 自家 Button —— render 成 Next <Link>（按钮样式的链接） */}
          <Stack
            direction="row"
            wrap
            align="center"
            gap={4}
            className="hl-rise mt-9"
            style={rise(5)}
          >
            <Button render={<Link href="/components" />} className="group h-11 px-5">
              {content.browseComponents.replace("{count}", String(total))}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Button>
            <Button variant="outline" render={<Link href="/blocks" />} className="group h-11 px-5">
              {content.blocks}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Button>
            <Button variant="outline" render={<Link href="/pages" />} className="group h-11 px-5">
              {content.pages}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Button>
            <Button variant="ghost" render={<Link href="/demos" />} className="group h-11 px-5">
              {content.demos}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Button>
          </Stack>

          {/* 安装命令：dogfood Snippet，一行复制即用 */}
          <div className="hl-rise mt-6 w-fit max-w-full" style={rise(6)}>
            <Snippet copyLabel={content.copy} copiedLabel={content.copied}>
              pnpm add @hulianui/ui @hulianui/tokens
            </Snippet>
          </div>

          {/* AI 接入：给出可复制的实体动作（装 MCP + 写使用契约），而不是一句「我们支持 AI」 */}
          <div className="hl-rise mt-8 max-w-xl" style={rise(7)}>
            <Text size="sm" tone="muted" className="mb-2 leading-relaxed">
              {content.aiLead}
            </Text>
            <div className="w-fit max-w-full">
              <Snippet copyLabel={content.copy} copiedLabel={content.copied}>
                npx @hulianui/mcp init-agent
              </Snippet>
            </div>
            <Stack direction="row" wrap align="center" gap={4} className="mt-3">
              <Link
                href="/start"
                className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
              >
                {content.aiStart}
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <a
                href="/llms.txt"
                className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                llms.txt
              </a>
            </Stack>
          </div>
        </section>

        {/* 浏览区：按「组件 / 区块 / 页面 / 示例」四档切换的发丝线列表（dogfood Segmented） */}
        <section
          className="hl-rise mt-20 sm:mt-24"
          style={rise(8)}
          // getIntlayer 拿到的是 intlayer 节点：放在 children 位置 React 会解析，
          // 但属性值只会 stringify 成 [object Object]。字符串属性一律显式转。
          aria-label={String(content.browseLabel)}
        >
          <TierBrowser />
        </section>

        {/* 技术底座（新区块）：dogfood Marquee 滚动展示吸取的上游 */}
        <section className="hl-rise mt-20 sm:mt-24" style={rise(9)}>
          <Heading as="p" size="sm" weight="medium" className="mb-4 text-foreground">
            {content.foundations}
          </Heading>
          <Marquee
            pauseOnHover
            className="w-full"
          >
            {STACK_TAGS.map((tag) => (
              <Tag key={tag} variant="solid" className="mx-1 whitespace-nowrap">
                {tag}
              </Tag>
            ))}
          </Marquee>
        </section>

        {/* 一句品牌宣言，立住调性 */}
        <footer className="hl-rise mt-16" style={rise(10 + liveCategories.length)}>
          <Separator className="mb-6" />
          <Text size="sm" tone="muted">
            {content.declaration}
          </Text>
        </footer>
      </main>
    </>
  );
}
