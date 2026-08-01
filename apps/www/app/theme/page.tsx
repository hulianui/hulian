import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { THEME_NAV } from "../../lib/theme-manifest";
import { DocHeader, Section, Code } from "./_components/doc-kit";

export const metadata: Metadata = { title: "Theme 总览 · 瑚琏 Hulian" };

const LAYERS = [
  {
    n: "01",
    name: "原始层 Primitives",
    file: "primitives.css",
    desc: "OKLCH 原始色板（gray-50…950、brand/danger/success/warning）。明暗共用，不随主题变，只是「调色盘」。",
  },
  {
    n: "02",
    name: "语义层 Semantic",
    file: "semantic.css",
    desc: "把原始色按用途命名（color-bg / color-primary / color-danger…）。明暗在此切换——只换值不换结构。组件只消费这一层。",
  },
  {
    n: "03",
    name: "预设层 Preset",
    file: "preset.css",
    desc: "Tailwind v4 @theme：把语义 token 映射成工具类，并把 dark variant 绑到 [data-theme]。断点、radius 也在此声明为 SSOT。",
  },
];

export default function ThemeOverviewPage() {
  const subPages = THEME_NAV.filter((n) => n.slug);
  return (
    <div>
      <DocHeader
        title="主题与设计 Token"
        en="Theme"
        lede={
          <>
            瑚琏的一切视觉都由设计 token 驱动，分三层：原始 → 语义 → 预设。消费方只需全局引入两个
            CSS 文件，组件、明暗、断点便全部就位。
          </>
        }
      />

      <Section title="三层 Token 架构" desc="改下层影响上层；组件永远只碰最上面的语义/工具类。">
        <ol className="space-y-3">
          {LAYERS.map((l) => (
            <li
              key={l.n}
              className="flex gap-4 rounded-[var(--radius)] border border-border bg-surface p-5"
            >
              <span className="font-mono text-sm tabular-nums text-muted">{l.n}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="font-medium">{l.name}</h3>
                  <Code>@hulianui/tokens/{l.file}</Code>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{l.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="如何消费" desc="任意 React 项目，全局引一次即可。">
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          <span className="text-muted">{"/* app/globals.css */"}</span>
          {"\n"}@import "@hulianui/tokens/tokens.css";  <span className="text-muted">{"/* 原始 + 语义 */"}</span>
          {"\n"}@import "@hulianui/tokens/preset.css"; <span className="text-muted">{"/* Tailwind v4 + 工具类 */"}</span>
        </pre>
      </Section>

      <Section title="逐项查看">
        <div className="grid gap-2 sm:grid-cols-2">
          {subPages.map((p) => (
            <Link
              key={p.slug}
              href={`/theme/${p.slug}`}
              className="group flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-hover"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{p.label}</span>
                  <span className="text-xs text-muted">{p.en}</span>
                </div>
                <p className="truncate text-sm text-muted">{p.blurb}</p>
              </div>
              <ArrowRight
                className="size-4 shrink-0 text-muted/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
