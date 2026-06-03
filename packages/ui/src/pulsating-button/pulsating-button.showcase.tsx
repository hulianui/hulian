import type { ShowcaseSpec } from "../showcase/types";
import { PulsatingButton } from "./pulsating-button";

export const pulsatingButtonShowcase: ShowcaseSpec = {
  controls: [{ prop: "duration", type: "select", options: ["1s", "1.5s", "2.5s"], defaultValue: "1.5s" }],
  states: [{ name: "default（primary 脉冲光环）", render: () => <PulsatingButton>立即订阅</PulsatingButton> }],
  renderWithProps: (p) => <PulsatingButton duration={p.duration as string}>立即订阅</PulsatingButton>,
  toCode: (p) => `<PulsatingButton duration="${p.duration}">立即订阅</PulsatingButton>`,
};
