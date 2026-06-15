"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { PromptSuggestions } from "./prompt-suggestions";

function Demo() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="w-full max-w-lg space-y-3">
      <PromptSuggestions
        title="你可以试试"
        suggestions={["帮我重写首页文案", "解释这段代码", "总结要点", "翻译成英文"]}
        onSelect={setPicked}
      />
      {picked && <p className="text-xs text-muted">已选择：{picked}</p>}
    </div>
  );
}

export const promptSuggestionsShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "字符串数组即可，点击回传该文本（label 即 value）。",
      code: `<PromptSuggestions
  suggestions={["帮我重写首页文案", "解释这段代码", "总结要点", "翻译成英文"]}
  onSelect={(v) => fill(v)}
/>`,
      render: () => (
        <div className="w-full max-w-lg">
          <PromptSuggestions
            suggestions={["帮我重写首页文案", "解释这段代码", "总结要点", "翻译成英文"]}
          />
        </div>
      ),
    },
    {
      title: "带标题",
      description: "title 在 pill 列表上方加一行弱化标题。",
      code: `<PromptSuggestions
  title="你可以试试"
  suggestions={["帮我重写首页文案", "解释这段代码", "总结要点"]}
  onSelect={(v) => fill(v)}
/>`,
      render: () => (
        <div className="w-full max-w-lg">
          <PromptSuggestions
            title="你可以试试"
            suggestions={["帮我重写首页文案", "解释这段代码", "总结要点"]}
          />
        </div>
      ),
    },
    {
      title: "展示与回传分离",
      description: "用 {label, value} 让按钮文案与回传给模型的内容不同。",
      code: `<PromptSuggestions
  suggestions={[
    { label: "📝 重写文案", value: "请帮我重写这段首页文案，更简洁有力" },
    { label: "🌐 翻译成英文", value: "把以上内容翻译成地道的英文" },
  ]}
  onSelect={(v) => send(v)}
/>`,
      render: () => (
        <div className="w-full max-w-lg">
          <PromptSuggestions
            suggestions={[
              { label: "📝 重写文案", value: "请帮我重写这段首页文案，更简洁有力" },
              { label: "🌐 翻译成英文", value: "把以上内容翻译成地道的英文" },
            ]}
          />
        </div>
      ),
    },
  ],
  controls: [],
  states: [
    { name: "建议 pill（点击回传）", render: () => <Demo /> },
  ],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<PromptSuggestions suggestions={["…", { label, value }]} onSelect={(v) => fill(v)} />`,
};
