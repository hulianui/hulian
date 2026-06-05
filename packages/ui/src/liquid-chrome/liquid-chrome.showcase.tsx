import type { ShowcaseSpec } from "../showcase/types";
import { LiquidChrome } from "./liquid-chrome";

// 背景层需放在 relative 定位容器内，LiquidChrome 自身 absolute inset-0 铺满。
function Frame({
  height = "h-48",
  children,
}: {
  height?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-border bg-surface ${height}`}
    >
      {children}
    </div>
  );
}

export const liquidChromeShowcase: ShowcaseSpec = {
  controls: [
    { prop: "speed", type: "number", defaultValue: 0.2 },
    { prop: "amplitude", type: "number", defaultValue: 0.6 },
    { prop: "frequencyX", type: "number", defaultValue: 2.5 },
    { prop: "frequencyY", type: "number", defaultValue: 1.5 },
    { prop: "interactive", type: "boolean", defaultValue: true },
  ],
  states: [
    {
      name: "default（chart-2 token · 鼠标互动）",
      render: () => (
        <Frame>
          <LiquidChrome />
        </Frame>
      ),
    },
    {
      name: "baseColor 数组 · 深蓝金属",
      render: () => (
        <Frame>
          <LiquidChrome baseColor={[0.03, 0.08, 0.22]} speed={0.15} amplitude={0.5} />
        </Frame>
      ),
    },
    {
      name: "baseColor 数组 · 暗铜金",
      render: () => (
        <Frame>
          <LiquidChrome
            baseColor={[0.18, 0.1, 0.03]}
            speed={0.25}
            amplitude={0.7}
            frequencyX={3.0}
            frequencyY={2.0}
          />
        </Frame>
      ),
    },
    {
      name: "高振幅 · 快速（amplitude=0.9, speed=0.45）",
      render: () => (
        <Frame>
          <LiquidChrome amplitude={0.9} speed={0.45} frequencyX={3.5} frequencyY={2.5} />
        </Frame>
      ),
    },
    {
      name: "非交互（interactive=false）",
      render: () => (
        <Frame>
          <LiquidChrome interactive={false} amplitude={0.5} speed={0.2} />
        </Frame>
      ),
    },
    {
      name: "tall hero（做 demo 背景层）",
      render: () => (
        <Frame height="h-72">
          <LiquidChrome speed={0.18} amplitude={0.55} />
          {/* 演示内容叠加层 */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-2xl font-bold text-white drop-shadow-md">Liquid Chrome</p>
            <p className="text-sm text-white/70 drop-shadow">
              WebGL 液态铬金属流动背景
            </p>
          </div>
        </Frame>
      ),
    },
    {
      name: "reduced-motion fallback（静态渐变）",
      render: () => (
        // 直接渲染 fallback 分支（reduced=true 时的降级 UI）
        <Frame>
          <div
            className="absolute inset-0 z-0 bg-[linear-gradient(135deg,var(--color-chart-1)_0%,var(--color-chart-2)_30%,var(--color-chart-3)_60%,var(--color-chart-4)_100%)]"
            aria-hidden
          />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-sm text-white/80">静态金属渐变 fallback</p>
          </div>
        </Frame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Frame>
      <LiquidChrome
        speed={p.speed as number}
        amplitude={p.amplitude as number}
        frequencyX={p.frequencyX as number}
        frequencyY={p.frequencyY as number}
        interactive={p.interactive as boolean}
      />
    </Frame>
  ),
  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl">`,
      `  <LiquidChrome`,
      `    speed={${p.speed}}`,
      `    amplitude={${p.amplitude}}`,
      `    frequencyX={${p.frequencyX}}`,
      `    frequencyY={${p.frequencyY}}`,
      `    interactive={${p.interactive}}`,
      `  />`,
      `  {/* 内容层（z-10 叠加在背景上）*/}`,
      `  <div className="relative z-10 flex h-full items-center justify-center">`,
      `    <p className="text-white text-xl font-bold">Your Content</p>`,
      `  </div>`,
      `</div>`,
    ].join("\n"),
};
