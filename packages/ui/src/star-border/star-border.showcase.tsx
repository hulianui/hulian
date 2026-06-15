import type { ShowcaseSpec } from "../showcase/types";
import { StarBorder } from "./star-border";

/** 深色底容器，让流星光带更醒目 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-40 w-full max-w-xl items-center justify-center rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const starBorderShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认渲染为按钮，上下两道流星光带沿描边来回扫过；光带色吃 primary token。",
      code: `<StarBorder>立即开始</StarBorder>`,
      render: () => (
        <Stage>
          <StarBorder>立即开始</StarBorder>
        </Stage>
      ),
    },
    {
      title: "自定义颜色",
      description: "color 喂进 radial-gradient，可传任意 CSS 颜色或 token。",
      code: `<StarBorder color="var(--color-chart-3)">限时活动</StarBorder>`,
      render: () => (
        <Stage>
          <StarBorder color="var(--color-chart-3)">限时活动</StarBorder>
        </Stage>
      ),
    },
    {
      title: "速度与厚度",
      description: "speed 越小越活跃；thickness 撑开上下内边距决定描边粗细。",
      code: `<StarBorder speed={3} thickness={2}>
  高活跃
</StarBorder>`,
      render: () => (
        <Stage>
          <StarBorder speed={3} thickness={2}>
            高活跃
          </StarBorder>
        </Stage>
      ),
    },
    {
      title: "多态渲染（as）",
      description: 'as="a" 渲染为链接，DOM 属性透传到该元素。',
      code: `<StarBorder as="a" href="/docs" color="var(--color-chart-2)">
  查看文档 →
</StarBorder>`,
      render: () => (
        <Stage>
          <StarBorder as="a" color="var(--color-chart-2)" className="cursor-pointer">
            查看文档 →
          </StarBorder>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "color", type: "text", defaultValue: "var(--color-primary)", label: "光带颜色" },
    { prop: "speed", type: "number", defaultValue: 6, label: "扫过秒数" },
    { prop: "thickness", type: "number", defaultValue: 1, label: "描边厚度 px" },
  ],

  states: [
    {
      name: "default（主色光带·按钮）",
      render: () => (
        <Stage>
          <StarBorder>立即开始</StarBorder>
        </Stage>
      ),
    },
    {
      name: "自定义色（暖橙）",
      render: () => (
        <Stage>
          <StarBorder color="var(--color-chart-3)">限时活动</StarBorder>
        </Stage>
      ),
    },
    {
      name: "快速 + 加粗描边",
      render: () => (
        <Stage>
          <StarBorder speed={3} thickness={2}>
            高活跃
          </StarBorder>
        </Stage>
      ),
    },
    {
      name: "多态：链接（as=a）",
      render: () => (
        <Stage>
          <StarBorder as="a" color="var(--color-chart-2)" className="cursor-pointer">
            查看文档 →
          </StarBorder>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <StarBorder
        color={p.color as string}
        speed={p.speed as number}
        thickness={p.thickness as number}
      >
        立即开始
      </StarBorder>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<StarBorder`,
      `  color="${p.color}"`,
      `  speed={${p.speed}}`,
      `  thickness={${p.thickness}}`,
      `>`,
      `  立即开始`,
      `</StarBorder>`,
    ].join("\n"),
};
