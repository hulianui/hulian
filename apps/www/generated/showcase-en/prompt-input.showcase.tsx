"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PromptInput } from "../../../../packages/ui/src/prompt-input/prompt-input";
function Demo() {
    const [log, setLog] = useState<string[]>([]);
    return (<div className="w-full max-w-lg space-y-2">
      <PromptInput onSubmit={(v) => setLog((l) => [...l, v])}/>
      {log.length > 0 && (<p className="text-xs text-muted-foreground">Sent {log.length} Articles:{log.join(" \u00B7 ")}</p>)}
    </div>);
}
export const promptInputShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Enter Submit / Shift+Enter Line break / IME No accidental touch during synthesis; onSubmit The text after receiving trim will be automatically cleared internally when it is not controlled.",
            code: `<PromptInput onSubmit={(v) => send(v)} />`,
            render: () => <Demo />,
        },
        {
            title: "Generating (stop key)",
            description: "When loading is entered, the send key changes to the stop key and submission is blocked. Click to trigger onStop.",
            code: `<PromptInput loading onStop={() => stop()} defaultValue="Generating answer..." />`,
            render: () => (<div className="w-full max-w-lg">
          <PromptInput loading defaultValue="Generating answer..."/>
        </div>),
        },
        {
            title: "Disabled",
            description: "disabled overall weakens and blocks input and submission.",
            code: `<PromptInput disabled placeholder="Log in to send..." />`,
            render: () => (<div className="w-full max-w-lg">
          <PromptInput disabled placeholder="Log in to send..."/>
        </div>),
        },
        {
            title: "Custom placeholder",
            description: "placeholder overrides the default prompt text.",
            code: `<PromptInput placeholder="Ask me any questions about Hulian..." />`,
            render: () => (<div className="w-full max-w-lg">
          <PromptInput placeholder="Ask me any questions about Hulian..."/>
        </div>),
        },
    ],
    controls: [
        { prop: "placeholder", type: "text", defaultValue: "Send a message..." },
        { prop: "loading", type: "boolean", defaultValue: false },
        { prop: "disabled", type: "boolean", defaultValue: false },
    ],
    states: [
        { name: "Default (Enter sends / Shift+Enter newline)", render: () => <Demo /> },
        {
            name: "Generating (stop key)",
            render: () => (<div className="w-full max-w-lg">
          <PromptInput loading defaultValue="Generating answer..."/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-full max-w-lg">
      <PromptInput placeholder={p.placeholder as string} loading={p.loading as boolean} disabled={p.disabled as boolean}/>
    </div>),
    toCode: (p) => `<PromptInput onSubmit={(v) => send(v)}${p.loading ? " loading onStop={stop}" : ""} />`,
};
