"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { BorderBeam } from "../../../../packages/ui/src/border-beam";
import { Snippet, SnippetGroup } from "../../../../packages/ui/src/snippet/snippet";
export const snippetShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Single-line copyable command, with $ prompt and copy button on the right by default.",
            code: `<Snippet>pnpm add @hulianui/ui</Snippet>`,
            render: () => <Snippet>pnpm add @hulianui/ui</Snippet>,
        },
        {
            title: "No prompt (code snippet)",
            description: "symbol={null} removes the prompt and colors according to JS rules, suitable for pasting code snippets.",
            code: `<Snippet symbol={null}>const theme = useTheme()</Snippet>`,
            render: () => <Snippet symbol={null}>const theme = useTheme()</Snippet>,
        },
        {
            title: "Custom copy text",
            description: "text Specifies the actual copy content, which can be different from the display text.",
            code: `<Snippet text="pnpm --filter @hulianui/ui build">
  pnpm --filter ... build
</Snippet>`,
            render: () => (<Snippet text="pnpm --filter @hulianui/ui build">pnpm --filter ... build</Snippet>),
        },
        {
            title: "A set of getting-started steps (SnippetGroup)",
            description: "SnippetGroup stacks several commands in one card and draws the frame and separators; muted marks a secondary row; overlay holds a decorative layer such as BorderBeam.",
            code: `<SnippetGroup overlay={<BorderBeam size={120} duration={9} />}>
  <Snippet>pnpm add @hulianui/ui @hulianui/tokens</Snippet>
  <Snippet>npx @hulianui/mcp init-agent</Snippet>
  <Snippet symbol={null} highlight={false} muted>https://hulian.dev/start</Snippet>
</SnippetGroup>`,
            render: () => (<SnippetGroup overlay={<BorderBeam size={120} duration={9}/>} className="w-full max-w-md">
          <Snippet>pnpm add @hulianui/ui @hulianui/tokens</Snippet>
          <Snippet>npx @hulianui/mcp init-agent</Snippet>
          <Snippet symbol={null} highlight={false} muted>
            https://hulian.dev/start
          </Snippet>
        </SnippetGroup>),
        },
    ],
    controls: [],
    states: [
        { name: "command", render: () => <Snippet>pnpm add @hulianui/ui</Snippet> },
        { name: "no-symbol", render: () => <Snippet symbol={null}>const theme = useTheme()</Snippet> },
        { name: "long", render: () => <Snippet>pnpm --filter @hulianui/ui build</Snippet> },
    ],
    renderWithProps: () => <Snippet>pnpm add @hulianui/ui</Snippet>,
    toCode: () => `<Snippet>pnpm add @hulianui/ui</Snippet>`,
};
