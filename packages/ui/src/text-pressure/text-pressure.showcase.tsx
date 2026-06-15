"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { TextPressure } from "./text-pressure";

/** 深色舞台容器，给逐字压感效果足够对比；鼠标移入即可见字形随光标挤压。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-44 w-full max-w-xl overflow-hidden rounded-xl border border-border px-6"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const textPressureShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "把鼠标移到深色舞台上的文字，字形会随光标距离实时挤压变形。",
      code: `<div
  className="relative h-44 overflow-hidden rounded-xl px-6"
  style={{ background: "oklch(0.14 0.02 255)" }}
>
  <TextPressure
    text="Compressa"
    textColor="oklch(0.98 0 0)"
    className="flex items-center"
  />
</div>`,
      render: () => (
        <Stage>
          <TextPressure
            text="Compressa"
            textColor="oklch(0.98 0 0)"
            className="flex items-center"
          />
        </Stage>
      ),
    },
    {
      title: "描边空心",
      description: "stroke 让字心透明、仅留 token 描边轮廓，制造空心霓虹标题。",
      code: `<TextPressure
  text="Hulian"
  stroke
  textColor="oklch(0.98 0 0)"
  strokeColor="var(--color-primary)"
  className="flex items-center"
/>`,
      render: () => (
        <Stage>
          <TextPressure
            text="Hulian"
            stroke
            textColor="oklch(0.98 0 0)"
            strokeColor="var(--color-primary)"
            className="flex items-center"
          />
        </Stage>
      ),
    },
    {
      title: "透明度联动",
      description: "alpha 开启后，离光标越远的字符越淡，靠近时浮现。",
      code: `<TextPressure
  text="Pressure"
  alpha
  textColor="oklch(0.98 0 0)"
  className="flex items-center"
/>`,
      render: () => (
        <Stage>
          <TextPressure
            text="Pressure"
            alpha
            textColor="oklch(0.98 0 0)"
            className="flex items-center"
          />
        </Stage>
      ),
    },
    {
      title: "仅字重轴",
      description: "关掉宽度与倾斜轴，只让字重随接近度变化，效果更克制。",
      code: `<TextPressure
  text="Bold"
  width={false}
  italic={false}
  textColor="oklch(0.98 0 0)"
  className="flex items-center"
/>`,
      render: () => (
        <Stage>
          <TextPressure
            text="Bold"
            width={false}
            italic={false}
            textColor="oklch(0.98 0 0)"
            className="flex items-center"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "text", type: "text", defaultValue: "Compressa", label: "文字" },
    { prop: "weight", type: "boolean", defaultValue: true, label: "字重轴" },
    { prop: "width", type: "boolean", defaultValue: true, label: "宽度轴" },
    { prop: "italic", type: "boolean", defaultValue: true, label: "倾斜轴" },
    { prop: "alpha", type: "boolean", defaultValue: false, label: "透明度" },
    { prop: "stroke", type: "boolean", defaultValue: false, label: "描边空心" },
  ],

  states: [
    {
      name: "default（移入鼠标看字形压感）",
      render: () => (
        <Stage>
          <TextPressure
            text="Compressa"
            textColor="oklch(0.98 0 0)"
            className="flex items-center"
          />
        </Stage>
      ),
    },
    {
      name: "描边空心（token primary 描边）",
      render: () => (
        <Stage>
          <TextPressure
            text="Hulian"
            stroke
            textColor="oklch(0.98 0 0)"
            strokeColor="var(--color-primary)"
            className="flex items-center"
          />
        </Stage>
      ),
    },
    {
      name: "透明度联动（离得越远越淡）",
      render: () => (
        <Stage>
          <TextPressure
            text="Pressure"
            alpha
            textColor="oklch(0.98 0 0)"
            className="flex items-center"
          />
        </Stage>
      ),
    },
    {
      name: "仅字重（关宽度/倾斜）",
      render: () => (
        <Stage>
          <TextPressure
            text="Bold"
            width={false}
            italic={false}
            textColor="oklch(0.98 0 0)"
            className="flex items-center"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <TextPressure
        text={(p.text as string) || "Compressa"}
        weight={p.weight as boolean}
        width={p.width as boolean}
        italic={p.italic as boolean}
        alpha={p.alpha as boolean}
        stroke={p.stroke as boolean}
        textColor="oklch(0.98 0 0)"
        strokeColor="var(--color-primary)"
        className="flex items-center"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-44 overflow-hidden rounded-xl px-6"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <TextPressure`,
      `    text=${JSON.stringify((p.text as string) || "Compressa")}`,
      `    weight={${p.weight}}`,
      `    width={${p.width}}`,
      `    italic={${p.italic}}`,
      `    alpha={${p.alpha}}`,
      `    stroke={${p.stroke}}`,
      `    className="flex items-center"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
