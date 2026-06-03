"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { RippleButton } from "./ripple-button";

export const rippleButtonShowcase: ShowcaseSpec = {
  controls: [{ prop: "duration", type: "select", options: ["400ms", "600ms", "900ms"], defaultValue: "600ms" }],
  states: [{ name: "default（点击落点扩散波纹）", render: () => <RippleButton>点我看波纹</RippleButton> }],
  renderWithProps: (p) => <RippleButton duration={p.duration as string}>点我看波纹</RippleButton>,
  toCode: (p) => `<RippleButton duration="${p.duration}">点我看波纹</RippleButton>`,
};
