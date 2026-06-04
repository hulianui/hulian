"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { TypingDots } from "./typing-dots";

export const typingDotsShowcase: ShowcaseSpec = {
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
