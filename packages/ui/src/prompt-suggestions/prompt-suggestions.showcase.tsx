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
  controls: [],
  states: [
    { name: "建议 pill（点击回传）", render: () => <Demo /> },
  ],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<PromptSuggestions suggestions={["…", { label, value }]} onSelect={(v) => fill(v)} />`,
};
