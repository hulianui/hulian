import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

// 站在巨人肩上 —— 吸取式聚合的底座（dogfood Marquee 滚动呈现）
const STACK_TAGS = [
  "Base UI",
  "TanStack Table",
  "Recharts",
  "Tailwind v4",
  "Motion",
  "MagicUI",
  "MUI 桥",
  "OKLCH Token",
];

const total = manifest.length;
const liveCategories = CATEGORIES.filter(
  (cat) => manifest.some((m) => m.category === cat.key),
);

// 入场逐级揭示的延迟（prefers-reduced-motion 下由 globals.css 整体禁用）
const rise = (i: number): CSSProperties => ({ animationDelay: `${i * 70}ms` });

export default function Home() {
  return (
    <>
      <SiteNavbar />
      <main className="mx-auto max-w-4xl px-6 pb-12 pt-8 sm:pb-16">
      {/* Hero —— 左对齐、非对称，靠层级与留白说话；isolate 让背景层锁在本段内 */}
      <section className="relative isolate pt-20 sm:pt-28">
        {/* 纹理层：dogfood 自家 DotPattern，径向遮罩向四周淡出（库无「辉光」件，渐变仍走 CSS） */}
        <DotPattern
          className="-z-10 text-border/70 [mask-image:radial-gradient(40%_50%_at_30%_10%,black,transparent)]"
        />
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
          瑚琏
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
          颜值 + 好用，是软件的第一生产力。
        </Heading>
        <Text tone="muted" className="hl-rise mt-3 max-w-xl leading-relaxed" style={rise(4)}>
          名出《论语》宗庙之玉器——至贵至美，而确有大用。
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
            浏览 {total} 个组件
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Button>
          <Button variant="outline" render={<Link href="/blocks" />} className="group h-11 px-5">
            区块
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Button>
          <Button variant="outline" render={<Link href="/pages" />} className="group h-11 px-5">
            页面
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Button>
          <Button variant="ghost" render={<Link href="/demos" />} className="group h-11 px-5">
            模版
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Button>
        </Stack>

        {/* 安装命令：dogfood Snippet，一行复制即用 */}
        <div className="hl-rise mt-6 max-w-xs" style={rise(6)}>
          <Snippet>pnpm add @hulianui/ui</Snippet>
        </div>
      </section>

      {/* 浏览区：按「组件 / 区块 / 页面 / 示例」四档切换的发丝线列表（dogfood Segmented） */}
      <section className="hl-rise mt-20 sm:mt-24" style={rise(8)} aria-label="浏览">
        <TierBrowser />
      </section>

      {/* 技术底座（新区块）：dogfood Marquee 滚动展示吸取的上游 */}
      <section className="hl-rise mt-20 sm:mt-24" style={rise(9)}>
        <Heading as="p" size="sm" weight="medium" className="mb-4 text-muted">
          站在巨人肩上 · 吸取式聚合
        </Heading>
        <Marquee
          pauseOnHover
          className="w-full [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        >
          {STACK_TAGS.map((tag) => (
            <Tag key={tag} variant="soft" className="mx-1 whitespace-nowrap">
              {tag}
            </Tag>
          ))}
        </Marquee>
      </section>

      {/* 一句品牌宣言，立住调性 */}
      <footer className="hl-rise mt-16" style={rise(10 + liveCategories.length)}>
        <Separator className="mb-6" />
        <Text size="sm" tone="muted">
          人不该油头满面地对着丑软件干活。
        </Text>
      </footer>
      </main>
    </>
  );
}
