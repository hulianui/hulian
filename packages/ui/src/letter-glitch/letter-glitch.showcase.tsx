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
