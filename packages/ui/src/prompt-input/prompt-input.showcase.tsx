"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { PromptInput } from "./prompt-input";

function Demo() {
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="w-full max-w-lg space-y-2">
      <PromptInput onSubmit={(v) => setLog((l) => [...l, v])} />
      {log.length > 0 && (
        <p className="text-xs text-muted-foreground">已发送 {log.length} 条：{log.join(" · ")}</p>
      )}
    </div>
  );
}

export const promptInputShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "Enter 提交 / Shift+Enter 换行 / IME 合成中不误触；onSubmit 收到 trim 后的文本，非受控时内部自动清空。",
      code: `<PromptInput onSubmit={(v) => send(v)} />`,
      render: () => <Demo />,
    },
    {
      title: "生成中（停止键）",
      description: "loading 时发送键变为停止键并屏蔽提交，点击触发 onStop。",
      code: `<PromptInput loading onStop={() => stop()} defaultValue="正在生成回答…" />`,
      render: () => (
        <div className="w-full max-w-lg">
          <PromptInput loading defaultValue="正在生成回答…" />
        </div>
      ),
    },
    {
      title: "禁用态",
      description: "disabled 整体弱化并阻断输入与提交。",
      code: `<PromptInput disabled placeholder="登录后即可发送…" />`,
      render: () => (
        <div className="w-full max-w-lg">
          <PromptInput disabled placeholder="登录后即可发送…" />
        </div>
      ),
    },
    {
      title: "自定义占位",
      description: "placeholder 覆盖默认提示文案。",
      code: `<PromptInput placeholder="问我任何关于瑚琏的问题…" />`,
      render: () => (
        <div className="w-full max-w-lg">
          <PromptInput placeholder="问我任何关于瑚琏的问题…" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "发消息…" },
    { prop: "loading", type: "boolean", defaultValue: false },
    { prop: "disabled", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "默认（Enter 发送 / Shift+Enter 换行）", render: () => <Demo /> },
    {
      name: "生成中（停止键）",
      render: () => (
        <div className="w-full max-w-lg">
          <PromptInput loading defaultValue="正在生成回答…" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-full max-w-lg">
      <PromptInput
        placeholder={p.placeholder as string}
        loading={p.loading as boolean}
        disabled={p.disabled as boolean}
      />
    </div>
  ),
  toCode: (p) =>
    `<PromptInput onSubmit={(v) => send(v)}${p.loading ? " loading onStop={stop}" : ""} />`,
};
