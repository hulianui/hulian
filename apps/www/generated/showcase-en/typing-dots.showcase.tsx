"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TypingDots } from "../../../../packages/ui/src/typing-dots/typing-dots";
export const typingDotsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Three-point staggered bouncing \"inputting\" indication (pure CSS\u00B7reduced-motion automatically stops, role=status screen reading broadcast).",
            code: `<TypingDots />`,
            render: () => <TypingDots />,
        },
        {
            title: "Inside the bubble",
            description: "Put it into the surface bubble, which is equivalent to occupying a place in the generation of the ChatMessage loading state.",
            code: `<span className="inline-flex rounded-[var(--radius)] bg-surface px-3.5 py-2.5">
  <TypingDots />
</span>`,
            render: () => (<span className="inline-flex rounded-[var(--radius)] bg-surface px-3.5 py-2.5">
          <TypingDots />
        </span>),
        },
        {
            title: "Accessibility Label",
            description: "label covers the screen reading copy (default is \"typing\").",
            code: `<TypingDots label="Hulian AI is thinking" />`,
            render: () => <TypingDots label="Hulian AI is thinking"/>,
        },
    ],
    controls: [{ prop: "label", type: "text", defaultValue: "Entering", label: "Accessibility Label" }],
    states: [
        { name: "default", render: () => <TypingDots /> },
        {
            name: "Inside the bubble",
            render: () => (<span className="inline-flex rounded-[var(--radius)] bg-surface px-3.5 py-2.5">
          <TypingDots />
        </span>),
        },
    ],
    renderWithProps: (p) => <TypingDots label={p.label as string}/>,
    toCode: () => `<TypingDots />`,
};
