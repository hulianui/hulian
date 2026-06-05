"use client";
import { Heart, Star, Bell, Settings, Cloud, Zap } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { GlassIcons } from "./glass-icons";

/** 深色底容器，让玻璃发光效果清晰可见（hover/focus 任一图标看 3D 抬升 + 标签滑出） */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-64 w-full max-w-xl items-center justify-center overflow-visible rounded-xl border border-border p-10"
      style={{ background: "oklch(0.16 0.02 255)" }}
    >
      {children}
    </div>
  );
}

const demoItems = [
  { icon: <Heart />, label: "收藏", color: "red" },
  { icon: <Star />, label: "星标", color: "orange" },
  { icon: <Bell />, label: "通知", color: "blue" },
  { icon: <Cloud />, label: "云端", color: "indigo" },
  { icon: <Zap />, label: "闪电", color: "purple" },
  { icon: <Settings />, label: "设置", color: "green" },
];

export const glassIconsShowcase: ShowcaseSpec = {
  controls: [{ prop: "columns", type: "number", defaultValue: 3, label: "网格列数" }],

  states: [
    {
      name: "default（六色玻璃图标·hover 看效果）",
      render: () => (
        <Stage>
          <GlassIcons items={demoItems} columns={3} />
        </Stage>
      ),
    },
    {
      name: "单色 primary（吃主题色）",
      render: () => (
        <Stage>
          <GlassIcons
            columns={2}
            items={[
              { icon: <Heart />, label: "喜欢", color: "primary" },
              { icon: <Star />, label: "收藏", color: "primary" },
            ]}
          />
        </Stage>
      ),
    },
    {
      name: "自定义渐变色",
      render: () => (
        <Stage>
          <GlassIcons
            columns={2}
            items={[
              {
                icon: <Cloud />,
                label: "极光",
                color: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-4))",
              },
              {
                icon: <Zap />,
                label: "暖橙",
                color: "linear-gradient(135deg, var(--color-chart-3), oklch(0.72 0.2 30))",
              },
            ]}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <GlassIcons items={demoItems} columns={p.columns as number} />
    </Stage>
  ),

  toCode: (p) =>
    [
      `import { Heart, Star, Bell } from "lucide-react";`,
      ``,
      `<GlassIcons`,
      `  columns={${p.columns}}`,
      `  items={[`,
      `    { icon: <Heart />, label: "收藏", color: "red" },`,
      `    { icon: <Star />, label: "星标", color: "orange" },`,
      `    { icon: <Bell />, label: "通知", color: "blue" },`,
      `  ]}`,
      `/>`,
    ].join("\n"),
};
