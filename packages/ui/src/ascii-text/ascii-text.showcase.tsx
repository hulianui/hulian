"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ASCIIText } from "./ascii-text";

/** 深色舞台，让字符画对比清晰（字符画默认 text-foreground，深底上更显眼） */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const asciiTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "把文字渲染成字符画，默认开启波动位移与鼠标驱动色相。需放在定宽高的相对定位容器里。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <ASCIIText text="瑚琏" />
</div>`,
      render: () => (
        <Stage>
          <ASCIIText text="瑚琏" className="text-[color:var(--color-chart-1)]" />
        </Stage>
      ),
    },
    {
      title: "英文文本",
      description: "asciiFontSize 调小可提升字符网格密度，英文长文本更清晰。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <ASCIIText text="HULIAN UI" asciiFontSize={7} />
</div>`,
      render: () => (
        <Stage>
          <ASCIIText text="HULIAN UI" asciiFontSize={7} />
        </Stage>
      ),
    },
    {
      title: "静态字符画",
      description: "关闭 enableWaves 与 enableHue 得到无动画的纯字符画。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <ASCIIText text="ASCII" enableWaves={false} enableHue={false} />
</div>`,
      render: () => (
        <Stage>
          <ASCIIText
            text="ASCII"
            enableWaves={false}
            enableHue={false}
            className="text-[color:var(--color-chart-2)]"
          />
        </Stage>
      ),
    },
    {
      title: "高密度细节",
      description: "更小的 asciiFontSize 配合更大的 textFontSize 采样，刻画更多细节。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <ASCIIText text="代码" asciiFontSize={6} textFontSize={200} />
</div>`,
      render: () => (
        <Stage>
          <ASCIIText text="代码" asciiFontSize={6} textFontSize={200} />
        </Stage>
      ),
    },
  ],
  controls: [
    { prop: "text", type: "text", defaultValue: "瑚琏", label: "文本" },
    { prop: "asciiFontSize", type: "number", defaultValue: 8, label: "字符字号 px" },
    { prop: "textFontSize", type: "number", defaultValue: 160, label: "源字号 px" },
    { prop: "enableWaves", type: "boolean", defaultValue: true, label: "波动位移" },
    { prop: "enableHue", type: "boolean", defaultValue: true, label: "鼠标色相" },
  ],

  states: [
    {
      name: "default（瑚琏·波动+色相）",
      render: () => (
        <Stage>
          <ASCIIText text="瑚琏" className="text-[color:var(--color-chart-1)]" />
        </Stage>
      ),
    },
    {
      name: "英文长文本",
      render: () => (
        <Stage>
          <ASCIIText text="HULIAN UI" asciiFontSize={7} />
        </Stage>
      ),
    },
    {
      name: "静态（关波动·关色相）",
      render: () => (
        <Stage>
          <ASCIIText
            text="ASCII"
            enableWaves={false}
            enableHue={false}
            className="text-[color:var(--color-chart-2)]"
          />
        </Stage>
      ),
    },
    {
      name: "高密度细节",
      render: () => (
        <Stage>
          <ASCIIText text="代码" asciiFontSize={6} textFontSize={200} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ASCIIText
        text={p.text as string}
        asciiFontSize={p.asciiFontSize as number}
        textFontSize={p.textFontSize as number}
        enableWaves={p.enableWaves as boolean}
        enableHue={p.enableHue as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <ASCIIText`,
      `    text=${JSON.stringify(p.text)}`,
      `    asciiFontSize={${p.asciiFontSize}}`,
      `    textFontSize={${p.textFontSize}}`,
      `    enableWaves={${p.enableWaves}}`,
      `    enableHue={${p.enableHue}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
