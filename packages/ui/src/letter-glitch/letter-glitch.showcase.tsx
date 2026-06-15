"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { LetterGlitch } from "./letter-glitch";

/** 展示用深色底容器，让字符故障雨清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const letterGlitchShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "放进 relative 深色容器，组件铺满并默认吃 chart token 调色板。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <LetterGlitch className="absolute inset-0" />
</div>`,
      render: () => (
        <Stage>
          <LetterGlitch className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      title: "硬切故障感",
      description: "smooth=false 关闭逐帧插值，字符颜色硬切，更生硬的故障雨。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <LetterGlitch className="absolute inset-0" smooth={false} glitchSpeed={40} />
</div>`,
      render: () => (
        <Stage>
          <LetterGlitch className="absolute inset-0" smooth={false} glitchSpeed={40} />
        </Stage>
      ),
    },
    {
      title: "中心暗角 + 置入内容",
      description: "centerVignette 压暗中部反衬叠加文案，关掉 outerVignette。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <LetterGlitch className="absolute inset-0" outerVignette={false} centerVignette />
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <p className="text-lg font-semibold tracking-widest text-white">GLITCH</p>
  </div>
</div>`,
      render: () => (
        <Stage>
          <LetterGlitch
            className="absolute inset-0"
            outerVignette={false}
            centerVignette
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-lg font-semibold tracking-widest text-white">
              GLITCH
            </p>
          </div>
        </Stage>
      ),
    },
    {
      title: "自定义调色板（终端绿/青）",
      description: "glitchColors 传任意 CSS 颜色数组，离屏 canvas 解析后插值。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <LetterGlitch
    className="absolute inset-0"
    glitchColors={[
      "var(--color-chart-2)",
      "oklch(0.78 0.18 160)",
      "oklch(0.7 0.14 220)",
    ]}
    glitchSpeed={70}
  />
</div>`,
      render: () => (
        <Stage>
          <LetterGlitch
            className="absolute inset-0"
            glitchColors={[
              "var(--color-chart-2)",
              "oklch(0.78 0.18 160)",
              "oklch(0.7 0.14 220)",
            ]}
            glitchSpeed={70}
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "glitchSpeed", type: "number", defaultValue: 50, label: "刷新间隔 ms" },
    { prop: "smooth", type: "boolean", defaultValue: true, label: "颜色平滑过渡" },
    { prop: "outerVignette", type: "boolean", defaultValue: true, label: "外缘暗角" },
    { prop: "centerVignette", type: "boolean", defaultValue: false, label: "中心暗角" },
  ],

  states: [
    {
      name: "default（默认参数 · chart token 调色板）",
      render: () => (
        <Stage>
          <LetterGlitch className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "硬切（smooth=false · 更生硬的故障感）",
      render: () => (
        <Stage>
          <LetterGlitch className="absolute inset-0" smooth={false} glitchSpeed={40} />
        </Stage>
      ),
    },
    {
      name: "中心暗角 + 置入内容",
      render: () => (
        <Stage>
          <LetterGlitch
            className="absolute inset-0"
            outerVignette={false}
            centerVignette
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-lg font-semibold tracking-widest text-white">
              GLITCH
            </p>
          </div>
        </Stage>
      ),
    },
    {
      name: "自定义调色板（绿/青终端风）",
      render: () => (
        <Stage>
          <LetterGlitch
            className="absolute inset-0"
            glitchColors={[
              "var(--color-chart-2)",
              "oklch(0.78 0.18 160)",
              "oklch(0.7 0.14 220)",
            ]}
            glitchSpeed={70}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <LetterGlitch
        className="absolute inset-0"
        glitchSpeed={p.glitchSpeed as number}
        smooth={p.smooth as boolean}
        outerVignette={p.outerVignette as boolean}
        centerVignette={p.centerVignette as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <LetterGlitch`,
      `    className="absolute inset-0"`,
      `    glitchSpeed={${p.glitchSpeed}}`,
      `    smooth={${p.smooth}}`,
      `    outerVignette={${p.outerVignette}}`,
      `    centerVignette={${p.centerVignette}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
