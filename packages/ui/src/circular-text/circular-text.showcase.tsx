"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { CircularText } from "./circular-text";

const DEMO_TEXT = "瑚琏 · HULIAN UI · 设计系统 · ";

export const circularTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "每字按等分角排到圆周，整体匀速自转；悬停默认加速。",
      code: `<CircularText
  text="瑚琏 · HULIAN UI · 设计系统 · "
  className="text-sm font-semibold tracking-widest text-primary"
/>`,
      render: () => (
        <div className="flex justify-center py-6">
          <CircularText
            text={DEMO_TEXT}
            className="text-sm font-semibold tracking-widest text-primary"
          />
        </div>
      ),
    },
    {
      title: "悬停暂停 · 慢速基底",
      description: "spinDuration 调慢转速，onHover=\"pause\" 悬停冻结旋转。",
      code: `<CircularText
  text="瑚琏 · HULIAN UI · 设计系统 · "
  spinDuration={36}
  onHover="pause"
  className="text-sm font-semibold tracking-widest text-foreground"
/>`,
      render: () => (
        <div className="flex justify-center py-6">
          <CircularText
            text={DEMO_TEXT}
            spinDuration={36}
            onHover="pause"
            className="text-sm font-semibold tracking-widest text-foreground"
          />
        </div>
      ),
    },
    {
      title: "深色徽章 · 抓狂模式",
      description: "radius 缩小做小徽章，onHover=\"goBonkers\" 悬停疯狂加速。",
      code: `<div className="flex items-center justify-center rounded-full bg-foreground p-2">
  <CircularText
    text="★ HULIAN ★ STUDIO ★ "
    spinDuration={14}
    onHover="goBonkers"
    radius={64}
    className="text-xs font-bold tracking-[0.2em] text-background"
  />
</div>`,
      render: () => (
        <div className="flex justify-center py-6">
          <div className="flex items-center justify-center rounded-full bg-foreground p-2">
            <CircularText
              text="★ HULIAN ★ STUDIO ★ "
              spinDuration={14}
              onHover="goBonkers"
              radius={64}
              className="text-xs font-bold tracking-[0.2em] text-background"
            />
          </div>
        </div>
      ),
    },
  ],
  controls: [
    { prop: "spinDuration", type: "number", defaultValue: 20, label: "转一圈秒数" },
    {
      prop: "onHover",
      type: "select",
      options: ["speedUp", "slow", "pause", "goBonkers"],
      defaultValue: "speedUp",
      label: "悬停行为",
    },
    { prop: "radius", type: "number", defaultValue: 80, label: "文字圆半径 px" },
  ],
  states: [
    {
      name: "default（悬停加速）",
      render: () => (
        <div className="flex justify-center py-6">
          <CircularText
            text={DEMO_TEXT}
            className="text-sm font-semibold tracking-widest text-primary"
          />
        </div>
      ),
    },
    {
      name: "悬停暂停 · 慢速基底",
      render: () => (
        <div className="flex justify-center py-6">
          <CircularText
            text={DEMO_TEXT}
            spinDuration={36}
            onHover="pause"
            className="text-sm font-semibold tracking-widest text-foreground"
          />
        </div>
      ),
    },
    {
      name: "深色徽章 · 抓狂模式",
      render: () => (
        <div className="flex justify-center py-6">
          <div className="flex items-center justify-center rounded-full bg-foreground p-2">
            <CircularText
              text="★ HULIAN ★ STUDIO ★ "
              spinDuration={14}
              onHover="goBonkers"
              radius={64}
              className="text-xs font-bold tracking-[0.2em] text-background"
            />
          </div>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="flex justify-center py-6">
      <CircularText
        text={DEMO_TEXT}
        spinDuration={p.spinDuration as number}
        onHover={p.onHover as "speedUp"}
        radius={p.radius as number}
        className="text-sm font-semibold tracking-widest text-primary"
      />
    </div>
  ),
  toCode: (p) =>
    `<CircularText text="瑚琏 · HULIAN UI · " spinDuration={${p.spinDuration}} onHover="${p.onHover}" radius={${p.radius}} />`,
};
