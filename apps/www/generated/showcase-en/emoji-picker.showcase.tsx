"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { EmojiPicker } from "../../../../packages/ui/src/emoji-picker/emoji-picker";
function WithOutput() {
    const [text, setText] = useState("Add emoticons here \uD83D\uDC49 ");
    return (<div className="flex flex-col gap-3">
      <div className="min-h-10 w-72 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-lg">
        {text}
      </div>
      <EmojiPicker onSelect={(e) => setText((t) => t + e)}/>
    </div>);
}
export const emojiPickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Category tab + keyword search, onSelect gets the selected emoji character.",
            code: `<EmojiPicker onSelect={(e) => insert(e)} />`,
            render: () => <EmojiPicker onSelect={() => { }}/>,
        },
        {
            title: "Preset Recently Used + Hide Search",
            description: "Controlled transmission recent pins common emoticons; searchable=false removes the search box.",
            code: `<EmojiPicker
  searchable={false}
  recent={["\uD83D\uDD25", "\uD83D\uDCAF", "\uD83D\uDC4D", "\uD83C\uDF89", "\u2764\uFE0F"]}
  onSelect={(e) => insert(e)}
/>`,
            render: () => (<EmojiPicker searchable={false} recent={["\uD83D\uDD25", "\uD83D\uDCAF", "\uD83D\uDC4D", "\uD83C\uDF89", "\u2764\uFE0F"]} onSelect={() => { }}/>),
        },
        {
            title: "More compact (6 columns)",
            description: "columns adjusts the number of each line, and className narrows the overall width.",
            code: `<EmojiPicker columns={6} className="w-60" onSelect={(e) => insert(e)} />`,
            render: () => <EmojiPicker columns={6} className="w-60" onSelect={() => { }}/>,
        },
    ],
    controls: [
        { prop: "columns", type: "number", defaultValue: 8 },
        { prop: "searchable", type: "boolean", defaultValue: true },
    ],
    states: [
        { name: "Default", render: () => <EmojiPicker onSelect={() => { }}/> },
        { name: "Append to input", render: () => <WithOutput /> },
        {
            name: "Preset Recently Used + Hide Search",
            render: () => <EmojiPicker searchable={false} recent={["\uD83D\uDD25", "\uD83D\uDCAF", "\uD83D\uDC4D", "\uD83C\uDF89", "\u2764\uFE0F"]} onSelect={() => { }}/>,
        },
        {
            name: "More compact (6 columns)",
            render: () => <EmojiPicker columns={6} className="w-60" onSelect={() => { }}/>,
        },
    ],
    renderWithProps: (p) => (<EmojiPicker columns={Number(p.columns) || 8} searchable={p.searchable as boolean} onSelect={() => { }}/>),
    toCode: (p) => `<EmojiPicker${Number(p.columns) !== 8 ? ` columns={${p.columns}}` : ""}${p.searchable === false ? " searchable={false}" : ""} onSelect={(e) => insert(e)} />`,
};
