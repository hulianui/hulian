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
