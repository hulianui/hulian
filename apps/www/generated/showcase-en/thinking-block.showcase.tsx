"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ThinkingBlock } from "../../../../packages/ui/src/thinking-block/thinking-block";
const body = "The user should make the homepage 100% dogfood. First look at what components are used in the existing page.tsx, then check what replaceable typesetting/layout primitives are in the library, and finally replace them block by block and fill the gaps.";
export const thinkingBlockShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Completed reasoning: Click on the head to expand/collapse the thought chain.",
            code: `<ThinkingBlock duration="Thinking 3s">
  {reasoning}
</ThinkingBlock>`,
            render: () => (<div className="w-full max-w-lg">
          <ThinkingBlock duration="Thoughts 3s">{body}</ThinkingBlock>
        </div>),
        },
        {
            title: "Thinking",
            description: "When thinking, the title rotates + the highlight flows, and is expanded by default.",
            code: `<ThinkingBlock thinking>
  {reasoning}
</ThinkingBlock>`,
            render: () => (<div className="w-full max-w-lg">
          <ThinkingBlock thinking>{body}</ThinkingBlock>
        </div>),
        },
        {
            title: "Custom title",
            description: "title overrides the default \"Thinking Process\", duration marks time-consuming.",
            code: `<ThinkingBlock title="Planning task disassembly" duration="2.4s">
  {reasoning}
</ThinkingBlock>`,
            render: () => (<div className="w-full max-w-lg">
          <ThinkingBlock title="Planning task breakdown" duration="2.4s">
            {body}
          </ThinkingBlock>
        </div>),
        },
        {
            title: "Expand by default",
            description: "defaultOpen Make completed blocks also expand the text by default.",
            code: `<ThinkingBlock defaultOpen duration="Thinking 1s">
  {reasoning}
</ThinkingBlock>`,
            render: () => (<div className="w-full max-w-lg">
          <ThinkingBlock defaultOpen duration="Thoughts 1s">
            {body}
          </ThinkingBlock>
        </div>),
        },
    ],
    controls: [
        { prop: "title", type: "text", defaultValue: "Thought process" },
        { prop: "thinking", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "Completed (expandable)",
            render: () => (<div className="w-full max-w-lg">
          <ThinkingBlock duration="Thoughts 3s">{body}</ThinkingBlock>
        </div>),
        },
        {
            name: "Thinking (circle + highlight + default expansion)",
            render: () => (<div className="w-full max-w-lg">
          <ThinkingBlock thinking>{body}</ThinkingBlock>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-full max-w-lg">
      <ThinkingBlock title={p.title as string} thinking={p.thinking as boolean}>
        {body}
      </ThinkingBlock>
    </div>),
    toCode: (p) => `<ThinkingBlock${p.thinking ? " thinking" : ""}>{reasoning}</ThinkingBlock>`,
};
