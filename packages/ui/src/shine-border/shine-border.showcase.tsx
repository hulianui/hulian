import type { ShowcaseSpec } from "../showcase/types";
import { ShineBorder } from "./shine-border";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-40 w-72 overflow-hidden rounded-xl bg-surface">
      {children}
    </div>
  );
}

export const shineBorderShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "ShineBorder 是 absolute inset-0 流光边框层，放进 relative + rounded 容器内即得整条边框的流动微光。默认 chart 三色渐变。",
      code: `<div className="relative h-40 w-72 overflow-hidden rounded-xl bg-surface">
  <div className="grid h-full place-items-center text-sm text-muted">Shine Border</div>
  <ShineBorder />
</div>`,
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Shine Border</div>
          <ShineBorder />
        </Card>
      ),
    },
    {
      title: "单色 · 粗边",
      description: "shineColor 传单个 CSS 颜色/token 即单色流光；borderWidth 调边框粗细。",
      code: `<ShineBorder borderWidth={2} shineColor="var(--color-primary)" />`,
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Single</div>
          <ShineBorder borderWidth={2} shineColor="var(--color-primary)" />
        </Card>
      ),
    },
    {
      title: "多色 · 调速",
      description: "shineColor 传颜色数组组成多段渐变；duration 控制流光一轮的秒数（越大越慢）。",
      code: `<ShineBorder
  shineColor={["var(--color-chart-2)", "var(--color-chart-4)", "var(--color-chart-1)"]}
  duration={8}
/>`,
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Multi · Fast</div>
          <ShineBorder
            shineColor={[
              "var(--color-chart-2)",
              "var(--color-chart-4)",
              "var(--color-chart-1)",
            ]}
            duration={8}
          />
        </Card>
      ),
    },
  ],
  controls: [
    { prop: "borderWidth", type: "number", defaultValue: 1 },
    { prop: "duration", type: "number", defaultValue: 14 },
  ],
  states: [
    {
      name: "default（chart 流光边）",
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Shine Border</div>
          <ShineBorder />
        </Card>
      ),
    },
    {
      name: "粗边 · primary 单色",
      render: () => (
        <Card>
          <div className="grid h-full place-items-center text-sm text-muted">Single</div>
          <ShineBorder borderWidth={2} shineColor="var(--color-primary)" />
        </Card>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Card>
      <div className="grid h-full place-items-center text-sm text-muted">Shine Border</div>
      <ShineBorder borderWidth={p.borderWidth as number} duration={p.duration as number} />
    </Card>
  ),
  toCode: (p) =>
    `<div className="relative">\n  ...content\n  <ShineBorder borderWidth={${p.borderWidth}} duration={${p.duration}} />\n</div>`,
};
