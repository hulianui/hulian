import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { JsonLd } from "../components/json-ld";
import {
  AuroraText,
  BorderBeam,
  DotPattern,
  Heading,
  Snippet,
  SparklesText,
  Text,
} from "@hulianui/ui";
import { SiteNavbar } from "../components/site-navbar";
import { HomeHeroWall } from "../components/home-hero-wall";
import {
  DOCS_LOCALE,
  ROOT_LOCALE,
  canonicalPathForLocale,
  withDocsBasePath,
} from "../lib/docs-locale";
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

// 入场逐级揭示的延迟（prefers-reduced-motion 下由 globals.css 整体禁用）
// 品牌名的星点、slogan 关键词的流光共用这组色（模块级常量：SparklesText 把 colors 放进
// effect 依赖，每次渲染新建数组会让星点不停重生）。
// 色相：围绕右侧组件墙当前色相（--hw-hue，由墙写到 hero 区块上）
// 左右各偏 40° 取三个色，于是墙一换色，这里跟着换。light-dark() 让暗色下抬高明度。
const auroraStop = (offset: number) =>
  `light-dark(oklch(0.55 0.19 calc(var(--hw-hue) + ${offset})), oklch(0.78 0.15 calc(var(--hw-hue) + ${offset})))`;
const AURORA_COLORS = [auroraStop(0), auroraStop(40), auroraStop(-40)];

// AI 接入指南的完整地址（带语言前缀），上手卡里给复制
const AI_GUIDE_URL = `${SITE_URL}${withDocsBasePath("/start")}`;

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
      {/* 主题色宿主：组件墙把当前色相写到这里，顶栏与整页的主色都从它派生（见 globals.css）。 */}
      <div data-hero-accent>
        <SiteNavbar />
        <main>
          {/* Hero —— 左文案、右组件墙。墙向右（宽屏）/ 向下（窄屏）出血被裁掉，用「放不下」
            说明「有很多」。overflow-clip 而不是 hidden：墙里有可聚焦控件，hidden 的容器
            会被 Tab 聚焦带着滚动、把整面墙挪位，clip 不可滚。isolate 让背景层锁在本段内。 */}
          <section className="relative isolate overflow-clip">
            {/* 纹理层：dogfood 自家 DotPattern，径向遮罩向四周淡出（库无「辉光」件，渐变仍走 CSS） */}
            <DotPattern className="-z-10 text-border/70 [mask-image:radial-gradient(40%_50%_at_30%_10%,black,transparent)]" />
            {/* 品牌辉光：径向渐变叠在纹理上做层次（纯 CSS，无库对应件） */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 blur-2xl"
              style={{
                background:
                  "radial-gradient(50% 60% at 30% 0%, color-mix(in oklch, var(--color-primary) 18%, transparent), transparent 70%)",
              }}
            />

            <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-12 px-6 pt-16 sm:pt-24 lg:min-h-[44rem] lg:grid-cols-[30rem_minmax(0,1fr)] lg:gap-14">
              <div className="lg:pt-8">
                {/* 动效只放在四个焦点上、各管一件事：品牌名的星点（点睛）、slogan 关键词的流光
                  （强调）、上手卡的边框光束（引导视线到安装命令）、组件墙里的数字滚动与主题名轮换。
                  每一处都尊重 prefers-reduced-motion。同屏再多就互相抢注意力，等于没有重点。 */}
                <Heading
                  level={1}
                  size="4xl"
                  className="hl-rise mt-3 text-6xl tracking-tight sm:text-7xl"
                  style={rise(2)}
                >
                  <SparklesText colors={AURORA_COLORS} sparklesCount={8}>
                    {content.brand}
                  </SparklesText>
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
                  {content.taglineLead}
                  <AuroraText colors={AURORA_COLORS}>{content.taglineAccent}</AuroraText>
                  {content.taglineTail}
                </Heading>
                <Text
                  tone="muted"
                  className="hl-rise mt-3 max-w-xl leading-relaxed"
                  style={rise(4)}
                >
                  {content.origin}
                </Text>

                {/* 上手卡：装库、接 AI、AI 接入指南链接，三行都是一键复制，不加说明文字。
              「浏览组件」按钮已撤：右侧组件墙就是浏览入口的预览，顶栏也有「组件」。 */}
                <div
                  className="hl-rise relative mt-10 w-full max-w-[30rem] overflow-hidden rounded-xl border border-border/80 bg-surface shadow-sm"
                  style={rise(5)}
                >
                  <BorderBeam size={120} duration={9} />
                  <Snippet
                    copyLabel={content.copy}
                    copiedLabel={content.copied}
                    className="flex w-full rounded-none border-0 bg-transparent px-4 py-3"
                  >
                    pnpm add @hulianui/ui @hulianui/tokens
                  </Snippet>
                  <div className="border-t border-border/70" />
                  <Snippet
                    copyLabel={content.copy}
                    copiedLabel={content.copied}
                    className="flex w-full rounded-none border-0 bg-transparent px-4 py-3"
                  >
                    npx @hulianui/mcp init-agent
                  </Snippet>
                  {/* AI 接入指南给完整链接、一键复制：它的用法就是贴给 AI 编程助手读，
                    不是让人点进去看，所以复制比跳转更顺手。 */}
                  <Snippet
                    symbol={null}
                    highlight={false}
                    copyLabel={content.copy}
                    copiedLabel={content.copied}
                    className="flex w-full rounded-none border-0 border-t border-border/70 bg-muted/50 px-4 py-3 text-muted-foreground [&_code]:break-all"
                  >
                    {AI_GUIDE_URL}
                  </Snippet>
                </div>
              </div>

              {/* 墙本身就是带底色的面板，主题色切换会把面板一起染上 —— 覆盖写在墙的根节点上，
              所以面板底色必须由墙自己画，放在外层就吃不到覆盖。 */}
              <div className="relative -mr-6 h-[30rem] lg:mr-0 lg:h-auto">
                <HomeHeroWall
                  className="hl-rise absolute inset-y-0 left-0 w-screen overflow-clip rounded-l-[2rem] border-y border-l border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-primary)_7%,var(--color-bg)),var(--color-bg)_70%)] p-7 [mask-image:linear-gradient(to_bottom,black_72%,transparent)]"
                  style={rise(4)}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
