"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Snippet } from "./snippet";

export const snippetShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "command", render: () => <Snippet>pnpm add @hulian/ui</Snippet> },
    { name: "no-symbol", render: () => <Snippet symbol={null}>const theme = useTheme()</Snippet> },
    { name: "long", render: () => <Snippet>pnpm --filter @hulian/ui build</Snippet> },
  ],
  renderWithProps: () => <Snippet>pnpm add @hulian/ui</Snippet>,
  toCode: () => `<Snippet>pnpm add @hulian/ui</Snippet>`,
};
