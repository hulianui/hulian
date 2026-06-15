"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ChromaGrid } from "./chroma-grid";
import type { ChromaGridItem } from "./chroma-grid.types";

/** 展示用深色底容器，让灰度揭示效果对比清晰 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border p-2"
      style={{ background: "oklch(0.16 0.02 255)" }}
    >
      {children}
    </div>
  );
}

const TEAM: ChromaGridItem[] = [
  {
    title: "林屿",
    subtitle: "全栈工程师",
    handle: "@linyu",
    borderColor: "var(--color-chart-1)",
    gradient: "linear-gradient(145deg, var(--color-chart-1), transparent)",
  },
  {
    title: "陈墨",
    subtitle: "DevOps 工程师",
    handle: "@chenmo",
    borderColor: "var(--color-chart-2)",
    gradient: "linear-gradient(210deg, var(--color-chart-2), transparent)",
  },
  {
    title: "苏黎",
    subtitle: "UI/UX 设计师",
    handle: "@suli",
    borderColor: "var(--color-chart-3)",
    gradient: "linear-gradient(165deg, var(--color-chart-3), transparent)",
  },
  {
    title: "周野",
    subtitle: "数据科学家",
    handle: "@zhouye",
    borderColor: "var(--color-chart-4)",
    gradient: "linear-gradient(195deg, var(--color-chart-4), transparent)",
  },
];

export const chromaGridShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "不传 items 时回退内置占位卡墙；移入鼠标在光标周围揭示出全彩窗口。",
      code: `<ChromaGrid columns={3} />`,
      render: () => (
        <Stage>
          <ChromaGrid columns={3} />
        </Stage>
      ),
    },
    {
      title: "自定义团队卡",
      description: "传 items 数组，每项含标题/副标题/句柄与 chart token 描边渐变。",
      code: `const team = [
  {
    title: "林屿",
    subtitle: "全栈工程师",
    handle: "@linyu",
    borderColor: "var(--color-chart-1)",
    gradient: "linear-gradient(145deg, var(--color-chart-1), transparent)",
  },
  // …
];

<ChromaGrid items={team} columns={2} radius={260} />`,
      render: () => (
        <Stage>
          <ChromaGrid items={TEAM} columns={2} radius={260} />
        </Stage>
      ),
    },
    {
      title: "小半径聚焦",
      description: "调小 radius 收紧揭示窗口，聚光更集中。",
      code: `<ChromaGrid items={team} columns={2} radius={180} />`,
      render: () => (
        <Stage>
          <ChromaGrid items={TEAM} columns={2} radius={180} />
        </Stage>
      ),
    },
    {
      title: "高阻尼慢跟随",
      description: "调大 damping 让揭示窗更黏地跟随光标，fadeOut 控制移出后的淡出时长。",
      code: `<ChromaGrid items={team} columns={2} damping={0.8} fadeOut={1.2} />`,
      render: () => (
        <Stage>
          <ChromaGrid items={TEAM} columns={2} damping={0.8} fadeOut={1.2} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "radius", type: "number", defaultValue: 300, label: "揭示半径 px" },
    { prop: "columns", type: "number", defaultValue: 3, label: "列数" },
    { prop: "damping", type: "number", defaultValue: 0.45, label: "跟随阻尼 0~1" },
    { prop: "fadeOut", type: "number", defaultValue: 0.6, label: "淡出秒数" },
  ],

  states: [
    {
      name: "default（默认占位 · 移入鼠标揭示全彩）",
      render: () => (
        <Stage>
          <ChromaGrid columns={3} />
        </Stage>
      ),
    },
    {
      name: "自定义团队卡（chart token 描边）",
      render: () => (
        <Stage>
          <ChromaGrid items={TEAM} columns={2} radius={260} />
        </Stage>
      ),
    },
    {
      name: "小半径聚焦（radius=180）",
      render: () => (
        <Stage>
          <ChromaGrid items={TEAM} columns={2} radius={180} />
        </Stage>
      ),
    },
    {
      name: "高阻尼慢跟随（damping=0.8）",
      render: () => (
        <Stage>
          <ChromaGrid items={TEAM} columns={2} damping={0.8} fadeOut={1.2} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ChromaGrid
        items={TEAM}
        radius={p.radius as number}
        columns={p.columns as number}
        damping={p.damping as number}
        fadeOut={p.fadeOut as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<ChromaGrid`,
      `  items={team}`,
      `  radius={${p.radius}}`,
      `  columns={${p.columns}}`,
      `  damping={${p.damping}}`,
      `  fadeOut={${p.fadeOut}}`,
      `/>`,
    ].join("\n"),
};
