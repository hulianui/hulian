"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { TypingDots } from "./typing-dots";

export const typingDotsShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "三点交错弹跳的「正在输入」指示（纯 CSS·reduced-motion 自动停跳，role=status 读屏播报）。",
      code: `<TypingDots />`,
      render: () => <TypingDots />,
    },
    {
      title: "气泡内",
      description: "放进 surface 气泡里，等价 ChatMessage loading 态的生成中占位。",
      code: `<span className="inline-flex rounded-[var(--radius)] bg-surface px-3.5 py-2.5">
  <TypingDots />
</span>`,
      render: () => (
        <span className="inline-flex rounded-[var(--radius)] bg-surface px-3.5 py-2.5">
          <TypingDots />
        </span>
      ),
    },
    {
      title: "无障碍标签",
      description: "label 覆盖读屏播报文案（默认「正在输入」）。",
      code: `<TypingDots label="瑚琏 AI 正在思考" />`,
      render: () => <TypingDots label="瑚琏 AI 正在思考" />,
    },
  ],
  controls: [{ prop: "label", type: "text", defaultValue: "正在输入", label: "无障碍标签" }],
  states: [
    { name: "default", render: () => <TypingDots /> },
    {
      name: "气泡内",
      render: () => (
        <span className="inline-flex rounded-[var(--radius)] bg-surface px-3.5 py-2.5">
          <TypingDots />
        </span>
      ),
    },
  ],
  renderWithProps: (p) => <TypingDots label={p.label as string} />,
  toCode: () => `<TypingDots />`,
};
