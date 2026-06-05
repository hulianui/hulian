"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { MagicBento } from "./magic-bento";

/** 展示用容器：留出留白让光晕在卡片间呼吸。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-3xl rounded-xl border border-border bg-surface-hover p-4">
      {children}
    </div>
  );
}

const DEMO_ITEMS = [
  { label: "Insights", title: "数据洞察", description: "追踪用户行为与漏斗", colSpan: 2 },
  { label: "Overview", title: "总览面板", description: "集中式数据视图" },
  { label: "Teamwork", title: "团队协作", description: "无缝实时协同" },
  { label: "Efficiency", title: "自动化", description: "精简重复工作流" },
  { label: "Protection", title: "安全防护", description: "企业级权限与审计", colSpan: 2 },
];

export const magicBentoShowcase: ShowcaseSpec = {
  controls: [
    { prop: "columns", type: "number", defaultValue: 4, label: "网格列数" },
    { prop: "spotlightRadius", type: "number", defaultValue: 280, label: "聚光半径 px" },
    { prop: "enableSpotlight", type: "boolean", defaultValue: true, label: "径向聚光" },
    { prop: "enableBorderGlow", type: "boolean", defaultValue: true, label: "描边光" },
    { prop: "enableTilt", type: "boolean", defaultValue: false, label: "3D 倾斜" },
    { prop: "disableAnimations", type: "boolean", defaultValue: false, label: "关闭交互" },
  ],

  states: [
    {
      name: "default（聚光 + 描边光，鼠标移入卡片体验）",
      render: () => (
        <Stage>
          <MagicBento items={DEMO_ITEMS} />
        </Stage>
      ),
    },
    {
      name: "开启 3D 倾斜",
      render: () => (
        <Stage>
          <MagicBento items={DEMO_ITEMS} enableTilt />
        </Stage>
      ),
    },
    {
      name: "自定义发光色（chart-2）+ 大聚光",
      render: () => (
        <Stage>
          <MagicBento
            items={DEMO_ITEMS}
            glowColor="var(--color-chart-2)"
            spotlightRadius={420}
          />
        </Stage>
      ),
    },
    {
      name: "关闭交互（静态网格 · reduced-motion 等价）",
      render: () => (
        <Stage>
          <MagicBento items={DEMO_ITEMS} disableAnimations />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <MagicBento
        items={DEMO_ITEMS}
        columns={p.columns as number}
        spotlightRadius={p.spotlightRadius as number}
        enableSpotlight={p.enableSpotlight as boolean}
        enableBorderGlow={p.enableBorderGlow as boolean}
        enableTilt={p.enableTilt as boolean}
        disableAnimations={p.disableAnimations as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<MagicBento`,
      `  columns={${p.columns}}`,
      `  spotlightRadius={${p.spotlightRadius}}`,
      `  enableSpotlight={${p.enableSpotlight}}`,
      `  enableBorderGlow={${p.enableBorderGlow}}`,
      `  enableTilt={${p.enableTilt}}`,
      `  disableAnimations={${p.disableAnimations}}`,
      `  items={[`,
      `    { label: "Insights", title: "数据洞察", description: "追踪用户行为", colSpan: 2 },`,
      `    { label: "Overview", title: "总览面板", description: "集中式数据视图" },`,
      `    // …`,
      `  ]}`,
      `/>`,
    ].join("\n"),
};
