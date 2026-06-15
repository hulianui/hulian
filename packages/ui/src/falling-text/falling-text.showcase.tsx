"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { FallingText } from "./falling-text";

/** 深色底舞台，给散落文字足够对比与下落空间 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const fallingTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "挂载即自动掉落（trigger=\"auto\"），highlightWords 前缀匹配的词走高亮样式。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <FallingText
    text="瑚琏 组件库 企业级 高质量 原生适配 token 主题"
    highlightWords={["瑚琏", "token"]}
    fontSize="1.5rem"
  />
</div>`,
      render: () => (
        <Stage>
          <FallingText
            text="瑚琏 组件库 企业级 高质量 原生适配 token 主题"
            highlightWords={["瑚琏", "token"]}
            className="text-white/90"
            fontSize="1.5rem"
          />
        </Stage>
      ),
    },
    {
      title: "点击触发",
      description: "trigger=\"click\" 时点击容器才开始掉落（另有 scroll / hover）。",
      code: `<FallingText text="点我 让 文字 散落 下来" trigger="click" highlightWords={["点我"]} />`,
      render: () => (
        <Stage>
          <FallingText
            text="点我 让 文字 散落 下来"
            trigger="click"
            highlightWords={["点我"]}
            className="text-white/90"
            fontSize="1.4rem"
          />
        </Stage>
      ),
    },
    {
      title: "高重力低反弹",
      description: "gravity 大、bounce 小，词块迅速落地堆叠不弹跳。",
      code: `<FallingText text="重力 强劲 快速 落地 堆叠" gravity={2.4} bounce={0.2} />`,
      render: () => (
        <Stage>
          <FallingText
            text="gravity 2.4 重力 强劲 快速 落地 堆叠"
            gravity={2.4}
            bounce={0.2}
            className="text-white/90"
            fontSize="1.3rem"
          />
        </Stage>
      ),
    },
    {
      title: "弹性十足",
      description: "bounce 接近 1，词块落地后反复弹跳。",
      code: `<FallingText text="弹 跳 弹 跳" gravity={0.8} bounce={0.9} />`,
      render: () => (
        <Stage>
          <FallingText
            text="bouncy 弹 跳 弹 跳 弹 跳"
            gravity={0.8}
            bounce={0.9}
            highlightWords={["bouncy"]}
            className="text-white/90"
            fontSize="1.5rem"
          />
        </Stage>
      ),
    },
  ],
  controls: [
    { prop: "text", type: "text", defaultValue: "瑚琏 组件库 企业级 高质量 原生适配", label: "文本" },
    { prop: "gravity", type: "number", defaultValue: 1, label: "重力" },
    { prop: "bounce", type: "number", defaultValue: 0.6, label: "反弹系数" },
    {
      prop: "trigger",
      type: "select",
      options: ["auto", "scroll", "click", "hover"],
      defaultValue: "auto",
      label: "触发时机",
    },
  ],

  states: [
    {
      name: "default（自动掉落·高亮词）",
      render: () => (
        <Stage>
          <FallingText
            text="瑚琏 组件库 企业级 高质量 原生适配 token 主题"
            highlightWords={["瑚琏", "token"]}
            className="text-white/90"
            fontSize="1.5rem"
          />
        </Stage>
      ),
    },
    {
      name: "点击触发",
      render: () => (
        <Stage>
          <FallingText
            text="点我 让 文字 散落 下来"
            trigger="click"
            highlightWords={["点我"]}
            className="text-white/90"
            fontSize="1.4rem"
          />
        </Stage>
      ),
    },
    {
      name: "高重力·低反弹（迅速堆叠）",
      render: () => (
        <Stage>
          <FallingText
            text="gravity 2.4 重力 强劲 快速 落地 堆叠"
            gravity={2.4}
            bounce={0.2}
            className="text-white/90"
            fontSize="1.3rem"
          />
        </Stage>
      ),
    },
    {
      name: "弹性十足（高反弹）",
      render: () => (
        <Stage>
          <FallingText
            text="bouncy 弹 跳 弹 跳 弹 跳"
            gravity={0.8}
            bounce={0.9}
            highlightWords={["bouncy"]}
            className="text-white/90"
            fontSize="1.5rem"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <FallingText
        text={p.text as string}
        gravity={p.gravity as number}
        bounce={p.bounce as number}
        trigger={p.trigger as "auto" | "scroll" | "click" | "hover"}
        highlightWords={["瑚琏", "token"]}
        className="text-white/90"
        fontSize="1.5rem"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <FallingText`,
      `    text="${p.text}"`,
      `    gravity={${p.gravity}}`,
      `    bounce={${p.bounce}}`,
      `    trigger="${p.trigger}"`,
      `    highlightWords={["瑚琏", "token"]}`,
      `    className="text-white/90"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
