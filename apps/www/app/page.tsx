import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  Type,
  TextCursorInput,
  BarChart3,
  Compass,
  Megaphone,
  Bot,
  Sparkles,
  Smartphone,
  Hand,
  Zap,
  ShieldCheck,
  Package,
  Palette,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatedThemeToggler,
  BentoCard,
  BentoGrid,
  Button,
  Dot,
  DotPattern,
  Heading,
  Marquee,
  NumberTicker,
  Separator,
  Snippet,
  Stack,
  Tag,
  Text,
} from "@hulian/ui";
import { manifest, CATEGORIES, type CategoryKey } from "../lib/manifest";

// 每个分类一枚线性图标 —— 承担导航语义，而非标题上方的装饰圆角盒
const CATEGORY_ICON: Record<CategoryKey, LucideIcon> = {
  layout: LayoutGrid,
  typography: Type,
  forms: TextCursorInput,
  "data-display": BarChart3,
  navigation: Compass,
  feedback: Megaphone,
  ai: Bot,
  decoration: Sparkles,
  mockups: Smartphone,
  mobile: Hand,
};

// 一句话剧透每类装了什么（渐进式呈现，帮用户在点进去前就建立预期）
const CATEGORY_BLURB: Record<CategoryKey, string> = {
  layout: "容器 · 栅格 · 分栏 · 间距",
  typography: "文本 · 标题 · 代码 · 按键",
  forms: "按钮 · 输入 · 选择 · 日期",
  "data-display": "表格 · 图表 · 指标 · 卡片",
  navigation: "选项卡 · 面包屑 · 分页 · 菜单",
  feedback: "对话框 · 提示 · 抽屉 · 进度",
  ai: "对话 · 气泡 · 工具调用 · 流式",
  decoration: "光束 · 背景 · 边框流光",
  mockups: "浏览器 · 手机外壳",
  mobile: "导航 · 浮层 · 滚轮 · 滑动手势",
};

// 为什么用瑚琏 —— 四条立得住的承诺（dogfood BentoGrid 呈现）
const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Zap, title: "0 闪烁双主题", desc: "明暗切换无白屏，SSR 注入变量先于绘制" },
  { icon: ShieldCheck, title: "键盘可达", desc: "Base UI 底座 · WAI-ARIA · 测试覆盖" },
  { icon: Package, title: "可发布 npm", desc: "import 即用，按需 tree-shake 不拖体积" },
  { icon: Palette, title: "Token 驱动", desc: "OKLCH 明暗双层语义 token，换肤只改一处" },
];

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
    <main className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      {/* 顶栏：极简 wordmark + 版本徽标 + 主题切换 */}
      <Stack
        as="header"
        direction="row"
        align="center"
        justify="between"
        className="hl-rise"
        style={rise(0)}
      >
        <Stack direction="row" align="center" gap={2} className="text-sm">
          <Dot tone="brand" pulse label="瑚琏" />
          <Text as="span" weight="medium" className="tracking-tight">
            瑚琏 Hulian
          </Text>
          <Tag variant="soft" size="sm">
            v0.1
          </Tag>
        </Stack>
        <AnimatedThemeToggler />
      </Stack>

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
          as="p"
          size="sm"
          weight="medium"
          className="hl-rise uppercase tracking-[0.25em] text-muted"
          style={rise(1)}
        >
          Hulian · React 设计系统
        </Heading>

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
          名出《论语》宗庙之玉器——至贵至美，而确有大用。站在 Base UI · TanStack · Recharts
          肩上博采众长，聚成一套可直接 import 的 React 组件。
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
          <Button variant="outline" render={<Link href="/theme" />} className="group h-11 px-5">
            主题 Token
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Button>
          <Button variant="ghost" render={<Link href="/demos" />} className="group h-11 px-5">
            看示例
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Button>
        </Stack>

        {/* 安装命令：dogfood Snippet，一行复制即用 */}
        <div className="hl-rise mt-6 max-w-xs" style={rise(6)}>
          <Snippet>pnpm add @hulian/ui</Snippet>
        </div>
      </section>

      {/* 数据条：dogfood NumberTicker 滚动计数，立住「有料」的第一印象 */}
      <Stack
        direction="row"
        wrap
        gap={10}
        className="hl-rise mt-14 border-t border-border pt-8"
        style={rise(7)}
      >
        <Stat value={total} suffix="+" label="组件" />
        <Stat value={liveCategories.length} label="分类" />
        <Stat value={2} label="主题" />
        <Stat value={0} label="切换闪烁" />
      </Stack>

      {/* 特性亮点（新区块）：dogfood BentoGrid 四张承诺卡 */}
      <section className="hl-rise mt-20 sm:mt-24" style={rise(8)}>
        <Heading level={2} size="base" className="mb-5">
          为什么用瑚琏
        </Heading>
        <BentoGrid className="auto-rows-[10rem] sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <BentoCard key={title} icon={<Icon aria-hidden />} title={title} description={desc} />
          ))}
        </BentoGrid>
      </section>

      {/* 分类导航：编辑式发丝线列表（dogfood Heading/Text/Stack 排版原语） */}
      <nav className="mt-20 border-t border-border sm:mt-24" aria-label="组件分类">
        {liveCategories.map((cat, i) => {
          const Icon = CATEGORY_ICON[cat.key];
          const count = manifest.filter((m) => m.category === cat.key).length;
          return (
            <Link
              key={cat.key}
              href={`/components#${cat.key}`}
              className="hl-rise group flex items-center gap-4 border-b border-border py-4 transition-colors hover:bg-surface-hover"
              style={rise(9 + i)}
            >
              <Icon
                className="size-5 shrink-0 text-muted transition-colors group-hover:text-primary"
                aria-hidden
              />
              <Text as="span" weight="medium" className="w-20 shrink-0">
                {cat.label}
              </Text>
              <Text
                as="span"
                size="sm"
                tone="muted"
                truncate
                className="hidden flex-1 sm:block"
              >
                {CATEGORY_BLURB[cat.key]}
              </Text>
              <Text as="span" size="sm" tone="muted" className="ml-auto tabular-nums">
                {count}
              </Text>
              <ArrowRight
                className="size-4 shrink-0 text-muted/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
                aria-hidden
              />
            </Link>
          );
        })}
      </nav>

      {/* 技术底座（新区块）：dogfood Marquee 滚动展示吸取的上游 */}
      <section
        className="hl-rise mt-20 sm:mt-24"
        style={rise(9 + liveCategories.length)}
      >
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
  );
}

// 单个数据项：滚动数字 + 弱化标签
function Stat({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  return (
    <Stack gap={1}>
      <Stack direction="row" align="baseline" gap={0} as="span">
        <NumberTicker value={value} className="text-3xl font-semibold tabular-nums text-foreground" />
        {suffix ? (
          <Text as="span" size="xl" weight="semibold">
            {suffix}
          </Text>
        ) : null}
      </Stack>
      <Text as="span" size="sm" tone="muted">
        {label}
      </Text>
    </Stack>
  );
}
