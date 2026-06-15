import type { ShowcaseSpec } from "../showcase/types";
import { PulsatingButton } from "./pulsating-button";

export const pulsatingButtonShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "primary 底色外扩淡出的脉冲光环，适合引导用户注意的关键动作（订阅 / 报名）。",
      code: `<PulsatingButton>立即订阅</PulsatingButton>`,
      render: () => <PulsatingButton>立即订阅</PulsatingButton>,
    },
    {
      title: "脉冲速度",
      description: "duration 控制一轮脉冲的时长，越小脉冲越急促。",
      code: `<PulsatingButton duration="1s">急促</PulsatingButton>
<PulsatingButton duration="2.5s">平缓</PulsatingButton>`,
      render: () => (
        <>
          <PulsatingButton duration="1s">急促</PulsatingButton>
          <PulsatingButton duration="2.5s">平缓</PulsatingButton>
        </>
      ),
    },
    {
      title: "自定义光环色",
      description: "pulseColor 指定脉冲光环颜色，缺省取 primary 的 70%。",
      code: `<PulsatingButton pulseColor="var(--color-danger)">直播中</PulsatingButton>`,
      render: () => <PulsatingButton pulseColor="var(--color-danger)">直播中</PulsatingButton>,
    },
  ],
  controls: [{ prop: "duration", type: "select", options: ["1s", "1.5s", "2.5s"], defaultValue: "1.5s" }],
  states: [{ name: "default（primary 脉冲光环）", render: () => <PulsatingButton>立即订阅</PulsatingButton> }],
  renderWithProps: (p) => <PulsatingButton duration={p.duration as string}>立即订阅</PulsatingButton>,
  toCode: (p) => `<PulsatingButton duration="${p.duration}">立即订阅</PulsatingButton>`,
};
