"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { TrueFocus } from "./true-focus";

/** 居中展示容器，给逐词聚焦效果留出呼吸空间 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-40 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border bg-surface px-6">
      {children}
    </div>
  );
}

export const trueFocusShowcase: ShowcaseSpec = {
  controls: [
    { prop: "blurAmount", type: "number", defaultValue: 5, label: "失焦模糊 px" },
    { prop: "manualMode", type: "boolean", defaultValue: false, label: "手动悬停" },
    { prop: "animationDuration", type: "number", defaultValue: 1.2, label: "停留秒数" },
  ],

  states: [
    {
      name: "default（自动聚焦轮播）",
      render: () => (
        <Stage>
          <TrueFocus
            sentence="True Focus Effect"
            className="text-3xl font-bold text-foreground"
          />
        </Stage>
      ),
    },
    {
      name: "manualMode（悬停某词聚焦）",
      render: () => (
        <Stage>
          <TrueFocus
            sentence="Hover each word"
            manualMode
            className="text-3xl font-bold text-foreground"
          />
        </Stage>
      ),
    },
    {
      name: "自定义角框色（主色 token）",
      render: () => (
        <Stage>
          <TrueFocus
            sentence="瑚琏 真实 焦点"
            borderColor="var(--color-primary)"
            blurAmount={6}
            className="text-3xl font-bold text-foreground"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <TrueFocus
        sentence="瑚琏 真实 焦点 效果"
        blurAmount={p.blurAmount as number}
        manualMode={p.manualMode as boolean}
        animationDuration={p.animationDuration as number}
        className="text-3xl font-bold text-foreground"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<TrueFocus`,
      `  sentence="瑚琏 真实 焦点 效果"`,
      `  blurAmount={${p.blurAmount}}`,
      `  manualMode={${p.manualMode}}`,
      `  animationDuration={${p.animationDuration}}`,
      `/>`,
    ].join("\n"),
};
