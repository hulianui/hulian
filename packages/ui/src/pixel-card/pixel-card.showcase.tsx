"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { PixelCard } from "./pixel-card";

/** 卡片内容：标题 + 副标题，居中。 */
function CardBody({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted">{subtitle}</p>
    </div>
  );
}

const variantOptions = ["default", "blue", "pink", "amber"] as const;

export const pixelCardShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "variant",
      type: "select",
      options: [...variantOptions],
      defaultValue: "blue",
      label: "变体",
    },
    { prop: "gap", type: "number", defaultValue: 6, label: "像素间距 px" },
    { prop: "speed", type: "number", defaultValue: 35, label: "速度 0–100" },
    { prop: "noFocus", type: "boolean", defaultValue: false, label: "禁用焦点触发" },
  ],

  states: [
    {
      name: "default（悬停看像素生长）",
      render: () => (
        <PixelCard variant="default" className="h-48 w-64">
          <CardBody title="瑚琏组件库" subtitle="悬停 / 聚焦触发像素动画" />
        </PixelCard>
      ),
    },
    {
      name: "blue（chart-2 蓝调）",
      render: () => (
        <PixelCard variant="blue" className="h-48 w-64">
          <CardBody title="Pixel Card" subtitle="蓝调像素波纹" />
        </PixelCard>
      ),
    },
    {
      name: "amber（密集暖橙）",
      render: () => (
        <PixelCard variant="amber" className="h-48 w-64">
          <CardBody title="Amber" subtitle="gap=3 更密更细腻" />
        </PixelCard>
      ),
    },
    {
      name: "自定义配色 + 慢速",
      render: () => (
        <PixelCard
          colors={[
            "var(--color-chart-5)",
            "var(--color-chart-4)",
            "var(--color-chart-1)",
          ]}
          gap={5}
          speed={18}
          className="h-48 w-64"
        >
          <CardBody title="自定义" subtitle="colors / gap / speed 可覆盖" />
        </PixelCard>
      ),
    },
  ],

  renderWithProps: (p) => (
    <PixelCard
      variant={p.variant as "default" | "blue" | "pink" | "amber"}
      gap={p.gap as number}
      speed={p.speed as number}
      noFocus={p.noFocus as boolean}
      className="h-48 w-64"
    >
      <CardBody title="Pixel Card" subtitle="悬停查看效果" />
    </PixelCard>
  ),

  toCode: (p) =>
    [
      `<PixelCard`,
      `  variant="${p.variant}"`,
      `  gap={${p.gap}}`,
      `  speed={${p.speed}}`,
      `  noFocus={${p.noFocus}}`,
      `  className="h-48 w-64"`,
      `>`,
      `  <div className="text-center">…</div>`,
      `</PixelCard>`,
    ].join("\n"),
};
