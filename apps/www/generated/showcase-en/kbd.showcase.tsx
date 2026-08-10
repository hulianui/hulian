"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Kbd } from "../../../../packages/ui/src/kbd/kbd";
export const kbdShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Single button",
            description: "Wraps a single key name and renders it as a bordered keycap style.",
            code: `<Kbd>Esc</Kbd>`,
            render: () => <Kbd>Esc</Kbd>,
        },
        {
            title: "Key combination",
            description: "The key combination is spelled out by placing multiple Kbd side by side, connected with separators in the middle.",
            code: `<span className="inline-flex items-center gap-1">
  <Kbd>\u2318</Kbd>
  <span className="text-muted-foreground">+</span>
  <Kbd>K</Kbd>
</span>`,
            render: () => (<span className="inline-flex items-center gap-1">
          <Kbd>⌘</Kbd>
          <span className="text-muted-foreground">+</span>
          <Kbd>K</Kbd>
        </span>),
        },
        {
            title: "Embed text",
            description: "The shortcut keys are shown in the text, and the keycaps are aligned with the text baseline.",
            code: `<span className="text-sm text-muted-foreground">
  Press <Kbd>\u2318</Kbd> <Kbd>S</Kbd> to save
</span>`,
            render: () => (<span className="text-sm text-muted-foreground">
          Press <Kbd>⌘</Kbd> <Kbd>S</Kbd> Save
        </span>),
        },
    ],
    controls: [],
    states: [
        { name: "single", render: () => <Kbd>Esc</Kbd> },
        {
            name: "combo",
            render: () => (<span className="inline-flex items-center gap-1">
          <Kbd>⌘</Kbd>
          <span className="text-muted-foreground">+</span>
          <Kbd>K</Kbd>
        </span>),
        },
        {
            name: "in-text",
            render: () => (<span className="text-sm text-muted-foreground">
          Press <Kbd>⌘</Kbd> <Kbd>S</Kbd> Save
        </span>),
        },
    ],
    renderWithProps: () => (<span className="inline-flex items-center gap-1">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </span>),
    toCode: () => `<Kbd>\u2318</Kbd> <Kbd>K</Kbd>`,
};
