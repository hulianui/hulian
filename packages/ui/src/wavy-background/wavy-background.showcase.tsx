"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { WavyBackground } from "./wavy-background";

/** 标准展示容器（与其他 decoration 类 showcase 保持一致） */
function WavyWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const wavyBackgroundShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "WavyBackground 自带 canvas 背景 + 居中内容层，children 直接放标题即可；默认吃 chart token。",
      code: `<WavyBackground containerClassName="h-64 w-full">
  <span className="text-sm font-medium text-foreground">WavyBackground</span>
</WavyBackground>`,
      render: () => (
        <WavyWrap>
          <WavyBackground containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">WavyBackground</span>
          </WavyBackground>
        </WavyWrap>
      ),
    },
    {
      title: "动画速度",
      description: 'speed="slow" 让波浪更缓更松弛，"fast" 更活跃。',
      code: `<WavyBackground speed="slow" containerClassName="h-64 w-full">
  <span className="text-sm font-medium text-foreground">slow</span>
</WavyBackground>`,
      render: () => (
        <WavyWrap>
          <WavyBackground speed="slow" containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">slow</span>
          </WavyBackground>
        </WavyWrap>
      ),
    },
    {
      title: "模糊强度",
      description: "blur 控制波带柔和度，blur=0 时边缘锐利、波带轮廓清晰。",
      code: `<WavyBackground blur={0} containerClassName="h-64 w-full">
  <span className="text-sm font-medium text-foreground">blur=0</span>
</WavyBackground>`,
      render: () => (
        <WavyWrap>
          <WavyBackground blur={0} containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">blur=0</span>
          </WavyBackground>
        </WavyWrap>
      ),
    },
    {
      title: "自定义颜色",
      description: "colors 传一组色值（推荐 5 条）定制品牌波浪带。",
      code: `<WavyBackground
  colors={["#a855f7", "#6366f1", "#c084fc", "#818cf8", "#a855f7"]}
  blur={8}
  containerClassName="h-64 w-full"
>
  <span className="text-sm font-medium text-white">custom</span>
</WavyBackground>`,
      render: () => (
        <WavyWrap>
          <WavyBackground
            colors={["#a855f7", "#6366f1", "#c084fc", "#818cf8", "#a855f7"]}
            blur={8}
            containerClassName="h-full w-full"
          >
            <span className="text-sm font-medium text-white">custom</span>
          </WavyBackground>
        </WavyWrap>
      ),
    },
  ],
  controls: [
    {
      prop: "speed",
      type: "select",
      options: ["slow", "fast"],
      defaultValue: "fast",
    },
    { prop: "blur", type: "number", defaultValue: 10 },
    { prop: "waveWidth", type: "number", defaultValue: 50 },
    { prop: "waveOpacity", type: "number", defaultValue: 0.5 },
  ],
  states: [
    {
      name: "default（fast + chart token）",
      render: () => (
        <WavyWrap>
          <WavyBackground containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">WavyBackground</span>
          </WavyBackground>
        </WavyWrap>
      ),
    },
    {
      name: "slow speed",
      render: () => (
        <WavyWrap>
          <WavyBackground speed="slow" containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">slow</span>
          </WavyBackground>
        </WavyWrap>
      ),
    },
    {
      name: "no blur",
      render: () => (
        <WavyWrap>
          <WavyBackground blur={0} containerClassName="h-full w-full">
            <span className="text-sm font-medium text-foreground">blur=0</span>
          </WavyBackground>
        </WavyWrap>
      ),
    },
    {
      name: "custom colors（品牌紫 + 品牌蓝）",
      render: () => (
        <WavyWrap>
          <WavyBackground
            colors={["#a855f7", "#6366f1", "#c084fc", "#818cf8", "#a855f7"]}
            blur={8}
            containerClassName="h-full w-full"
          >
            <span className="text-sm font-medium text-white">custom</span>
          </WavyBackground>
        </WavyWrap>
      ),
    },
    {
      name: "without children",
      render: () => (
        <WavyWrap>
          <WavyBackground containerClassName="h-full w-full" />
        </WavyWrap>
      ),
    },
  ],
  renderWithProps: (p) => (
    <WavyWrap>
      <WavyBackground
        speed={p.speed as "slow" | "fast"}
        blur={p.blur as number}
        waveWidth={p.waveWidth as number}
        waveOpacity={p.waveOpacity as number}
        containerClassName="h-full w-full"
      >
        <span className="text-sm font-medium text-foreground">WavyBackground</span>
      </WavyBackground>
    </WavyWrap>
  ),
  toCode: (p) =>
    `<WavyBackground
  speed="${p.speed}"
  blur={${p.blur}}
  waveWidth={${p.waveWidth}}
  waveOpacity={${p.waveOpacity}}
  containerClassName="h-64 w-full"
>
  <h2 className="text-2xl font-bold">Hello, Waves</h2>
</WavyBackground>`,
};
