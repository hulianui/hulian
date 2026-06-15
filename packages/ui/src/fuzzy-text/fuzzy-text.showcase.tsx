"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { FuzzyText } from "./fuzzy-text";

/**
 * 展示用深色底容器，让噪点字效在高对比下清晰可见。
 * data-theme="dark" 把子树 token 锁定为暗色主题值：FuzzyText 默认的
 * var(--color-foreground)（及 chart-* token）在此作用域内解析为亮色，
 * 亮色主题浏览页面时也不会出现深字撞深底。
 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-theme="dark"
      className="flex min-h-44 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border p-6"
      style={{ background: "var(--color-bg)" }}
    >
      {children}
    </div>
  );
}

export const fuzzyTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "文字逐行随机错位形成扫描噪点，悬停时抖动加剧。默认色吃 var(--color-foreground) 随主题。",
      code: `<FuzzyText fontSize="clamp(2rem, 8vw, 5rem)">瑚琏</FuzzyText>`,
      render: () => (
        <Stage>
          <FuzzyText fontSize="clamp(2rem, 8vw, 5rem)">瑚琏</FuzzyText>
        </Stage>
      ),
    },
    {
      title: "404 信号噪点",
      description: "调大 fuzzRange 与 baseIntensity，营造信号失真感，适合错误页大标题。",
      code: `<FuzzyText
  fontSize="clamp(3rem, 14vw, 8rem)"
  fuzzRange={42}
  baseIntensity={0.3}
  color="var(--color-chart-1)"
>
  404
</FuzzyText>`,
      render: () => (
        <Stage>
          <FuzzyText
            fontSize="clamp(3rem, 14vw, 8rem)"
            fuzzRange={42}
            baseIntensity={0.3}
            color="var(--color-chart-1)"
          >
            404
          </FuzzyText>
        </Stage>
      ),
    },
    {
      title: "纵向错位",
      description: "direction=\"vertical\" 改为逐列上下错位。",
      code: `<FuzzyText direction="vertical" color="var(--color-chart-2)">GLITCH</FuzzyText>`,
      render: () => (
        <Stage>
          <FuzzyText
            fontSize="clamp(2rem, 8vw, 4.5rem)"
            direction="vertical"
            color="var(--color-chart-2)"
          >
            GLITCH
          </FuzzyText>
        </Stage>
      ),
    },
    {
      title: "双向叠加",
      description: "direction=\"both\" 横纵错位叠加，噪点最强；hoverIntensity 控制悬停增益。",
      code: `<FuzzyText direction="both" hoverIntensity={0.8} color="var(--color-chart-4)">NOISE</FuzzyText>`,
      render: () => (
        <Stage>
          <FuzzyText
            fontSize="clamp(2rem, 8vw, 4.5rem)"
            direction="both"
            hoverIntensity={0.8}
            color="var(--color-chart-4)"
          >
            NOISE
          </FuzzyText>
        </Stage>
      ),
    },
  ],
  controls: [
    { prop: "baseIntensity", type: "number", defaultValue: 0.18, label: "静息强度 0–1" },
    { prop: "hoverIntensity", type: "number", defaultValue: 0.5, label: "悬停强度 0–1" },
    { prop: "fuzzRange", type: "number", defaultValue: 30, label: "位移幅度 px" },
    {
      prop: "direction",
      type: "select",
      options: ["horizontal", "vertical", "both"],
      defaultValue: "horizontal",
      label: "抖动方向",
    },
    { prop: "enableHover", type: "boolean", defaultValue: true, label: "悬停增强" },
  ],

  states: [
    {
      name: "default（默认横向扫描）",
      render: () => (
        <Stage>
          {/* 不显式传色：默认 var(--color-foreground) 在 Stage 的 dark 作用域内解析为亮色 */}
          <FuzzyText fontSize="clamp(2rem, 8vw, 5rem)">瑚琏</FuzzyText>
        </Stage>
      ),
    },
    {
      name: "404（高位移 · 信号噪点感）",
      render: () => (
        <Stage>
          <FuzzyText
            fontSize="clamp(3rem, 14vw, 8rem)"
            fuzzRange={42}
            baseIntensity={0.3}
            color="var(--color-chart-1)"
          >
            404
          </FuzzyText>
        </Stage>
      ),
    },
    {
      name: "vertical（纵向错位）",
      render: () => (
        <Stage>
          <FuzzyText
            fontSize="clamp(2rem, 8vw, 4.5rem)"
            direction="vertical"
            color="var(--color-chart-2)"
          >
            GLITCH
          </FuzzyText>
        </Stage>
      ),
    },
    {
      name: "both（双向 · 雪花最强）",
      render: () => (
        <Stage>
          <FuzzyText
            fontSize="clamp(2rem, 8vw, 4.5rem)"
            direction="both"
            hoverIntensity={0.8}
            color="var(--color-chart-4)"
          >
            NOISE
          </FuzzyText>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <FuzzyText
        fontSize="clamp(2rem, 8vw, 5rem)"
        baseIntensity={p.baseIntensity as number}
        hoverIntensity={p.hoverIntensity as number}
        fuzzRange={p.fuzzRange as number}
        direction={p.direction as "horizontal" | "vertical" | "both"}
        enableHover={p.enableHover as boolean}
      >
        瑚琏
      </FuzzyText>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<FuzzyText`,
      `  baseIntensity={${p.baseIntensity}}`,
      `  hoverIntensity={${p.hoverIntensity}}`,
      `  fuzzRange={${p.fuzzRange}}`,
      `  direction="${p.direction}"`,
      `  enableHover={${p.enableHover}}`,
      `>`,
      `  瑚琏`,
      `</FuzzyText>`,
    ].join("\n"),
};
