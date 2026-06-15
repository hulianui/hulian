"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { RippleButton } from "./ripple-button";

export const rippleButtonShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "点击后从落点扩散一圈 Material 风水波纹，动画结束自动移除。",
      code: `<RippleButton>点我看波纹</RippleButton>`,
      render: () => <RippleButton>点我看波纹</RippleButton>,
    },
    {
      title: "波纹速度",
      description: "duration 控制单次波纹扩散的时长。",
      code: `<RippleButton duration="400ms">快</RippleButton>
<RippleButton duration="900ms">慢</RippleButton>`,
      render: () => (
        <>
          <RippleButton duration="400ms">快</RippleButton>
          <RippleButton duration="900ms">慢</RippleButton>
        </>
      ),
    },
    {
      title: "自定义波纹色",
      description: "rippleColor 指定波纹颜色，缺省取 primary-foreground。",
      code: `<RippleButton rippleColor="rgba(255,255,255,0.7)">高对比波纹</RippleButton>`,
      render: () => <RippleButton rippleColor="rgba(255,255,255,0.7)">高对比波纹</RippleButton>,
    },
  ],
  controls: [{ prop: "duration", type: "select", options: ["400ms", "600ms", "900ms"], defaultValue: "600ms" }],
  states: [{ name: "default（点击落点扩散波纹）", render: () => <RippleButton>点我看波纹</RippleButton> }],
  renderWithProps: (p) => <RippleButton duration={p.duration as string}>点我看波纹</RippleButton>,
  toCode: (p) => `<RippleButton duration="${p.duration}">点我看波纹</RippleButton>`,
};
