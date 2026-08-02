"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { MarkdownEditor } from "../../../../packages/ui/src/markdown-editor/markdown-editor";
import { Field } from "../../../../packages/ui/src/field";
const SAMPLE = "# Order remarks\n\nThis is a **key** explanation, including:\n\n- List item one\n- List item two\n\n> Quote block\n\n`Inline code`";
function ControlledDemo() {
    const [md, setMd] = useState("# Real-time echo\n\nThe current markdown is displayed below");
    return (<div className="w-[32rem] space-y-2">
      <MarkdownEditor value={md} onChange={setMd}/>
      <pre className="max-h-32 overflow-auto rounded bg-surface-hover p-2 text-xs text-muted">
        {md}
      </pre>
    </div>);
}
export const markdownEditorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Uncontrolled writing method, use defaultValue to fill in the initial markdown, with its own toolbar.",
            code: `<MarkdownEditor defaultValue="# Title\\n\\nText Paragraph" className="w-[32rem]" />`,
            render: () => <MarkdownEditor defaultValue={SAMPLE} className="w-[32rem]"/>,
        },
        {
            title: "Placeholder + line height",
            description: "placeholder prompts empty state, minRows controls the minimum height of the content area.",
            code: `<MarkdownEditor placeholder="Write something..." minRows={3} className="w-[32rem]" />`,
            render: () => (<MarkdownEditor placeholder="Write something..." minRows={3} className="w-[32rem]"/>),
        },
        {
            title: "In the form (Field)",
            description: "Works with Field, invalid triggers the danger shell, and name bridges the native form.",
            code: `<Field label="Order details (required)" error="Details cannot be empty" className="w-[32rem]">
  <MarkdownEditor name="detail" invalid placeholder="Required" />
</Field>`,
            render: () => (<Field label="Order details (required)" error="Details cannot be empty" className="w-[32rem]">
          <MarkdownEditor name="detail" invalid placeholder="Required"/>
        </Field>),
        },
        {
            title: "Disabled",
            description: "disabled Hide the toolbar and lock editing, and reduce the overall transparency.",
            code: `<MarkdownEditor disabled defaultValue="# Read-only content" className="w-[32rem]" />`,
            render: () => <MarkdownEditor disabled defaultValue={SAMPLE} className="w-[32rem]"/>,
        },
    ],
    controls: [
        { prop: "placeholder", type: "text", defaultValue: "Enter markdown...", label: "Placeholder" },
        { prop: "minRows", type: "number", defaultValue: 6, label: "Minimum number of lines" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
    ],
    states: [
        {
            name: "default",
            render: () => <MarkdownEditor defaultValue={SAMPLE} className="w-[32rem]"/>,
        },
        {
            name: "inField",
            render: () => (<Field label="Order details (required)" error="Details cannot be empty" className="w-[32rem]">
          <MarkdownEditor name="detail" invalid placeholder="Required"/>
        </Field>),
        },
        {
            name: "controlled",
            render: () => <ControlledDemo />,
        },
        {
            name: "disabled",
            render: () => <MarkdownEditor disabled defaultValue={SAMPLE} className="w-[32rem]"/>,
        },
    ],
    renderWithProps: (p) => (<MarkdownEditor placeholder={p.placeholder as string} minRows={p.minRows as number} invalid={p.invalid as boolean} disabled={p.disabled as boolean} defaultValue={SAMPLE} className="w-[32rem]"/>),
    toCode: (p) => `<MarkdownEditor${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""} placeholder="${p.placeholder}" minRows={${p.minRows}} />`,
};
