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
  examples: [
    {
      title: "基础用法",
      description: "开箱即用的金属反光证件卡，高光带沿对角线往复横扫，title / subtitle / footer 默认内置。",
      code: `<ReflectiveCard />`,
      render: () => (
        <Stage>
          <ReflectiveCard />
        </Stage>
      ),
    },
    {
      title: "自定义文案与配色",
      description: "sheenColor 控高光主色、baseColor 控底色基调，title / subtitle / footer 全可定制。",
      code: `<ReflectiveCard
  sheenColor="oklch(0.85 0.16 85)"
  baseColor="var(--color-chart-3)"
  title="JANE SMITH"
  subtitle="PLATINUM MEMBER"
  footerLabel="MEMBER NO."
  footerValue="0042-7781-1190"
/>`,
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
      title: "金属感与磨砂",
      description: "metalness 控高光层强度、roughness 控磨砂噪点、speed 控高光横扫时长（秒）。",
      code: `<ReflectiveCard metalness={0.4} roughness={0.8} speed={9} />`,
      render: () => (
        <Stage>
          <ReflectiveCard metalness={0.4} roughness={0.8} speed={9} />
        </Stage>
      ),
    },
    {
      title: "自定义内容",
      description: "传 children 完全替换内置布局，仅保留金属反光背景与边框。",
      code: `<ReflectiveCard baseColor="var(--color-chart-2)">
  <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
    <p className="text-3xl font-bold tracking-widest">瑚琏</p>
    <p className="text-xs uppercase tracking-[0.3em] opacity-70">
      Reflective Card
    </p>
  </div>
</ReflectiveCard>`,
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
