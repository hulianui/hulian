"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Snippet } from "../../../../packages/ui/src/snippet/snippet";
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
