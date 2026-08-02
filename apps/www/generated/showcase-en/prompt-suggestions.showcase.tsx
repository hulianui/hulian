"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PromptSuggestions } from "../../../../packages/ui/src/prompt-suggestions/prompt-suggestions";
function Demo() {
    const [picked, setPicked] = useState<string | null>(null);
    return (<div className="w-full max-w-lg space-y-3">
      <PromptSuggestions title="You can try" suggestions={["Help me rewrite the homepage copy", "Explain this code", "Summary of key points", "Translated into English"]} onSelect={setPicked}/>
      {picked && <p className="text-xs text-muted">Selected:{picked}</p>}
    </div>);
}
export const promptSuggestionsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "A string array is sufficient. Click to return the text (label or value).",
            code: `<PromptSuggestions
  suggestions={["Help me rewrite the homepage copy", "Explain this code", "Summary the main points", "Translate into English"]}
  onSelect={(v) => fill(v)}
/>`,
            render: () => (<div className="w-full max-w-lg">
          <PromptSuggestions suggestions={["Help me rewrite the homepage copy", "Explain this code", "Summary of key points", "Translated into English"]}/>
        </div>),
        },
        {
            title: "With title",
            description: "title Add a line of weakened title above the pill list.",
            code: `<PromptSuggestions
  title="You can try"
  suggestions={["Help me rewrite the homepage copy", "Explain this code", "Summary the key points"]}
  onSelect={(v) => fill(v)}
/>`,
            render: () => (<div className="w-full max-w-lg">
          <PromptSuggestions title="You can try" suggestions={["Help me rewrite the homepage copy", "Explain this code", "Summary of key points"]}/>
        </div>),
        },
        {
            title: "Separation of display and postback",
            description: "Use {label, value} to make the button text different from the content returned to the model.",
            code: `<PromptSuggestions
  suggestions={[
    { label: "\uD83D\uDCDD Rewrite the copy", value: "Please help me rewrite this homepage copy to make it more concise and powerful" },
    { label: "\uD83C\uDF10 Translate into English", value: "Translate the above content into authentic English" },
  ]}
  onSelect={(v) => send(v)}
/>`,
            render: () => (<div className="w-full max-w-lg">
          <PromptSuggestions suggestions={[
                    { label: "\uD83D\uDCDD Rewrite the copy", value: "Please help me rewrite this home page copy to be more concise and powerful" },
                    { label: "\uD83C\uDF10 Translate into English", value: "Translate the above content into authentic English" },
                ]}/>
        </div>),
        },
    ],
    controls: [],
    states: [
        { name: "Suggestion pill (click to post)", render: () => <Demo /> },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `<PromptSuggestions suggestions={["\u2026", { label, value }]} onSelect={(v) => fill(v)} />`,
};
