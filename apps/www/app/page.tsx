import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { JsonLd } from "../components/json-ld";
import {
  AuroraText,
  BorderBeam,
  Card,
  DotPattern,
  FadeMask,
  Heading,
  Reveal,
  Snippet,
  SnippetGroup,
  SparklesText,
  Spotlight,
  Stagger,
  StaggerItem,
  Text,
} from "@hulianui/ui";
import { HomeAccentProvider } from "../components/home-accent";
import { SiteNavbar } from "../components/site-navbar";
import { HomeHeroWall } from "../components/home-hero-wall";
import { HomeProductLines } from "../components/home-product-lines";
import { HomePlayground } from "../components/home-playground";
import { HomeAiBand, HomeBuiltWith, HomeClosing } from "../components/home-sections";
import { manifest } from "../lib/manifest";
import { blocks } from "./blocks/_meta";
import { pages } from "./pages/_meta";
import { demos } from "./demos/lib/demos";
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

// 品牌名的星点、slogan 关键词的流光共用这组色（模块级常量：SparklesText 把 colors 放进
// effect 依赖，每次渲染新建数组会让星点不停重生）。
// 色相：围绕右侧组件墙当前色相（--hl-accent-hue，由 AccentScope 写在首页宿主上）
// 左右各偏 40° 取三个色，于是墙一换色，这里跟着换。light-dark() 让暗色下抬高明度。
const auroraStop = (offset: number) =>
  `light-dark(oklch(0.55 0.19 calc(var(--hl-accent-hue) + ${offset})), oklch(0.78 0.15 calc(var(--hl-accent-hue) + ${offset})))`;
const AURORA_COLORS = [auroraStop(0), auroraStop(40), auroraStop(-40)];

// AI 接入指南的完整地址（带语言前缀），上手卡里给复制
const AI_GUIDE_URL = `${SITE_URL}${withDocsBasePath("/start")}`;

// 首页各段用到的计数：直接从各自的数据源数，增删条目自动跟上
const total = manifest.length;
const animatedCount = manifest.filter((m) => m.tags?.includes("animated")).length;

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
      {/* 主题色宿主：组件墙选的色相写在这里（AccentScope），顶栏与整页的主色都从它派生。 */}
      <HomeAccentProvider>
        <SiteNavbar />
        <main>
          {/* Hero —— 左文案、右组件墙。墙向右（宽屏）/ 向下（窄屏）出血被裁掉，用「放不下」
            说明「有很多」。overflow-clip 而不是 hidden：墙里有可聚焦控件，hidden 的容器
            会被 Tab 聚焦带着滚动、把整面墙挪位，clip 不可滚。isolate 让背景层锁在本段内。 */}
          <section className="relative isolate overflow-clip">
            {/* 纹理层：点阵向四周淡出；辉光叠在纹理上，渐隐到透明不遮挡纹理 */}
            <FadeMask
              direction="radial"
              at="30% 10%"
              size="40% 50%"
              className="absolute inset-0 -z-10"
            >
              <DotPattern />
            </FadeMask>
            <Spotlight
              blend="transparent"
              x="30%"
              size="50% 60%"
              intensity={18}
              fade={70}
              className="inset-x-0 bottom-auto top-0 -z-10 h-80"
            />

            <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-12 px-6 pt-16 sm:pt-24 lg:min-h-[44rem] lg:grid-cols-[30rem_minmax(0,1fr)] lg:gap-14">
              {/* 动效只放在四个焦点上、各管一件事：品牌名的星点（点睛）、slogan 关键词的流光
                （强调）、上手卡的边框光束（引导视线到安装命令）、组件墙里的数字滚动与主题名轮换。
                每一处都尊重 prefers-reduced-motion。同屏再多就互相抢注意力，等于没有重点。
                入场：四段逐级上浮（Stagger，挂载即播）。 */}
              <Stagger trigger="mount" gap={0.07} delay={0.14} className="lg:pt-8">
                <StaggerItem y={10} blur={0}>
                  <Heading level={1} size="display" className="mt-3">
                    <SparklesText colors={AURORA_COLORS} sparklesCount={8}>
                      {content.brand}
                    </SparklesText>
                  </Heading>
                </StaggerItem>

                <StaggerItem y={10} blur={0}>
                  <Heading as="p" level={2} size="2xl" weight="semibold" balance className="mt-8 max-w-xl">
                    {content.taglineLead}
                    <AuroraText colors={AURORA_COLORS}>{content.taglineAccent}</AuroraText>
                    {content.taglineTail}
                  </Heading>
                </StaggerItem>
                <StaggerItem y={10} blur={0}>
                  <Text tone="muted" className="mt-3 max-w-xl leading-relaxed">
                    {content.origin}
                  </Text>
                </StaggerItem>

                {/* 上手卡：装库、接 AI、AI 接入指南链接，三行都是一键复制，不加说明文字。
                  「浏览组件」按钮已撤：右侧组件墙就是浏览入口的预览，顶栏也有「组件」。 */}
                <StaggerItem y={10} blur={0}>
                  <SnippetGroup
                    overlay={<BorderBeam size={120} duration={9} />}
                    className="mt-10 w-full max-w-[30rem]"
                  >
                    <Snippet copyLabel={content.copy} copiedLabel={content.copied}>
                      pnpm add @hulianui/ui @hulianui/tokens
                    </Snippet>
                    <Snippet copyLabel={content.copy} copiedLabel={content.copied}>
                      npx @hulianui/mcp init-agent
                    </Snippet>
                    {/* AI 接入指南给完整链接、一键复制：它的用法就是贴给 AI 编程助手读，
                      不是让人点进去看，所以复制比跳转更顺手。 */}
                    <Snippet
                      symbol={null}
                      highlight={false}
                      muted
                      copyLabel={content.copy}
                      copiedLabel={content.copied}
                    >
                      {AI_GUIDE_URL}
                    </Snippet>
                  </SnippetGroup>
                </StaggerItem>
              </Stagger>

              {/* 墙的面板：一张出血的卡（右缘在视口外），左上角一片主色辉光；底部淡出。
                面板在 AccentScope 里，主题色切换会把辉光一起染上。 */}
              <div className="relative -mr-6 h-[30rem] lg:mr-0 lg:h-auto">
                <Reveal trigger="mount" y={10} blur={0} delay={0.28} className="absolute inset-y-0 left-0 w-screen">
                  <FadeMask direction="bottom" start="72%" className="h-full">
                    <Card className="relative h-full overflow-clip p-7">
                      <Spotlight x="0%" y="0%" size="70% 90%" intensity={7} fade={70} />
                      <HomeHeroWall />
                    </Card>
                  </FadeMask>
                </Reveal>
              </div>
            </div>
          </section>

          <HomeProductLines counts={[total, blocks.length, pages.length, demos.length]} />
          <div className="border-y border-border/60 bg-muted/30">
            <HomePlayground />
          </div>
          <HomeAiBand counts={[total, animatedCount, blocks.length, pages.length]} />
          <HomeBuiltWith />
          <HomeClosing />
        </main>
      </HomeAccentProvider>
    </>
  );
}
