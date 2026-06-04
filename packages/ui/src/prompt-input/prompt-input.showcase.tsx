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
        <p className="text-xs text-muted">已发送 {log.length} 条：{log.join(" · ")}</p>
      )}
    </div>
  );
}

export const promptInputShowcase: ShowcaseSpec = {
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
