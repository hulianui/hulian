import type { ShowcaseSpec } from "../showcase/types";
import { ReflectiveCard } from "./reflective-card";

/** 展示用深色舞台，让金属反光卡的高光与噪点清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex w-full items-center justify-center overflow-hidden rounded-xl border border-border p-8"
      style={{ background: "oklch(0.16 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const reflectiveCardShowcase: ShowcaseSpec = {
  controls: [
    { prop: "speed", type: "number", defaultValue: 6, label: "高光秒数" },
    { prop: "roughness", type: "number", defaultValue: 0.35, label: "磨砂 0–1" },
    { prop: "metalness", type: "number", defaultValue: 1, label: "金属感 0–1" },
  ],

  states: [
    {
      name: "default（金属证件卡）",
      render: () => (
        <Stage>
          <ReflectiveCard />
        </Stage>
      ),
    },
    {
      name: "暖金色高光",
      render: () => (
        <Stage>
          <ReflectiveCard
            sheenColor="oklch(0.85 0.16 85)"
            baseColor="var(--color-chart-3)"
            title="JANE SMITH"
            subtitle="PLATINUM MEMBER"
            footerLabel="MEMBER NO."
            footerValue="0042-7781-1190"
          />
        </Stage>
      ),
    },
    {
      name: "低金属感 · 重磨砂",
      render: () => (
        <Stage>
          <ReflectiveCard metalness={0.4} roughness={0.8} speed={9} />
        </Stage>
      ),
    },
    {
      name: "自定义内容（children 插槽）",
      render: () => (
        <Stage>
          <ReflectiveCard baseColor="var(--color-chart-2)">
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-3xl font-bold tracking-widest">瑚琏</p>
              <p className="text-xs uppercase tracking-[0.3em] opacity-70">
                Reflective Card
              </p>
            </div>
          </ReflectiveCard>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ReflectiveCard
        speed={p.speed as number}
        roughness={p.roughness as number}
        metalness={p.metalness as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="flex items-center justify-center rounded-xl p-8"`,
      `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
      `  <ReflectiveCard`,
      `    speed={${p.speed}}`,
      `    roughness={${p.roughness}}`,
      `    metalness={${p.metalness}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
