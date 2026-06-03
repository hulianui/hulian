import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TextCursorInput,
  BarChart3,
  Megaphone,
  Compass,
  Sparkles,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { AnimatedThemeToggler } from "@hulian/ui";
import { manifest, CATEGORIES, type CategoryKey } from "../lib/manifest";

// 每个分类一枚线性图标 —— 承担导航语义，而非标题上方的装饰圆角盒
const CATEGORY_ICON: Record<CategoryKey, LucideIcon> = {
  inputs: TextCursorInput,
  "data-display": BarChart3,
  feedback: Megaphone,
  navigation: Compass,
  effects: Sparkles,
  mockups: Smartphone,
};

// 一句话剧透每类装了什么（渐进式呈现，帮用户在点进去前就建立预期）
const CATEGORY_BLURB: Record<CategoryKey, string> = {
  inputs: "按钮 · 输入 · 选择 · 滑块",
  "data-display": "表格 · 图表 · 指标 · 卡片",
  feedback: "对话框 · 提示 · 抽屉 · 进度",
  navigation: "选项卡 · 面包屑 · 分页 · 步骤",
  effects: "动效文字 · 特效按钮 · 光束背景",
  mockups: "浏览器 · 手机外壳",
};

const total = manifest.length;

// 入场逐级揭示的延迟（prefers-reduced-motion 下由 globals.css 整体禁用）
const rise = (i: number): CSSProperties => ({ animationDelay: `${i * 70}ms` });

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      {/* 顶栏：极简 wordmark + 主题切换 */}
      <header className="hl-rise flex items-center justify-between" style={rise(0)}>
        <span className="flex items-center gap-2 text-sm font-medium tracking-tight">
          <span className="size-2 rounded-full bg-primary" aria-hidden />
          瑚琏 Hulian
        </span>
        <AnimatedThemeToggler />
      </header>

      {/* Hero —— 左对齐、非对称，靠层级与留白说话 */}
      <section className="pt-20 sm:pt-28">
        <h1 className="hl-rise text-6xl font-semibold tracking-tight sm:text-7xl" style={rise(1)}>
          瑚琏
        </h1>
        <p
          className="hl-rise mt-3 text-sm font-medium uppercase tracking-[0.25em] text-muted"
          style={rise(2)}
        >
          Hulian · React 设计系统
        </p>

        <p className="hl-rise mt-8 max-w-xl text-xl text-foreground sm:text-2xl" style={rise(3)}>
          颜值 + 好用，是软件的第一生产力。
        </p>
        <p className="hl-rise mt-3 max-w-xl text-sm leading-relaxed text-muted" style={rise(4)}>
          名出《论语》宗庙之玉器——至贵至美，而确有大用。站在 Base UI · TanStack · Recharts
          肩上博采众长，聚成一套可直接 import 的 React 组件。
        </p>

        <div
          className="hl-rise mt-9 flex flex-wrap items-center gap-x-5 gap-y-3"
          style={rise(5)}
        >
          <Link
            href="/components"
            className="group inline-flex h-11 items-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            浏览 {total} 个组件
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <span className="text-sm text-muted">明暗双主题 0 闪烁 · 键盘可达 · 可发布 npm 包</span>
        </div>
      </section>

      {/* 分类导航：编辑式发丝线列表（非同质卡片网格），每行 icon + 内容剧透 + 计数 */}
      <nav className="mt-20 border-t border-border sm:mt-24" aria-label="组件分类">
        {CATEGORIES.map((cat, i) => {
          const Icon = CATEGORY_ICON[cat.key];
          const count = manifest.filter((m) => m.category === cat.key).length;
          if (count === 0) return null;
          return (
            <Link
              key={cat.key}
              href={`/components#${cat.key}`}
              className="hl-rise group flex items-center gap-4 border-b border-border py-4 transition-colors hover:bg-surface-hover"
              style={rise(6 + i)}
            >
              <Icon
                className="size-5 shrink-0 text-muted transition-colors group-hover:text-primary"
                aria-hidden
              />
              <span className="w-20 shrink-0 font-medium text-foreground">{cat.label}</span>
              <span className="hidden flex-1 truncate text-sm text-muted sm:block">
                {CATEGORY_BLURB[cat.key]}
              </span>
              <span className="ml-auto text-sm tabular-nums text-muted">{count}</span>
              <ArrowRight
                className="size-4 shrink-0 text-muted/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
                aria-hidden
              />
            </Link>
          );
        })}
      </nav>

      {/* 一句品牌宣言，立住调性 */}
      <footer className="hl-rise mt-12" style={rise(6 + CATEGORIES.length)}>
        <p className="text-sm text-muted">人不该油头满面地对着丑软件干活。</p>
      </footer>
    </main>
  );
}
